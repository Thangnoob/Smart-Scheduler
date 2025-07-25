package com.myproject.studynow.dto;

import com.myproject.studynow.entity.Priority;
import com.myproject.studynow.entity.Subject;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class SubjectResponse {
    private Long id;
    private String name;
    private String description;
    private Priority priority;
    private int weeklyHours;
    private LocalDate finishDay;
    private LocalDateTime createdAt;

    public SubjectResponse(Subject subject) {
        this.id = subject.getId();
        this.name = subject.getName();
        this.description = subject.getDescription();
        this.priority = subject.getPriority();
        this.finishDay = subject.getFinishDay();
        this.createdAt = subject.getCreatedAt();
    }

    public static SubjectResponse from(Subject subject) {
        return new SubjectResponse(subject);
    }


}
