import React, { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const NotificationComponent = () => {
    const [notifications, setNotifications] = useState([]);
    const [stompClient, setStompClient] = useState(null);
    const [username] = useState('user1'); // 로그인된 사용자라고 가정

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('✅ WebSocket 연결 성공');
                client.subscribe(`/user/${username}/queue/notifications`, (message) => {
                    const newNotification = {
                        id: new Date().getTime(),
                        content: message.body,
                        isNew: true
                    };
                    setNotifications(prev => [newNotification, ...prev]);
                });
            },
            onStompError: (frame) => {
                console.error('STOMP 오류:', frame);
            },
        });

        client.activate();
        setStompClient(client);

        const fetchUnreadNotifications = async () => {
            try {
                const response = await fetch(`http://localhost:8080/notifications/${username}`);
                const data = await response.json();
                const unreadNotifications = data.map(notif => ({
                    id: notif.id,
                    content: `(미수신) ${notif.content}`,
                    isNew: false
                }));
                setNotifications(prev => [...unreadNotifications, ...prev]);
            } catch (error) {
                console.error('미수신 알림 로딩 실패:', error);
            }
        };

        fetchUnreadNotifications();

        return () => {
            if (client) {
                client.deactivate();
                console.log('⏹️ WebSocket 연결 해제');
            }
        };
    }, [username]);

    const sendNotification = async () => {
        try {
            await fetch('http://localhost:8080/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toUser: username, content: '버튼 클릭으로 생성된 알림' }),
            });
        } catch (error) {
            console.error('알림 생성 요청 실패:', error);
        }
    };

    const markAsRead = (notificationId) => {
        if (stompClient && stompClient.connected && notificationId) {
            stompClient.publish({
                destination: '/app/mark-as-read',
                body: JSON.stringify({ notificationId: notificationId }),
            });
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        }
    };

    return (
        <div className="notification-container">
            <h2>알림 시스템 </h2>
            <p>현재 사용자: <strong>{username}</strong></p>
            <button onClick={sendNotification}>나에게 테스트 알림 보내기</button>
            <hr />
            <h3>알림 목록 ({notifications.length}개)</h3>
            <ul className="notification-list">
                {notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <li key={notif.id} className={notif.isNew ? 'new-notification' : ''}>
                            <span>{notif.content}</span>
                            {!notif.isNew && (
                                <button onClick={() => markAsRead(notif.id)} className="read-button">
                                    읽음
                                </button>
                            )}
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