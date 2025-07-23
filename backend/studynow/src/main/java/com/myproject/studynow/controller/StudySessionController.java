package com.myproject.studynow.controller;

import com.myproject.studynow.entity.StudySession;
import com.myproject.studynow.entity.User;
import com.myproject.studynow.service.StudySessionSchedulerService;
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

    private final StudySessionSchedulerService schedulerService;

    @PostMapping("/generate")
    public ResponseEntity<List<StudySession>> generateStudySessions(
            @RequestParam(defaultValue = "7") int daysAhead) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = getCurrentUserId(auth);

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

    private Long getCurrentUserId(Authentication auth) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return currentUser.getId();
    }
}