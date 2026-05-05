package com.biblioteca.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAllExceptions(Exception ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", ex.getMessage());
        error.put("type", ex.getClass().getSimpleName());
        error.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        
        System.err.println("[GLOBAL ERROR] " + ex.getClass().getSimpleName() + ": " + ex.getMessage());
        ex.printStackTrace();
        
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxSizeException(MaxUploadSizeExceededException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", "El archivo es demasiado grande (máximo 50MB)");
        error.put("status", HttpStatus.PAYLOAD_TOO_LARGE.value());
        return new ResponseEntity<>(error, HttpStatus.PAYLOAD_TOO_LARGE);
    }
}
