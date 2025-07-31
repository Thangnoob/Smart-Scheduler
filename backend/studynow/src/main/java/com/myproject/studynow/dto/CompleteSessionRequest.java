package com.myproject.studynow.dto;

import lombok.Data;

@Data
public class CompleteSessionRequest {
    private int actualMinutes;
    private int completedPomodoros;
}
