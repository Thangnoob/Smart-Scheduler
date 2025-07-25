package com.myproject.studynow.dto;

import com.myproject.studynow.entity.Priority;
import com.myproject.studynow.entity.StudySession;
import com.myproject.studynow.entity.Subject;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudySessionDTO {
    private Long id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int duration;
    private boolean isCompleted;

    private Long subjectId;
    private String subjectName;
    private Priority priority;

}
