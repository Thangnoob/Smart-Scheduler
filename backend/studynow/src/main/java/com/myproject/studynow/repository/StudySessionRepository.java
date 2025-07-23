package com.myproject.studynow.repository;

import com.myproject.studynow.entity.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, Long> {

    List<StudySession> findByUserId(Long userId);

    List<StudySession> findByUserIdAndIsCompleted(Long userId, boolean isCompleted);

    @Query("SELECT s FROM StudySession s WHERE s.user.id = :userId AND s.startTime >= :startTime AND s.endTime <= :endTime")
    List<StudySession> findByUserIdAndTimeRange(Long userId, LocalDateTime startTime, LocalDateTime endTime);

    @Query("SELECT s FROM StudySession s WHERE s.subject.id = :subjectId ORDER BY s.startTime")
    List<StudySession> findBySubjectIdOrderByStartTime(Long subjectId);
}