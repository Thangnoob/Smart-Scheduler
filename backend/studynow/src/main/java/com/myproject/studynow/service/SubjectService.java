package com.myproject.studynow.service;

import com.myproject.studynow.dto.SubjectRequest;
import com.myproject.studynow.entity.Subject;

import java.util.List;
import java.util.Optional;

public interface SubjectService {
    List<Subject> getAllSubjects(Long userId);

    Optional<Subject> getSubjectById(Long id, Long userId);

    Subject createSubject(Subject subject);

    Subject updateSubject(Long subjectId, SubjectRequest updateSubject);

    void deleteSubject(Long id);
}
