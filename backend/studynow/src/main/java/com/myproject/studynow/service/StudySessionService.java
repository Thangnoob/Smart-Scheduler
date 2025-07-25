package com.myproject.studynow.service;

import com.myproject.studynow.entity.StudySession;

import java.util.List;

public interface StudySessionService {
    List<StudySession> getStudySessionThisWeek(Long userId);
}
