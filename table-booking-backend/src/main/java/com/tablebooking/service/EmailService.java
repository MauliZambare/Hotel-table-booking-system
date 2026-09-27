package com.tablebooking.service;

import com.tablebooking.entity.Booking;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String senderEmail;

    public EmailService(JavaMailSender mailSender, @Value("${spring.mail.username}") String senderEmail) {
        this.mailSender = mailSender;
        this.senderEmail = senderEmail;
    }

    public void sendBookingConfirmationEmail(Booking booking) {
        sendBookingStatusEmail(booking, "Table Booking Confirmed", "Your table booking has been confirmed successfully.",
                "Thank you for choosing our restaurant.", "CONFIRMED");
    }

    public void sendBookingCancellationEmail(Booking booking) {
        sendBookingStatusEmail(booking, "Table Booking Cancelled", "Your table booking has been cancelled.",
                "If you have any questions, please contact the restaurant.", "CANCELLED");
    }

    private void sendBookingStatusEmail(Booking booking, String subject, String message, String closing, String status) {
        SimpleMailMessage email = new SimpleMailMessage();
        email.setFrom(senderEmail);
        email.setTo(booking.getEmail());
        email.setSubject(subject);
        email.setText("Hello " + booking.getCustomerName() + ",\n\n"
                + message + "\n\n"
                + "Booking Details:\n\n"
                + "Table Number: " + booking.getRestaurantTable().getTableNumber() + "\n"
                + "Date: " + booking.getBookingDate() + "\n"
                + "Time: " + booking.getBookingTime() + "\n"
                + "Number of People: " + booking.getNumberOfPeople() + "\n"
                + "Status: " + status + "\n\n"
                + closing + "\n\n"
                + "Regards,\n"
                + "Table Booking System");
        mailSender.send(email);
    }
}