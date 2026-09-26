package com.tablebooking.dto;

import com.tablebooking.entity.BookingStatus;

import java.time.LocalDate;
import java.time.LocalTime;

public record BookingResponse(
        Long id,
        String customerName,
        String phone,
        String email,
        LocalDate bookingDate,
        LocalTime bookingTime,
        Integer numberOfPeople,
        BookingStatus status,
        Long tableId,
        Integer tableNumber
) {
}