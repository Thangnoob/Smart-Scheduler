package com.myproject.studynow.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "study_sessions")
public class StudySession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    @JsonBackReference(value = "user-session")
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "subject_id")
    @JsonBackReference(value = "subject-session")
    private Subject subject;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "duration", nullable = false)
    private int duration; // in minutes

    @Column(name = "is_completed")
    private boolean isCompleted = false;

    //(có thể null nên sử dụng Integer để phân biệt trong data, cũng như so sánh)
    @Column(name = "actual_minutes")
    private Integer actualMinutes; // số phút thực tế học

    @Column(name = "completed_pomodoros")
    private Integer completedPomodoros; // số pomodoro hoàn thành


    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

}
