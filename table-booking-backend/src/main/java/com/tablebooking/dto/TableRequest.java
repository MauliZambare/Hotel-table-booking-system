package com.tablebooking.dto;

import com.tablebooking.entity.TableStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record TableRequest(
        @NotNull @Positive Integer tableNumber,
        @NotNull @Positive Integer capacity,
        @NotNull TableStatus status
) {
}