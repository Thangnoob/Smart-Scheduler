package com.myproject.studynow.exception;

public class FreeTimeNotFoundException extends RuntimeException {
    public FreeTimeNotFoundException(String message) {
        super(message);
    }
}
