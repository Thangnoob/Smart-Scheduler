package com.myproject.studynow.controller;

import com.myproject.studynow.dto.SubjectRequest;
import com.myproject.studynow.dto.SubjectResponse;
import com.myproject.studynow.entity.Subject;
import com.myproject.studynow.entity.User;
import com.myproject.studynow.exception.SubjectAlreadyExistException;
import com.myproject.studynow.exception.SubjectNotExistException;
import com.myproject.studynow.service.SubjectService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping
    public ResponseEntity<List<SubjectResponse>> getAllSubjects() {
        Long userId = getCurrentUserId().getId();
        List<Subject> subjects = subjectService.getAllSubjects(userId);
        List<SubjectResponse> responseList = subjects.stream()
                .map(SubjectResponse::from)
                .toList();

        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubjectResponse> getSubjectById(@PathVariable Long id) {
        Long userId = getCurrentUserId().getId();
        return subjectService.getSubjectById(id, userId)
                .map(subject -> ResponseEntity.ok(new SubjectResponse(subject)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createSubject(@RequestBody SubjectRequest request) {
        Long userId = getCurrentUserId().getId();

        Subject subject = new Subject();
        subject.setName(request.getName());
        subject.setDescription(request.getDescription());
        subject.setPriority(request.getPriority());
        subject.setFinishDay(request.getFinishDay());
        subject.setUser(getCurrentUserId());

        try {
            Subject createdSubject = subjectService.createSubject(subject);
            SubjectResponse response = new SubjectResponse(createdSubject);
            return ResponseEntity.ok(response);
        } catch (SubjectAlreadyExistException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateSubject(@PathVariable Long id, @RequestBody SubjectRequest request) {
        Long userId = getCurrentUserId().getId();
        try {
            Subject updatedSubject = subjectService.updateSubject(id, request);
            return ResponseEntity.ok(new SubjectResponse(updatedSubject));
        } catch (SubjectNotExistException e) {
            return ResponseEntity.notFound().build();
        } catch (SubjectAlreadyExistException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id) {
        Long userId = getCurrentUserId().getId();
        try {
            subjectService.deleteSubject(id);
            return ResponseEntity.noContent().build();
        } catch (SubjectNotExistException e) {

            return ResponseEntity.notFound().build();
        }
    }

    private User getCurrentUserId() {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return currentUser;
    }


}