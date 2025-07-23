package com.myproject.studynow.mapper;

import com.myproject.studynow.dto.StudySessionDTO;
import com.myproject.studynow.entity.StudySession;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class StudySessionMapper {

    public StudySessionDTO toDTO(StudySession session) {
        return new StudySessionDTO(
                session.getId(),
                session.getSubject().getName(),
                session.getSubject().getDescription(),
                session.getStartTime(),
                session.getEndTime(),
                session.getDuration(),
                session.isCompleted(),
                session.getSubject().getPriority().name()
        );
    }

    public List<StudySessionDTO> toDTOList(List<StudySession> sessions) {
        return sessions.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}