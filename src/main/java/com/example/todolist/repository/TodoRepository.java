package com.example.todolist.repository;

import com.example.todolist.model.Todo;
import com.example.todolist.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TodoRepository extends JpaRepository<Todo, Long> {
    List<Todo> findByUser(User user);
    List<Todo> findByUserAndCompleted(User user, boolean completed);
    Optional<Todo> findByIdAndUser(Long id, User user);
}
