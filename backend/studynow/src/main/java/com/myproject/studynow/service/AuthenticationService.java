package com.myproject.studynow.service;

import com.myproject.studynow.dto.JwtAuthenticationResponse;
import com.myproject.studynow.dto.RefreshTokenRequest;
import com.myproject.studynow.dto.SignInRequest;
import com.myproject.studynow.dto.SignUpRequest;
import com.myproject.studynow.entity.User;

public interface AuthenticationService {

    User signUp(SignUpRequest signUpRequest);

    JwtAuthenticationResponse signin(SignInRequest signInRequest);

    JwtAuthenticationResponse refreshToken(RefreshTokenRequest refreshTokenRequest);
}
