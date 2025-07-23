package com.myproject.studynow.repository;

import com.myproject.studynow.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject,Long> {
    boolean existsByName(String name);

    List<Subject> findByUserId(Long userId);

    Optional<Subject> findByIdAndUserId(Long id, Long userId);

    boolean existsByNameAndUserId(String name, Long userId);

    @Query("SELECT s FROM Subject s WHERE s.user.id = :userId ORDER BY s.priority DESC, s.weeklyHours DESC")
    List<Subject> findByUserIdOrderByPriorityAndHours(Long userId);

    List<Subject> findByUserIdAndPriority(Long userId, com.myproject.studynow.entity.Priority priority);
}
