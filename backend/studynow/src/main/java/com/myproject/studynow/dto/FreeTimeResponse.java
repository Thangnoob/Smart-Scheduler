package com.myproject.studynow.dto;

import com.myproject.studynow.entity.FreeTime;
import lombok.Data;

import java.time.LocalTime;

@Data
public class FreeTimeResponse {
    private Long id;
    private int dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;

    public FreeTimeResponse(FreeTime freeTime) {
        this.id = freeTime.getId();
        this.dayOfWeek = freeTime.getDayOfWeek();
        this.startTime = freeTime.getStartTime();
        this.endTime = freeTime.getEndTime();
    }

    public static FreeTimeResponse from(FreeTime freeTime) {
        return new FreeTimeResponse(freeTime);
    }
}
