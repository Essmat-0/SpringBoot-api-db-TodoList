package com.example.todolist.service;

import com.example.todolist.model.Todo;
import com.example.todolist.model.User;
import com.example.todolist.repository.TodoRepository;
import com.example.todolist.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TodoService {

    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

    private User currentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow();
    }

    public List<Todo> getAllTodos() {
        return todoRepository.findByUser(currentUser());
    }

    public Optional<Todo> getTodoById(Long id) {
        return todoRepository.findByIdAndUser(id, currentUser());
    }

    public Todo createTodo(Todo todo) {
        todo.setUser(currentUser());
        return todoRepository.save(todo);
    }

    public Optional<Todo> updateTodo(Long id, Todo updated) {
        return todoRepository.findByIdAndUser(id, currentUser()).map(todo -> {
            todo.setTitle(updated.getTitle());
            todo.setDescription(updated.getDescription());
            todo.setCompleted(updated.isCompleted());
            return todoRepository.save(todo);
        });
    }

    public boolean deleteTodo(Long id) {
        return todoRepository.findByIdAndUser(id, currentUser()).map(todo -> {
            todoRepository.delete(todo);
            return true;
        }).orElse(false);
    }

    public List<Todo> getTodosByStatus(boolean completed) {
        return todoRepository.findByUserAndCompleted(currentUser(), completed);
    }
}
