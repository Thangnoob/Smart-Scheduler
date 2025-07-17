package com.myproject.studynow.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SubjectRequest {
    private String name;
    private String description;
    private int priority;
    private int weeklyHours;
    private LocalDateTime createdAt;
    private Long userId;
}
