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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class BookingService {

    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);
    private static final Pattern PASSWORD_CREDENTIAL =
        Pattern.compile("(?i)(password|passwd|pwd)\\s*([=:])\\s*[^\\s,;]+");
    private static final Pattern SMTP_AUTH_PAYLOAD =
        Pattern.compile("(?i)(AUTH\\s+(?:PLAIN|LOGIN)\\s+)[A-Za-z0-9+/=]+");
    private static final Pattern URL_CREDENTIAL =
        Pattern.compile("(?i)(://[^:/@\\s]+:)[^@/\\s]+(@)");

    private final BookingRepository bookingRepository;
    private final RestaurantTableRepository tableRepository;
    private final EmailService emailService;

    public BookingService(BookingRepository bookingRepository, RestaurantTableRepository tableRepository,
                          EmailService emailService) {
        this.bookingRepository = bookingRepository;
        this.tableRepository = tableRepository;
        this.emailService = emailService;
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
        BookingStatus previousStatus = booking.getStatus();
        booking.setStatus(status);
        Booking savedBooking = bookingRepository.save(booking);
        if (previousStatus != status && (status == BookingStatus.CONFIRMED || status == BookingStatus.CANCELLED)) {
            registerStatusEmail(savedBooking, status);
        }
        return toResponse(savedBooking);
    }

    @Transactional
    public void delete(Long id) {
        bookingRepository.delete(getBooking(id));
    }

    private Booking getBooking(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking " + id + " was not found."));
    }

    private void registerStatusEmail(Booking booking, BookingStatus status) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                try {
                    if (status == BookingStatus.CONFIRMED) {
                        emailService.sendBookingConfirmationEmail(booking);
                    } else {
                        emailService.sendBookingCancellationEmail(booking);
                    }
                } catch (RuntimeException exception) {
                    Throwable rootCause = getRootCause(exception);
                    logger.warn("Could not send booking status email for booking {}: exception={} message='{}'; "
                                    + "rootCause={} rootMessage='{}'.",
                            booking.getId(), exception.getClass().getSimpleName(), safeMessage(exception.getMessage()),
                            rootCause.getClass().getSimpleName(), safeMessage(rootCause.getMessage()));
                }
            }
        });
    }

    private Throwable getRootCause(Throwable exception) {
        Throwable rootCause = exception;
        while (rootCause.getCause() != null && rootCause.getCause() != rootCause) {
            rootCause = rootCause.getCause();
        }
        return rootCause;
    }

    private String safeMessage(String message) {
        if (message == null) {
            return "<no message>";
        }

        String safeMessage = redactConfiguredValue(message, System.getenv("MAIL_PASSWORD"));
        safeMessage = redactConfiguredValue(safeMessage, System.getProperty("MAIL_PASSWORD"));
        safeMessage = redactConfiguredValue(safeMessage, System.getenv("MAIL_USERNAME"));
        safeMessage = redactConfiguredValue(safeMessage, System.getProperty("MAIL_USERNAME"));
        safeMessage = PASSWORD_CREDENTIAL.matcher(safeMessage).replaceAll("$1$2[REDACTED]");
        safeMessage = SMTP_AUTH_PAYLOAD.matcher(safeMessage).replaceAll("$1[REDACTED]");
        safeMessage = URL_CREDENTIAL.matcher(safeMessage).replaceAll("$1[REDACTED]$2");
        return safeMessage.replace('\r', ' ').replace('\n', ' ');
    }

    private String redactConfiguredValue(String message, String configuredValue) {
        if (configuredValue != null && !configuredValue.isBlank()) {
            return message.replace(configuredValue, "[REDACTED]");
        }
        return message;
    }

    private BookingResponse toResponse(Booking booking) {
        RestaurantTable table = booking.getRestaurantTable();
        return new BookingResponse(
                booking.getId(), booking.getCustomerName(), booking.getPhone(), booking.getEmail(),
                booking.getBookingDate(), booking.getBookingTime(), booking.getNumberOfPeople(),
                booking.getStatus(), table.getId(), table.getTableNumber());
    }
}