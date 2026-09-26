package com.tablebooking.dto;

import com.tablebooking.entity.TableStatus;

public record TableResponse(Long id, Integer tableNumber, Integer capacity, TableStatus status) {
}