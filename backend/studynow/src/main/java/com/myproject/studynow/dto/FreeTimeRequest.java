package com.myproject.studynow.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.time.LocalTime;

@Data
public class FreeTimeRequest {

    @Min(1)
    @Max(7)
    private int dayOfWeek;

    private LocalTime startTime;

    private LocalTime endTime;
}
