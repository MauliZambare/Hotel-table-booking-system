package com.tablebooking.service;

import com.tablebooking.dto.BookingRequest;
import com.tablebooking.dto.BookingResponse;
import com.tablebooking.entity.Booking;
import com.tablebooking.entity.BookingStatus;
import com.tablebooking.entity.RestaurantTable;
import com.tablebooking.exception.ConflictException;
import com.tablebooking.exception.ResourceNotFoundException;
import com.tablebooking.repository.BookingRepository;
import com.tablebooking.repository.RestaurantTableRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RestaurantTableRepository tableRepository;

    public BookingService(BookingRepository bookingRepository, RestaurantTableRepository tableRepository) {
        this.bookingRepository = bookingRepository;
        this.tableRepository = tableRepository;
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> findAll() {
        return bookingRepository.findAllByOrderByBookingDateAscBookingTimeAsc()
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public BookingResponse findById(Long id) {
        return toResponse(getBooking(id));
    }

    @Transactional
    public BookingResponse create(BookingRequest request) {
        RestaurantTable table = tableRepository.findById(request.tableId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Restaurant table " + request.tableId() + " was not found."));

        if (table.getStatus() != com.tablebooking.entity.TableStatus.AVAILABLE) {
            throw new ConflictException("This table is not available for booking.");
        }

        if (request.numberOfPeople() > table.getCapacity()) {
            throw new IllegalArgumentException("This table can accommodate only " + table.getCapacity() + " people.");
        }

        if (request.bookingDate() == null || request.bookingDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Booking date cannot be in the past.");
        }
        if (request.bookingTime() == null) {
            throw new IllegalArgumentException("Booking time is required.");
        }

        boolean slotTaken = bookingRepository.existsByRestaurantTable_IdAndBookingDateAndBookingTimeAndStatusIn(
                table.getId(), request.bookingDate(), request.bookingTime(),
                List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED));
        if (slotTaken) {
            throw new ConflictException("This table is already booked for the selected date and time.");
        }

        Booking booking = new Booking();
        booking.setCustomerName(request.customerName().trim());
        booking.setPhone(request.phone().trim());
        booking.setEmail(request.email().trim().toLowerCase());
        booking.setBookingDate(request.bookingDate());
        booking.setBookingTime(request.bookingTime());
        booking.setNumberOfPeople(request.numberOfPeople());
        booking.setStatus(BookingStatus.PENDING);
        booking.setRestaurantTable(table);
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse updateStatus(Long id, BookingStatus status) {
        Booking booking = getBooking(id);
        booking.setStatus(status);
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public void delete(Long id) {
        bookingRepository.delete(getBooking(id));
    }

    private Booking getBooking(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking " + id + " was not found."));
    }

    private BookingResponse toResponse(Booking booking) {
        RestaurantTable table = booking.getRestaurantTable();
        return new BookingResponse(
                booking.getId(), booking.getCustomerName(), booking.getPhone(), booking.getEmail(),
                booking.getBookingDate(), booking.getBookingTime(), booking.getNumberOfPeople(),
                booking.getStatus(), table.getId(), table.getTableNumber());
    }
}