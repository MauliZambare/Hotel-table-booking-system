package com.tablebooking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;
import java.time.LocalTime;

public record BookingRequest(
        @NotBlank String customerName,
        @NotBlank @Pattern(regexp = "[0-9+() -]{7,30}") String phone,
        @NotBlank @Email String email,
        @NotNull LocalDate bookingDate,
        @NotNull(message = "Booking time is required.") LocalTime bookingTime,
        @NotNull @Positive Integer numberOfPeople,
        @NotNull @Positive Long tableId
) {
}