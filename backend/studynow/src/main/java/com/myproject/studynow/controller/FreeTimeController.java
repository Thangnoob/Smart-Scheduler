package com.myproject.studynow.controller;

import com.myproject.studynow.dto.FreeTimeRequest;
import com.myproject.studynow.dto.FreeTimeResponse;
import com.myproject.studynow.entity.FreeTime;
import com.myproject.studynow.entity.User;
import com.myproject.studynow.exception.FreeTimeAlreadyExistException;
import com.myproject.studynow.exception.FreeTimeNotFoundException;
import com.myproject.studynow.exception.SubjectAlreadyExistException;
import com.myproject.studynow.service.FreeTimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/free-times")
@RequiredArgsConstructor
public class FreeTimeController {

    private final FreeTimeService freeTimeService;

    @GetMapping
    public ResponseEntity<List<FreeTimeResponse>> getAllFreeTimes() {
        Long userId = getCurrentUserId().getId();
        List<FreeTime> freeTimes = freeTimeService.getAllFreeTimeByUserId(userId);
        List<FreeTimeResponse> responses = freeTimes.stream()
                .map(FreeTimeResponse::from)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    public ResponseEntity<FreeTimeResponse> createFreeTime(@RequestBody FreeTime freeTime) {
        freeTime.setUser(getCurrentUserId());
        FreeTime created = freeTimeService.createFreeTime(freeTime);
        return ResponseEntity.ok(new FreeTimeResponse(created));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFreeTime(@PathVariable Long id) {
        freeTimeService.deleteFreeTime(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateFreeTime(@PathVariable Long id, @RequestBody FreeTimeRequest freeTimeRequest) {
        Long userId = getCurrentUserId().getId();
        try {
            FreeTime freeTime = freeTimeService.updateFreeTime(id, freeTimeRequest);
            return ResponseEntity.ok(new FreeTimeResponse(freeTime));
        } catch (FreeTimeNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (FreeTimeAlreadyExistException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private User getCurrentUserId() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
