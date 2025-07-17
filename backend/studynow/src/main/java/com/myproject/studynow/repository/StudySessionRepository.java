package com.myproject.studynow.repository;

import com.myproject.studynow.entity.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudySessionRepository extends JpaRepository<StudySession, Long> {
    List<StudySession> findByUserId(Long userId);
    List<StudySession> findBySubjectId(Long subjectId);
}