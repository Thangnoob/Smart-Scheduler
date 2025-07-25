package com.myproject.studynow.controller;

import com.myproject.studynow.dto.StudySessionDTO;
import com.myproject.studynow.entity.StudySession;
import com.myproject.studynow.entity.User;
import com.myproject.studynow.service.impl.StudySessionServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/study-sessions")
@RequiredArgsConstructor
public class StudySessionController {

    private final StudySessionServiceImpl schedulerService;

    private StudySessionDTO toDTO(StudySession session) {
        return new StudySessionDTO(
                session.getId(),
                session.getStartTime(),
                session.getEndTime(),
                session.getDuration(),
                session.isCompleted(),
                session.getSubject().getId(),
                session.getSubject().getName(),
                session.getSubject().getPriority()
        );
    }

    @GetMapping
    public ResponseEntity<List<StudySessionDTO>> getAllStudySessions() {
        Long userId = getCurrentUserId();
        List<StudySession> studySessions = schedulerService.getStudySessionByUserId(userId);
        List<StudySessionDTO> dtos = studySessions.stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/this-week")
    public ResponseEntity<List<StudySessionDTO>> getStudySessionsThisWeek() {
        Long userId = getCurrentUserId();
        List<StudySession> studySessions = schedulerService.getStudySessionThisWeek(userId);
        List<StudySessionDTO> dtos = studySessions.stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }


    @PostMapping("/generate")
    public ResponseEntity<List<StudySession>> generateStudySessions(
            @RequestParam(defaultValue = "7") int daysAhead) {

        Long userId = getCurrentUserId();

        List<StudySession> sessions = schedulerService.generateStudySessionsForUser(userId, daysAhead);

        return ResponseEntity.ok(sessions);
    }

    @PostMapping("/generate/{userId}")
    public ResponseEntity<List<StudySession>> generateStudySessionsForUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "7") int daysAhead) {

        List<StudySession> sessions = schedulerService.generateStudySessionsForUser(userId, daysAhead);

        return ResponseEntity.ok(sessions);
    }

    private Long getCurrentUserId() {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return currentUser.getId();
    }
}