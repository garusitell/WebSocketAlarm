package com.example.demo.service;

import com.example.demo.entity.Notification;
import com.example.demo.repository.NotificationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final SimpMessagingTemplate template;
    private final NotificationRepository repository;
    private final ObjectMapper objectMapper;

    @Transactional
    @SneakyThrows
    public void sendNotification(String toUser, String content) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String formattedNow = LocalDateTime.now().format(formatter);
        String newContent = "[" + formattedNow + "] " + content;

        Notification notification = new Notification(toUser, newContent);
        repository.save(notification);

        Map<String, Object> messagePayload = Map.of(
                "id", notification.getId(),
                "content", notification.getContent()
        );

        String jsonMessage = objectMapper.writeValueAsString(messagePayload);

        String destination = "/queue/notifications";
        template.convertAndSendToUser(toUser, destination, jsonMessage);
    }

    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(String username) {
        return repository.findByUsernameAndIsReadFalse(username);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        log.info("markAsRead 호출됨 - notificationId: {}", notificationId);
        repository.findById(notificationId).ifPresent(notification -> {
            log.info("알림 찾음: {}. isRead 상태를 true로 변경합니다.", notification);
            notification.setRead(true);
            // @Transactional에 의해 변경 감지(dirty checking)되어 자동으로 DB에 반영됩니다.
            // repository.save()를 명시적으로 호출할 필요가 없습니다.
            log.info("알림 상태 변경 완료. 커밋 대기 중.");
        });
    }
}