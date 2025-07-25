import React, { useState, useEffect } from 'react';
import NotificationComponent from './components/NotificationComponent';
import LoginComponent from './components/LoginComponent';
import LoggedOutView from './components/LoggedOutView';
import './App.css';

function App() {
  // 로컬 스토리지에서 토큰을 가져와 초기 상태 설정
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  const handleLogin = (newToken) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>실시간 알림 시스템 (로그인 기능 추가)</h1>
      </header>
      <main>
        {token ? (
          // 토큰이 있으면 (로그인 상태)
          <NotificationComponent token={token} onLogout={handleLogout} />
        ) : (
          // 토큰이 없으면 (로그아웃 상태)
          <>
            <LoginComponent onLogin={handleLogin} />
            <hr />
            <LoggedOutView />
          </>
        )}
      </main>
    </div>
  );
}

export default App;