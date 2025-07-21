package com.myproject.studynow.service.impl;

import com.myproject.studynow.dto.FreeTimeRequest;
import com.myproject.studynow.entity.FreeTime;
import com.myproject.studynow.entity.User;
import com.myproject.studynow.exception.FreeTimeNotFoundException;
import com.myproject.studynow.repository.FreeTimeRepository;
import com.myproject.studynow.repository.UserRepository;
import com.myproject.studynow.service.FreeTimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FreeTimeServiceImpl implements FreeTimeService {

    private final FreeTimeRepository freeTimeRepository;

    private final UserRepository userRepository;

    @Override
    public List<FreeTime> getAllFreeTimeByUserId(Long userId) {
        return freeTimeRepository.findByUserId(userId);
    }

    @Override
    public FreeTime getFreeTimeById(Long id) {
        Long userId = getCurrentUserId();
        FreeTime freeTime = freeTimeRepository.findById(id)
                .orElseThrow(() -> new FreeTimeNotFoundException("Không tìm thấy khoảng thời gian rảnh"));

        if (!freeTime.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền truy cập thời gian rảnh này");
        }

        return freeTime;
    }

    @Override
    public FreeTime createFreeTime(FreeTime newSlot) {
        Long userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        newSlot.setUser(user);

        // Tìm các slot đã tồn tại của user vào ngày đó
        List<FreeTime> existingSlots = freeTimeRepository.findByUserIdAndDayOfWeek(userId, newSlot.getDayOfWeek());

        for (FreeTime existing : existingSlots) {
            // Nếu slot mới nằm trong slot cũ
            boolean isWithin = !newSlot.getStartTime().isBefore(existing.getStartTime()) &&
                    !newSlot.getEndTime().isAfter(existing.getEndTime());

            if (isWithin) {
                // Không cần thêm mới vì đã nằm trong khoảng cũ
                return existing;
            }

            // Nếu có chồng lấn thì cập nhật lại slot cũ
            boolean isOverlap = newSlot.getStartTime().isBefore(existing.getEndTime()) &&
                    newSlot.getEndTime().isAfter(existing.getStartTime());

            if (isOverlap) {
                existing.setStartTime(
                        newSlot.getStartTime().isBefore(existing.getStartTime())
                                ? newSlot.getStartTime()
                                : existing.getStartTime()
                );
                existing.setEndTime(
                        newSlot.getEndTime().isAfter(existing.getEndTime())
                                ? newSlot.getEndTime()
                                : existing.getEndTime()
                );
                return freeTimeRepository.save(existing);
            }
        }

        // Không trùng -> thêm mới
        return freeTimeRepository.save(newSlot);
    }


    @Override
    public FreeTime updateFreeTime(Long id, FreeTimeRequest updated) {
        Long userId = getCurrentUserId();
        FreeTime existing = freeTimeRepository.findById(id)
                .orElseThrow(() -> new FreeTimeNotFoundException("Không tìm thấy thời gian rảnh"));

        if (!existing.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền chỉnh sửa thời gian rảnh này");
        }

        // Cập nhật thông tin
        existing.setDayOfWeek(updated.getDayOfWeek());
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());

        return freeTimeRepository.save(existing);
    }

    @Override
    public void deleteFreeTime(Long id) {
        Long userId = getCurrentUserId();
        FreeTime freeTime = freeTimeRepository.findById(id)
                .orElseThrow(() -> new FreeTimeNotFoundException("Không tìm thấy thời gian rảnh"));

        if (!freeTime.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền xóa thời gian rảnh này");
        }

        freeTimeRepository.deleteById(id);
    }

    private Long getCurrentUserId() {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return currentUser.getId();
    }
}
