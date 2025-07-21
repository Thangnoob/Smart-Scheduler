package com.myproject.studynow.service.impl;

import com.myproject.studynow.dto.SubjectRequest;
import com.myproject.studynow.entity.Subject;
import com.myproject.studynow.entity.User;
import com.myproject.studynow.exception.SubjectAlreadyExistException;
import com.myproject.studynow.exception.SubjectNotExistException;
import com.myproject.studynow.repository.SubjectRepository;
import com.myproject.studynow.service.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SubjectServiceImpl implements SubjectService {


    private final SubjectRepository subjectRepository;

    @Override
    public List<Subject> getAllSubjects(Long userId) {
        return subjectRepository.findByUserId(userId);
    }

    @Override
    public Optional<Subject> getSubjectById(Long id, Long userId) {
        return subjectRepository.findByIdAndUserId(id, userId);
    }

    @Override
    public Subject createSubject(Subject subject) {
        Long userId = getCurrentUserId();
        if (subject.getUser() == null || !subject.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Thông tin người dùng không hợp lệ");
        }
        if (subjectRepository.existsByNameAndUserId(subject.getName(), userId)) {
            throw new SubjectAlreadyExistException("Môn học đã tồn tại");
        }

        return subjectRepository.save(subject);
    }

    @Override
    public Subject updateSubject(Long subjectId, SubjectRequest updatedSubject) {
        Long userId = getCurrentUserId();

        Subject existingSubject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new SubjectNotExistException("Không tìm thấy môn học"));

        // Kiểm tra người dùng có quyền chỉnh sửa
        if (!existingSubject.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền chỉnh sửa môn học này");
        }

        // Kiểm tra trùng tên với môn học khác (nếu tên thay đổi)
        if (!existingSubject.getName().equals(updatedSubject.getName())) {
            boolean isDuplicate = subjectRepository.existsByNameAndUserId(updatedSubject.getName(), userId);
            if (isDuplicate) {
                throw new SubjectAlreadyExistException("Môn học đã tồn tại");
            }
        }

        // Cập nhật dữ liệu
        existingSubject.setName(updatedSubject.getName());
        existingSubject.setDescription(updatedSubject.getDescription());
        existingSubject.setPriority(updatedSubject.getPriority());
        existingSubject.setWeeklyHours(updatedSubject.getWeeklyHours());
        existingSubject.setFinishDay(updatedSubject.getFinishDay());

        return subjectRepository.save(existingSubject);
    }


    @Override
    public void deleteSubject(Long id) {
        Long userId = getCurrentUserId();
        Subject subject = subjectRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> {
                    return new SubjectNotExistException("Môn học không tồn tại");
                });
        subjectRepository.deleteById(id);
    }

    private Long getCurrentUserId() {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return currentUser.getId();
    }
}