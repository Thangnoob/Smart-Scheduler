package com.myproject.studynow.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserRequest {
    private String email;
    private String name;
    private String avatar;
    private int points;
    private LocalDateTime createdAt;
}
