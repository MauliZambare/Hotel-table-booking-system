package com.tablebooking.dto;

import com.tablebooking.entity.Role;

public record UserResponse(Long id, String name, String email, String phone, Role role) {
}