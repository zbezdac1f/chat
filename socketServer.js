const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 정적 파일 제공
app.use(express.static(path.join(__dirname)));

// 루트 경로로 접근 시 index.html 파일 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 소켓 연결 이벤트 처리
io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    // 'chat message' 이벤트 처리
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        io.emit('chat message', msg); // 모든 클라이언트에게 메시지 전송
    });
});

// 서버 시작
const port = 10001;
server.listen(port, (err) => {
    if (err) {
        console.error('에러발생:', err);
    } else {
        console.log('소켓 서버가 가동되었습니다. 포트:', port);
    }
});