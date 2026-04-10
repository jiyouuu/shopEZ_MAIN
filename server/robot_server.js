//server/robot_server.js
const express = require('express');
const cors = require('cors'); // CORS 설정을 위한 모듈
const http = require('http'); // HTTP 서버 생성 모듈
const socketIo = require('socket.io'); // Socket.IO 서버 모듈
const axios = require('axios'); 
const { exec } = require('child_process'); // Node.js 명령어 실행을 위한 모듈
const net = require('net'); // TCP 서버 모듈
const path = require('path');


const app = express();
const ROBOT_PORT = 3001; // Express 서버 및 Socket.IO 서버 포트를 30001로 통일

app.use(cors({
  origin: ['http://192.168.0.25:3000', 'http://192.168.0.25:3001','http://192.168.0.5:30002'], // 허용할 출처 설정
  methods: ['GET', 'POST'],
  credentials: true
}));


app.use(express.json());

// 1_ProductMovement 실행되면 카트에서 인식 장소로 캐리어 이동
// res.json에서 statue:complete를 통해 이동 종료 값 전달
app.get('/run-1move', (req, res) => {
  exec('node ./robot_1move.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing 1move.js: ${error}`);
      return res.status(500).send('Error executing script');
    }
    console.log(`Output: ${stdout}`);
    res.json({ status: 'completed', message: '1_ProductMovement + robot_1move.js executed successfully' });
  });
});

// 2_ProductRecognition에서 파이선 실행 후 로봇 이동
app.get('/run-2recog', (req, res) => {
  exec('node ./robot_2recog.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing 2recog.js: ${error}`);
      return res.status(500).send('Error executing script');
    }
    console.log(`Output: ${stdout}`);
    res.send('2_ProductRecognition + robot_2recog.js executed successfully');
  });
});

// 3_Payment에서 파이선 실행 후 로봇 이동
app.get('/run-3pay', (req, res) => {
  exec('node ./robot_3pay.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing 3pay.js: ${error}`);
      return res.status(500).send('Error executing script');
    }
    console.log(`Output: ${stdout}`);
    res.json({ status: 'completed', message: '3_Payment + robot_3pay.js executed successfully' });
  });
});

// 5_End에서 로봇 이동
// app.get('/run-5end', (req, res) => {
//   exec('node ./robot_5end.js', (error, stdout, stderr) => {
//     if (error) {
//       console.error(`Error executing 5end.js: ${error}`);
//       return res.status(500).send('Error executing script');
//     }
//     console.log(`Output: ${stdout}`);
//     res.json({ status: 'completed', message: '5_End + robot_5End.js executed successfully' });
//   });
// });


app.get('/run-5end', (req, res) => {
  const scriptPath = path.join(__dirname, 'robot_5end.js');
  exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing robot_5end.js: ${error}`);
      return res.status(500).send(`Error executing script: ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);
    res.json({ status: 'completed', message: '5_End + robot_5end.js executed successfully' });
  });
});

// Socket.IO 서버 생성 (로봇 제어용)
const server = http.createServer(app);
const ioRobot = socketIo(server, {
  cors: {
    origin: "http://192.168.0.25:3000",  // 리액트 클라이언트 주소 허용
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO 연결 처리 (로봇 제어용)
ioRobot.on('connection', (socket) => {
  console.log('클라이언트가 연결되었습니다.');

  socket.on('detect', (data) => {
    console.log('데이터 수신: ', data);
    ioRobot.emit('detect', data);  // 모든 클라이언트에게 데이터 전송
  });

  socket.on('disconnect', () => {
    console.log('클라이언트 연결 종료');
  });
});

// ROBOT_SERVER서버 실행
server.listen(ROBOT_PORT, () => {
  console.log(`로봇 제어 Socket.IO 서버가 http://192.168.0.25:${ROBOT_PORT}번 포트에서 실행 중입니다.`);
});