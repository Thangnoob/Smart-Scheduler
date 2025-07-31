package com.myproject.studynow.repository;

import com.myproject.studynow.entity.FreeTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;

@Repository
public interface FreeTimeRepository extends JpaRepository<FreeTime, Long> {
    List<FreeTime> findByUserId(Long userId);
    List<FreeTime> findByUserIdAndDayOfWeek(Long userId, int dayOfWeek);
    boolean existsByUserIdAndStartTimeBetween(Long userId, LocalTime localTime, LocalTime localTime1);
}
