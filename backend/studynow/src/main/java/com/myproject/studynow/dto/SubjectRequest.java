package com.myproject.studynow.dto;

import com.myproject.studynow.entity.Priority;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubjectRequest {
    private String name;
    private String description;
    private Priority priority;
    private int weeklyHours;
    private LocalDate finishDay;
    private LocalDateTime createdAt;

}
