package com.myproject.studynow.repository;

import com.myproject.studynow.entity.FreeTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FreeTimeRepository extends JpaRepository<FreeTime, Long> {
    List<FreeTime> findByUserId(Long userId);
}
