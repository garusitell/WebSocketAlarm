import React from 'react';

const LoggedOutView = () => {
    const sendNotificationToUser1 = async () => {
        try {
            await fetch('http://localhost:8080/send-notification/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toUser: 'user1', content: '익명 사용자가 보낸 알림' }),
            });
            alert('user1에게 알림을 보냈습니다. user1으로 로그인하여 확인해보세요.');
        } catch (error) {
            alert('알림 전송에 실패했습니다.');
        }
    };
    
    return (
        <div className="logged-out-view">
            <h3>다른 사용자에게 알림 보내기</h3>
            <p>로그아웃 상태입니다. 'user1'에게 알림을 보낼 수 있습니다.</p>
            <button onClick={sendNotificationToUser1}>user1에게 알림 보내기</button>
        </div>
    );
};

export default LoggedOutView;