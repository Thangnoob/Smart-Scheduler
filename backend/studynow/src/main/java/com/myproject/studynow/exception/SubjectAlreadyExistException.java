package com.myproject.studynow.exception;

public class SubjectAlreadyExistException extends RuntimeException {
    public SubjectAlreadyExistException(String message) {
        super(message);
    }
}
