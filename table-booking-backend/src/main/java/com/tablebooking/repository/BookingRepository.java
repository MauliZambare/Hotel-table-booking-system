package com.tablebooking.repository;

import com.tablebooking.entity.Booking;
import com.tablebooking.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    boolean existsByRestaurantTable_IdAndBookingDateAndBookingTimeAndStatusIn(
            Long tableId, LocalDate bookingDate, LocalTime bookingTime, List<BookingStatus> statuses);
    List<Booking> findAllByOrderByBookingDateAscBookingTimeAsc();
}