package com.example.demo.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        // 임시 사용자 인증 (실제로는 DB 조회 및 암호화된 비밀번호 비교 필요)
        if (("user1".equals(username) && "pass1".equals(password)) ||
            ("user2".equals(username) && "pass2".equals(password))) {
            // 성공 시 사용자 이름을 토큰으로 사용
            return ResponseEntity.ok(Map.of("token", username));
        } else {
            return ResponseEntity.status(401).body("아이디 또는 비밀번호가 잘못되었습니다.");
        }
    }
}