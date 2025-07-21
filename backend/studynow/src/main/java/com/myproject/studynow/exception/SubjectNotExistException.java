package com.myproject.studynow.exception;

public class SubjectNotExistException extends RuntimeException {
    public SubjectNotExistException(String message) {
        super(message);
    }
}
