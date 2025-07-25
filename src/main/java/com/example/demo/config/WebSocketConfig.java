package com.example.demo.config;


import com.sun.security.auth.UserPrincipal;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // 모든 오리진 허용 (개발용)
                .setHandshakeHandler(new CustomHandshakeHandler())
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/queue", "/topic");
        registry.setUserDestinationPrefix("/user");
    }

    // WebSocket 연결 시 클라이언트의 신원을 확인하고 Principal 객체를 설정하는 핸들러
    public static class CustomHandshakeHandler extends DefaultHandshakeHandler {
        @Override
        protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler, Map<String, Object> attributes) {
            // 쿼리 파라미터에서 "token"을 추출 (프론트에서 `?token=user1` 형식으로 전송)
            String query = request.getURI().getQuery();
            if (query != null && query.startsWith("token=")) {
                String username = query.substring(6);
                // UserPrincipal 객체를 생성하여 반환하면, 이후 컨트롤러에서 Principal로 주입받아 사용 가능
                return new UserPrincipal(username);
            }
            return null; // 토큰이 없으면 익명 사용자로 처리
        }
    }
}
