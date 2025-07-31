package com.myproject.studynow.exception;

public class StudySessionNotFoundException extends RuntimeException {
    public StudySessionNotFoundException(String message) {
        super(message);
    }
}
