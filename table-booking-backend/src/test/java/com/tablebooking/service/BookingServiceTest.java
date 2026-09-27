package com.tablebooking.service;

import com.tablebooking.dto.BookingRequest;
import com.tablebooking.entity.Booking;
import com.tablebooking.entity.BookingStatus;
import com.tablebooking.entity.RestaurantTable;
import com.tablebooking.entity.TableStatus;
import com.tablebooking.exception.ConflictException;
import com.tablebooking.repository.BookingRepository;
import com.tablebooking.repository.RestaurantTableRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RestaurantTableRepository tableRepository;

    @Mock
    private EmailService emailService;

    private BookingService bookingService;
    private RestaurantTable table;

    @BeforeEach
    void setUp() {
        bookingService = new BookingService(bookingRepository, tableRepository, emailService);
        table = new RestaurantTable();
        table.setId(1L);
        table.setTableNumber(1);
        table.setCapacity(4);
        table.setStatus(TableStatus.AVAILABLE);
    }

    @Test
    void rejectsBookingWhenTableIsNotAvailable() {
        table.setStatus(TableStatus.BOOKED);

        assertThatThrownBy(() -> bookingService.create(request()))
                .isInstanceOf(ConflictException.class)
                .hasMessage("This table is not available for booking.");
    }

    @Test
    void rejectsBookingWhenCapacityIsTooSmall() {
        assertThatThrownBy(() -> bookingService.create(request(5)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("This table can accommodate only 4 people.");
    }

    @Test
    void rejectsBookingWhenSlotIsAlreadyTaken() {
        when(bookingRepository.existsByRestaurantTable_IdAndBookingDateAndBookingTimeAndStatusIn(
                eq(1L), any(), any(), any())).thenReturn(true);

        assertThatThrownBy(() -> bookingService.create(request()))
                .isInstanceOf(ConflictException.class)
                .hasMessage("This table is already booked for the selected date and time.");
    }

    @Test
    void sendsConfirmationEmailOnlyAfterStatusTransactionCommits() {
        Booking booking = booking();
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);
        TransactionSynchronizationManager.initSynchronization();

        try {
            bookingService.updateStatus(1L, BookingStatus.CONFIRMED);

            verify(bookingRepository).save(booking);
            verify(emailService, never()).sendBookingConfirmationEmail(booking);
            TransactionSynchronizationManager.getSynchronizations().forEach(sync -> sync.afterCommit());
            verify(emailService).sendBookingConfirmationEmail(booking);
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void sendsCancellationEmailOnlyAfterStatusTransactionCommits() {
        Booking booking = booking();
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);
        TransactionSynchronizationManager.initSynchronization();

        try {
            bookingService.updateStatus(1L, BookingStatus.CANCELLED);

            verify(bookingRepository).save(booking);
            verify(emailService, never()).sendBookingCancellationEmail(booking);
            TransactionSynchronizationManager.getSynchronizations().forEach(sync -> sync.afterCommit());
            verify(emailService).sendBookingCancellationEmail(booking);
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void doesNotSendEmailForPendingStatus() {
        Booking booking = booking();
        booking.setStatus(BookingStatus.PENDING);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);
        TransactionSynchronizationManager.initSynchronization();

        try {
            bookingService.updateStatus(1L, BookingStatus.PENDING);
            TransactionSynchronizationManager.getSynchronizations().forEach(sync -> sync.afterCommit());

            verify(emailService, never()).sendBookingConfirmationEmail(booking);
            verify(emailService, never()).sendBookingCancellationEmail(booking);
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    private Booking booking() {
        Booking booking = new Booking();
        booking.setId(1L);
        booking.setCustomerName("Customer");
        booking.setEmail("customer@example.com");
        booking.setBookingDate(LocalDate.now().plusDays(1));
        booking.setBookingTime(LocalTime.of(19, 0));
        booking.setNumberOfPeople(2);
        booking.setStatus(BookingStatus.PENDING);
        booking.setRestaurantTable(table);
        return booking;
    }

    private BookingRequest request() {
        return request(2);
    }

    private BookingRequest request(int numberOfPeople) {
        when(tableRepository.findById(1L)).thenReturn(Optional.of(table));
        return new BookingRequest(
                "Customer", "1234567890", "customer@example.com",
                LocalDate.now().plusDays(1), LocalTime.of(19, 0), numberOfPeople, 1L);
    }
}
