package com.tablebooking.dto;

import com.tablebooking.entity.BookingStatus;
import jakarta.validation.constraints.NotNull;

public record BookingStatusRequest(@NotNull BookingStatus status) {
}