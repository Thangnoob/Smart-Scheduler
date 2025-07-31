package com.myproject.studynow.service;

import com.myproject.studynow.dto.FreeTimeRequest;
import com.myproject.studynow.entity.FreeTime;

import java.time.LocalDateTime;
import java.util.List;

public interface FreeTimeService {
    List<FreeTime> getAllFreeTimeByUserId(Long userId);
    FreeTime getFreeTimeById(Long id);
    FreeTime createFreeTime(FreeTime freeTime);
    FreeTime updateFreeTime(Long id, FreeTimeRequest updated);
    void deleteFreeTime(Long id);
    boolean existsFreeTimeBetween(Long userId, LocalDateTime start, LocalDateTime end);
}
