package com.myproject.studynow.dto;

import lombok.Data;

import java.time.LocalTime;

@Data
public class FreeTimeRequest {

    private int dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private Long userId;
}
