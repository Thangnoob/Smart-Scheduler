package com.myproject.studynow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CompleteSessionResponse {
    private String message;
    private Long sessionId;
    private int plannedMinutes;
    private int actualMinutes;
    private int completedPomodoros;
    private double efficiency;
}
