package com.myproject.studynow.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StudySessionRequest {
    private Long id;
    private Long userId;
    private Long subjectId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int duration;
    private boolean isCompleted;
    private LocalDateTime createdAt;
}
