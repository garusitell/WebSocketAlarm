package com.example.demo.controller;

import com.example.demo.dto.NotificationRequest;
import com.example.demo.entity.Notification;
import com.example.demo.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // [HTTP] '나에게' 알림 보내는 API (수정됨)
    @PostMapping("/send-notification/me")
    public ResponseEntity<String> sendNotificationToMe(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        if (username == null || username.isEmpty()) {
            return ResponseEntity.badRequest().body("Username이 필요합니다.");
        }
        notificationService.sendNotification(username, "나에게 보내는 테스트 알림입니다.");
        return ResponseEntity.ok("알림이 성공적으로 전송 및 저장되었습니다.");
    }

    @PostMapping("/send-notification/user")
    public ResponseEntity<String> sendNotificationToUser(@RequestBody NotificationRequest request) {
        notificationService.sendNotification(request.getToUser(), request.getContent());
        return ResponseEntity.ok("알림이 성공적으로 전송 및 저장되었습니다.");
    }

    @GetMapping("/notifications/{username}")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable String username) {
        List<Notification> notifications = notificationService.getUnreadNotifications(username);
        return ResponseEntity.ok(notifications);
    }
}

@Controller
@RequiredArgsConstructor
class WebSocketController {

    private static final Logger log = LoggerFactory.getLogger(WebSocketController.class);
    private final NotificationService notificationService;

    @MessageMapping("/mark-as-read")
    public void handleMarkAsRead(@Payload Map<String, Long> payload) {
        log.info("handleMarkAsRead 호출됨. payload: {}", payload);
        Long notificationId = payload.get("notificationId");
        if (notificationId != null) {
            notificationService.markAsRead(notificationId);
        }
    }
}