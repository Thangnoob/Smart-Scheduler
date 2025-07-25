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

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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

        List<FreeTime> existingSlots = freeTimeRepository.findByUserIdAndDayOfWeek(userId, newSlot.getDayOfWeek());
        List<FreeTime> toMerge = new ArrayList<>();

        LocalTime mergedStart = newSlot.getStartTime();
        LocalTime mergedEnd = newSlot.getEndTime();

        for (FreeTime existing : existingSlots) {
            boolean isAdjacentOrOverlap =
                    !mergedEnd.isBefore(existing.getStartTime()) &&
                            !mergedStart.isAfter(existing.getEndTime());

            if (isAdjacentOrOverlap) {
                // Gộp lại
                mergedStart = mergedStart.isBefore(existing.getStartTime()) ? mergedStart : existing.getStartTime();
                mergedEnd = mergedEnd.isAfter(existing.getEndTime()) ? mergedEnd : existing.getEndTime();
                toMerge.add(existing);
            }
        }

        // Nếu có khoảng nào bị gộp thì xoá
        if (!toMerge.isEmpty()) {
            freeTimeRepository.deleteAll(toMerge);
        }

        // Lưu slot mới đã gộp
        FreeTime mergedSlot = new FreeTime();
        mergedSlot.setUser(user);
        mergedSlot.setDayOfWeek(newSlot.getDayOfWeek());
        mergedSlot.setStartTime(mergedStart);
        mergedSlot.setEndTime(mergedEnd);

        return freeTimeRepository.save(mergedSlot);
    }



    @Override
    public FreeTime updateFreeTime(Long id, FreeTimeRequest updated) {
        Long userId = getCurrentUserId();

        FreeTime existing = freeTimeRepository.findById(id)
                .orElseThrow(() -> new FreeTimeNotFoundException("Không tìm thấy thời gian rảnh"));

        if (!existing.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền chỉnh sửa thời gian rảnh này");
        }

        // Lấy các slot khác (không bao gồm chính cái đang cập nhật)
        List<FreeTime> otherSlots = freeTimeRepository.findByUserIdAndDayOfWeek(userId, updated.getDayOfWeek())
                .stream()
                .filter(slot -> !slot.getId().equals(id)) // tránh so với chính nó
                .collect(Collectors.toList());

        LocalTime newStart = updated.getStartTime();
        LocalTime newEnd = updated.getEndTime();

        List<FreeTime> toMerge = new ArrayList<>();

        for (FreeTime other : otherSlots) {
            boolean isOverlap = newStart.isBefore(other.getEndTime()) &&
                    newEnd.isAfter(other.getStartTime());

            if (isOverlap) {
                // Gộp thời gian
                newStart = newStart.isBefore(other.getStartTime()) ? newStart : other.getStartTime();
                newEnd = newEnd.isAfter(other.getEndTime()) ? newEnd : other.getEndTime();
                toMerge.add(other);
            }
        }

        // Xóa các khoảng cũ bị gộp
        if (!toMerge.isEmpty()) {
            freeTimeRepository.deleteAll(toMerge);
        }

        // Cập nhật lại khoảng hiện tại
        existing.setDayOfWeek(updated.getDayOfWeek());
        existing.setStartTime(newStart);
        existing.setEndTime(newEnd);

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
