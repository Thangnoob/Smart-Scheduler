package com.myproject.studynow.controller;

import com.myproject.studynow.dto.*;
import com.myproject.studynow.entity.StudySession;
import com.myproject.studynow.entity.Subject;
import com.myproject.studynow.entity.User;
import com.myproject.studynow.service.FreeTimeService;
import com.myproject.studynow.service.StudySessionService;
import com.myproject.studynow.service.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/study-sessions")
@RequiredArgsConstructor
public class StudySessionController {

    private final StudySessionService studySessionService;

    private final FreeTimeService freeTimeService;

    private final SubjectService subjectService;

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

    private Long getCurrentUserId() {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return currentUser.getId();
    }

    @GetMapping
    public ResponseEntity<List<StudySessionDTO>> getAllStudySessions() {
        Long userId = getCurrentUserId();
        List<StudySession> studySessions = studySessionService.getStudySessionByUserId(userId);
        List<StudySessionDTO> dtos = studySessions.stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<StudySessionDTO> createStudySession(@RequestBody StudySessionRequest request) {
        Long userId = getCurrentUserId();

        StudySession newSession = studySessionService.createStudySession(userId, request);
        return ResponseEntity.ok(toDTO(newSession));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudySessionDTO> updateStudySession(
            @PathVariable Long id,
            @RequestBody StudySessionRequest request) {
        Long userId = getCurrentUserId();

        StudySession updatedSession = studySessionService.updateStudySession(id, userId, request);
        return ResponseEntity.ok(toDTO(updatedSession));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudySession(@PathVariable Long id) {
        Long userId = getCurrentUserId();

        studySessionService.deleteStudySession(id, userId);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/this-week")
    public ResponseEntity<List<StudySessionDTO>> getStudySessionsThisWeek() {
        Long userId = getCurrentUserId();
        List<StudySession> studySessions = studySessionService.getStudySessionThisWeek(userId);
        List<StudySessionDTO> dtos = studySessions.stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/week")
    public ResponseEntity<List<StudySessionDTO>> getStudySessionsForWeek(
            @RequestParam(defaultValue = "0") int offset) {
        Long userId = getCurrentUserId();
        List<StudySession> studySessions = studySessionService.getStudySessionsForWeek(userId, LocalDate.now(), offset);
        List<StudySessionDTO> dtos = studySessions.stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/today")
    public ResponseEntity<List<StudySessionDTO>> getTodayStudySessions() {
        Long userId = getCurrentUserId();
        List<StudySession> studySessions = studySessionService.getTodayStudySessions(userId);
        List<StudySessionDTO> dtos = studySessions.stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }


    @PostMapping("/generate")
    public ResponseEntity<?> generateStudySessions(
            @RequestParam(defaultValue = "7") int daysAhead) {

        Long userId = getCurrentUserId();

        // Kiểm tra free time
        boolean hasFreeTime = freeTimeService.getAllFreeTimeByUserId(userId).isEmpty();
        if (hasFreeTime) {
            return ResponseEntity.badRequest().body("Không tìm thấy thời gian rảnh trong tuần.");
        }

        boolean hasSubject = subjectService.getAllSubjects(userId).isEmpty();
        if (hasSubject) {
            return ResponseEntity.badRequest().body("Không thể tạo lịch do thiếu môn học.");
        }

        List<StudySession> sessions = studySessionService.generateStudySessionsForUser(userId, daysAhead);
        return ResponseEntity.ok(sessions);
    }


    @PostMapping("/generate/{userId}")
    public ResponseEntity<List<StudySession>> generateStudySessionsForUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "7") int daysAhead) {

        List<StudySession> sessions = studySessionService.generateStudySessionsForUser(userId, daysAhead);

        return ResponseEntity.ok(sessions);
    }

    @PostMapping("/{id}/start")
    public PomodoroStartResponse startSession(
            @PathVariable Long id) {
        Long userId = getCurrentUserId();
        return studySessionService.startSession(id, userId);
    }

    @PatchMapping("/{id}/complete")
    public CompleteSessionResponse completeSession(
            @PathVariable Long id,
            @RequestBody CompleteSessionRequest request
    ) {
        Long userId = getCurrentUserId();
        return studySessionService.completeSession(id, userId, request);
    }

    @GetMapping("/completed/user")
    public List<StudySession> getCompletedSessionsByUser() {
        Long userId = getCurrentUserId();
        return studySessionService.getCompletedSessionsByUser(userId);
    }
}