import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const NotificationComponent = ({ token, onLogout }) => {
    const [notifications, setNotifications] = useState([]);
    const stompClientRef = useRef(null); // stompClient를 ref로 관리

    useEffect(() => {
        if (!token) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(`http://localhost:8080/ws?token=${token}`),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log(`✅ WebSocket 연결 성공 (사용자: ${token})`);
                client.subscribe(`/user/queue/notifications`, (message) => {
                    // JSON 형식의 메시지를 파싱
                    const newNotification = JSON.parse(message.body);
                    setNotifications(prev => [newNotification, ...prev]);
                });
            }
        });

        client.activate();
        stompClientRef.current = client; // ref에 클라이언트 인스턴스 저장

        // 로그인 시, 읽지 않은 알림들을 가져오는 함수
        const fetchUnreadNotifications = async () => {
            try {
                const response = await fetch(`http://localhost:8080/notifications/${token}`);
                if (response.ok) {
                    const data = await response.json();
                    // 미수신 알림은 JSON 객체 형태 그대로 상태에 추가
                    setNotifications(prev => [...data, ...prev]);
                }
            } catch (error) {
                console.error("미수신 알림 로딩 실패:", error);
            }
        };

        fetchUnreadNotifications(); // 컴포넌트 마운트 시 미수신 알림 가져오기 실행

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                console.log('⏹️ WebSocket 연결 해제');
            }
        };
    }, [token]);

    const sendNotificationToMe = async () => {
        // API 요청 시, 현재 로그인된 사용자 정보(token)를 함께 전송
        await fetch('http://localhost:8080/send-notification/me', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: token }),
        });
    };

    // "읽음" 버튼 클릭 시 호출될 함수
    const markAsRead = (notificationId) => {
        if (stompClientRef.current && stompClientRef.current.connected) {
            // 백엔드로 읽음 처리 요청 전송
            stompClientRef.current.publish({
                destination: '/app/mark-as-read',
                body: JSON.stringify({ notificationId: notificationId }),
            });

            // 프론트엔드 상태에서 즉시 해당 알림 제거
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        }
    };

    return (
        <div className="notification-container">
            <h2>{token}님, 환영합니다! </h2>
            <button onClick={sendNotificationToMe}>나에게 테스트 알림 보내기</button>
            <button onClick={onLogout} className="logout-button">로그아웃</button>
            <hr />
            <h3>알림 목록 ({notifications.length}개)</h3>
            <ul className="notification-list">
                {notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <li key={notif.id} className="notification-item">
                            <span>{notif.content}</span>
                            {/* 읽음 버튼 추가 */}
                            <button onClick={() => markAsRead(notif.id)} className="read-button">
                                읽음
                            </button>
                        </li>
                    ))
                ) : (
                    <p>표시할 알림이 없습니다.</p>
                )}
            </ul>
        </div>
    );
};

export default NotificationComponent;