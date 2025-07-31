package com.myproject.studynow.service;

import com.myproject.studynow.dto.*;
import com.myproject.studynow.entity.StudySession;
import com.myproject.studynow.entity.Subject;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StudySessionService {
    StudySession createStudySession(Long userId, StudySessionRequest request);
    StudySession updateStudySession(Long id, Long userId, StudySessionRequest request);
    void deleteStudySession(Long id, Long userId);
    StudySession getStudySessionByUserAndId(Long userId, Long sessionId);
    List<StudySession> getStudySessionByUserId(Long userId);
    List<StudySession> getStudySessionThisWeek(Long userId);
    List<StudySession> generateStudySessionsForUser(Long userId, int daysAhead);
    CompleteSessionResponse completeSession(Long sessionId, Long userId, CompleteSessionRequest request);
    PomodoroStartResponse startSession(Long sessionId, Long userId);
    List<StudySession> getStudySessionsForWeek(Long userId, LocalDate baseDate, int offset);
    List<StudySession> getCompletedSessionsByUser(Long userId);
    List<StudySession> getTodayStudySessions(Long userId);
 }
