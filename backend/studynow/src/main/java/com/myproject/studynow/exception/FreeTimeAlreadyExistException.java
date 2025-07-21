package com.myproject.studynow.exception;

public class FreeTimeAlreadyExistException extends RuntimeException {
    public FreeTimeAlreadyExistException(String message) {
        super(message);
    }
}
