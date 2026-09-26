package com.tablebooking.service;

import com.tablebooking.dto.UserLoginRequest;
import com.tablebooking.dto.UserRegisterRequest;
import com.tablebooking.dto.UserResponse;
import com.tablebooking.entity.Role;
import com.tablebooking.entity.User;
import com.tablebooking.exception.ConflictException;
import com.tablebooking.exception.UnauthorizedException;
import com.tablebooking.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public UserResponse register(UserRegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("An account with this email already exists.");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPassword(request.password());
        user.setPhone(request.phone().trim());
        user.setRole(Role.CUSTOMER);
        return toResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public UserResponse login(UserLoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .filter(foundUser -> foundUser.getPassword().equals(request.password()))
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));
        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getPhone(), user.getRole());
    }
}