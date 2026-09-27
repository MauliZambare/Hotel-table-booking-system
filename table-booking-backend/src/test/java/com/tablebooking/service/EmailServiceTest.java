package com.tablebooking.service;

import com.tablebooking.entity.Booking;
import com.tablebooking.entity.RestaurantTable;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    private EmailService emailService;
    private Booking booking;

    @BeforeEach
    void setUp() {
        emailService = new EmailService(mailSender, "maulizambare3@gmail.com");
        RestaurantTable table = new RestaurantTable();
        table.setTableNumber(7);

        booking = new Booking();
        booking.setCustomerName("Jordan Lee");
        booking.setEmail("jordan@example.com");
        booking.setBookingDate(LocalDate.of(2026, 10, 2));
        booking.setBookingTime(LocalTime.of(19, 30));
        booking.setNumberOfPeople(3);
        booking.setRestaurantTable(table);
    }

    @Test
    void sendsConfirmationWithBookingDetails() {
        emailService.sendBookingConfirmationEmail(booking);

        SimpleMailMessage message = capturedMessage();
        assertThat(message.getFrom()).isEqualTo("maulizambare3@gmail.com");
        assertThat(message.getTo()).containsExactly("jordan@example.com");
        assertThat(message.getSubject()).isEqualTo("Table Booking Confirmed");
        assertThat(message.getText())
                .contains("Hello Jordan Lee,")
                .contains("Table Number: 7")
                .contains("Date: 2026-10-02")
                .contains("Time: 19:30")
                .contains("Number of People: 3")
                .contains("Status: CONFIRMED");
    }

    @Test
    void sendsCancellationWithBookingDetails() {
        emailService.sendBookingCancellationEmail(booking);

        SimpleMailMessage message = capturedMessage();
        assertThat(message.getFrom()).isEqualTo("maulizambare3@gmail.com");
        assertThat(message.getTo()).containsExactly("jordan@example.com");
        assertThat(message.getSubject()).isEqualTo("Table Booking Cancelled");
        assertThat(message.getText())
                .contains("Hello Jordan Lee,")
                .contains("Your table booking has been cancelled.")
                .contains("Table Number: 7")
                .contains("Status: CANCELLED")
                .contains("If you have any questions, please contact the restaurant.");
    }

    private SimpleMailMessage capturedMessage() {
        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(messageCaptor.capture());
        return messageCaptor.getValue();
    }
}