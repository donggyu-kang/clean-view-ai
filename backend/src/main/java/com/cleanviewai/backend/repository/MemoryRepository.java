package com.cleanviewai.backend.repository;

import com.cleanviewai.backend.entity.Memory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MemoryRepository extends JpaRepository<Memory, Long> {
    List<Memory> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Memory> findByIdAndUserId(Long id, String userId);
}
