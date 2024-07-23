const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let chatHistory = [];

// 정적 파일 제공
app.use(express.static(path.join(__dirname)));

// 루트 경로로 접근 시 index.html 파일 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 소켓 연결 이벤트 처리
io.on('connection', (socket) => {
    console.log('a user connected');

    // 채팅 내역 전송
    socket.emit('chat history', chatHistory);

    socket.on('set name', (name) => {
        socket.userName = name;
        const message = `${name}님이 입장했습니다.`;
        const timestamp = formatTime(new Date());
        io.emit('chat message', { userName: 'System', message, timestamp });
        console.log(message);
    });

    socket.on('disconnect', () => {
        if (socket.userName) {
            const message = `${socket.userName}님이 퇴장했습니다.`;
            const timestamp = formatTime(new Date());
            io.emit('chat message', { userName: 'System', message, timestamp });
            console.log(message);
        }
    });

    // 'chat message' 이벤트 처리
    socket.on('chat message', (data) => {
        console.log(`${data.userName} [${data.timestamp}]: ${data.message}`);
        chatHistory.push(data);
        io.emit('chat message', data); // 모든 클라이언트에게 메시지 전송
    });
});

// 시간 형식화 함수
function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// 서버 시작
const port = 10001;
server.listen(port, (err) => {
    if (err) {
        console.error('Error starting server:', err);
    } else {
        console.log('서버가 가동되었습니다. 포트:', port);
    }
});
