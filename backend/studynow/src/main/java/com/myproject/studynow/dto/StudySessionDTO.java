package com.myproject.studynow.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudySessionDTO {
    private Long id;
    private String subjectName;
    private String subjectDescription;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int duration;
    private boolean isCompleted;
    private String priority;
}