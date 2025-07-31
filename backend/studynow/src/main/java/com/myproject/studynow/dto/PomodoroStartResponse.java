package com.myproject.studynow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PomodoroStartResponse {
    private Long sessionId;
    private String subjectName;
    private int totalDuration; // phút
    private int pomodoroDuration; // phút
    private int shortBreak; // phút
    private int longBreak; // phút
    private int totalPomodoros;
    private int remainingMinutes;
}
