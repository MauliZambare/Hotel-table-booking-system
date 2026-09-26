package com.tablebooking.service;

import com.tablebooking.dto.BookingRequest;
import com.tablebooking.entity.Booking;
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

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RestaurantTableRepository tableRepository;

    private BookingService bookingService;
    private RestaurantTable table;

    @BeforeEach
    void setUp() {
        bookingService = new BookingService(bookingRepository, tableRepository);
        table = new RestaurantTable();
        table.setId(1L);
        table.setTableNumber(1);
        table.setCapacity(4);
        table.setStatus(TableStatus.AVAILABLE);
        when(tableRepository.findById(1L)).thenReturn(Optional.of(table));
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

    private BookingRequest request() {
        return request(2);
    }

    private BookingRequest request(int numberOfPeople) {
        return new BookingRequest(
                "Customer", "1234567890", "customer@example.com",
                LocalDate.now().plusDays(1), LocalTime.of(19, 0), numberOfPeople, 1L);
    }
}
