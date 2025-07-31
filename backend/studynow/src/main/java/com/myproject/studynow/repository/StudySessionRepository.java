package com.myproject.studynow.repository;

import com.myproject.studynow.entity.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, Long> {
    Optional<StudySession> findByIdAndUserId(Long id, Long userId);

    List<StudySession> findByUserId(Long userId);

    @Modifying
    @Query("DELETE FROM StudySession s WHERE s.user.id = :userId AND s.startTime >= :start AND s.startTime <= :end")
    void deleteByUserIdAndTimeRange(Long userId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT s FROM StudySession s WHERE s.user.id = :userId AND s.startTime BETWEEN :start AND :end")
    List<StudySession> findByUserIdAndStartTimeBetween(@Param("userId") Long userId,
                                                       @Param("start") LocalDateTime start,
                                                       @Param("end") LocalDateTime end);

    List<StudySession> findByUserIdAndIsCompletedTrue(Long userId);
}