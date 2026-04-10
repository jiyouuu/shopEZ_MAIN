//shopez => server.js 
const express = require('express');
const cors = require('cors'); // CORS 설정을 위한 모듈
const http = require('http'); // HTTP 서버 생성 모듈
const socketIo = require('socket.io'); // Socket.IO 서버 모듈
const axios = require('axios'); 
const { exec } = require('child_process'); // Node.js 명령어 실행을 위한 모듈
const net = require('net'); // TCP 서버 모듈

const app = express();
const PORT = 3003; // Express 서버 포트
const CUSTOMER_PORT = 5001; // 고객 인식 Node.js 서버 포트


app.use(cors());  // Express 서버에 CORS 설정 적용
app.use(express.json());


// 고객 인식 Socket.IO 서버 생성
const customerServer = http.createServer(app);
const ioCustomer = socketIo(customerServer, {
  cors: {
    origin: '*', // 모든 도메인의 요청을 허용
    methods: ['GET', 'POST'],
    credentials: true,  // 쿠키와 같은 인증 정보 포함 여부 설정
  },
  transports: ['polling', 'websocket'],  // 'polling'과 'websocket' 방식을 모두 허용
  pingTimeout: 60000,  // 클라이언트가 응답하지 않을 때 연결을 끊기 전까지의 시간 (60초)
  pingInterval: 25000,  // ping 패킷을 보내는 간격 (25초)
});

// 고객 인식 상태 변수
let recognizedCustomer = null;

// 고객 인식 서버 이벤트 리스너
ioCustomer.on('connection', (socket) => {
  // console.log(`고객 인식 소켓: ${socket.id}`);

  // 연결 해제 이벤트
  socket.on('disconnect', () => {
    console.log(`클라이언트 연결 해제: ${socket.id}`);
  });
});

// -----------------------------------상품 인식 ------------------------------------------------------
// app.post('/product-recognition', async (req, res) => {
//     // 객체 인식 서버로부터 받은 클래스 ID
//     let { class_id } = req.body;

//     // Base64 디코딩 처리
//     if (!class_id) {
//       return res.status(400).json({ message: 'class_id가 없습니다.' });
//     }

//     console.log(`전달된 class_id: ${class_id}`); 

//     // 숫자로 변환
//     const sticker_id = parseInt(class_id.trim(), 10);
//     if (isNaN(sticker_id)) {
//       return res.status(400).json({ message: '유효하지 않은 class_id 값입니다.' });
//     }

//     console.log(`숫자로 변환된 class_id: ${sticker_id}`);
//   // 실시간으로 리액트 클라이언트에 데이터 전송
//   ioCustomer.emit('product-recognized', { class_id: sticker_id });

//     res.status(200).json({ message: '클래스 ID 처리 완료' });

// });


app.post('/product-recognition', async (req, res) => {
  // 객체 인식 서버로부터 받은 클래스 ID
  let { class_id } = req.body;

  if (!class_id) {
      return res.status(400).json({ message: 'class_id가 없습니다.' });
  }

  console.log(`전달된 class_id: ${class_id}`);

  
    // 줄바꿈 또는 쉼표로 분리하여 숫자 배열로 변환
    const sticker_ids = class_id
        .split(/[\n,]/) // 줄바꿈(\n) 또는 쉼표(,)로 분리
        .map(id => id.trim()) // 공백 제거
        .filter(id => id !== 'END') // 'END' 제거
        .map(id => parseInt(id, 10)) // 숫자로 변환
        .filter(id => !isNaN(id)); // 유효한 숫자인 값만 필터링


  if (sticker_ids.length === 0) {
      return res.status(400).json({ message: '유효하지 않은 class_id 값입니다.' });
  }

  console.log(`숫자로 변환된 class_ids: ${sticker_ids}`);

  // 각 ID를 클라이언트에 전송
  sticker_ids.forEach(sticker_id => {
      ioCustomer.emit('product-recognized', { class_id: sticker_id });
  });

  res.status(200).json({ message: '클래스 ID 처리 완료' });
});



// --------------------손글씨 인식 후 고객 있는지 확인 API ------------------------------
app.post('/sticker-recognition', async (req, res) => {
  try {
    // 객체 인식 서버로부터 받은 클래스 ID
    console.log('Request body:', req.body); // 요청 바디 로그 출력
    const { text } = req.body;
    console.log('Text:', text); // text 값 확인
    if (!text) {
      console.error('유효하지 않은 닉네임');
      return res.status(400).json({ message: '유효하지 않은 닉네임입니다.' });
    }


    // 등록 서버에 손글씨로 인증된 거 있는지 고객 닉네임 요청(고객 등록 키오스크)
    // const response = await axios.post('http://192.:5000/get_customer', { text });

    const response = await axios.post('http://192.168.0.26:5000/get_customer', { text });
    if (response.data && response.data.customer) {
      recognizedCustomer = response.data.customer;  // 고객 정보를 전역 변수에 저장
      console.log(`고객 인식: ${recognizedCustomer.name}`);

      // 성공적으로 고객을 찾았을 때 응답
      res.status(200).json({
        status: 'success',
        message: '고객 인식 완료',
        recognizedCustomer
      });
    } else {
      console.log('해당 닉네임으로 등록된 고객이 없습니다.');
      res.status(404).json({
        status: 'not found',
        message: '해당 닉네임으로 등록된 고객이 없습니다.'
      });
    }
  } catch (error) {
    // 여기에서 500번 에러를 처리
    if (error.response && error.response.status === 404) {
      console.log('해당 스티커로 등록된 고객이 없습니다.');
      res.status(404).json({
        status: 'not found',
        message: '해당 닉네임으로 등록된 고객이 없습니다.'
      });
    } else {
      console.error('고객 인식 에러:', error.message);
      res.status(500).json({
        status: 'error',
        message: '고객 인식 처리 중 오류가 발생했습니다.'
      });
    }
  }
});

// ----------------------고객 인식 정보 응답 API----------------------------------------
app.get('/get_recognized_customer', async (req, res) => {
  if (recognizedCustomer) {
    console.log(`인식된 고객: ${JSON.stringify(recognizedCustomer)}`);
    const customer = recognizedCustomer; // 고객 정보를 저장
    const { name } = customer; // 고객 정보에서 닉네임 추출

    // 고객 정보 응답
    res.json({ customer: customer });
    
    // 중복 전송 방지를 위해 고객 정보 초기화
    recognizedCustomer = null;
    try {
      // 등록된 고객 삭제 요청
      await axios.delete('http://192.168.0.26:5000/remove_customer', { data: { name } });
    } catch (error) {
      console.error('고객 삭제 요청 중 오류 발생:', error);
    }
  } else {
    res.status(404).json({ message: '인식된 고객 정보가 없습니다.' });
  }
});



//--------------------------ShopEZ3관리자 통신------------------------------------------------------//
// 상품 매출 전송 엔드포인트
app.post('/add-sale', async (req, res) => {
  const { totalPrice } = req.body;

  if (!totalPrice) {
      return res.status(400).json({ message: '매출 금액이 없습니다.' });
  }

  try {
      await axios.post('http://192.168.0.10:8000/add-daily-sales', { saleAmount: totalPrice });
      console.log('Shopez3에 매출 데이터 전송 성공');
      res.status(200).json({ message: '매출 데이터 전송 성공' });
  } catch (error) {
      console.error('Shopez3로 매출 데이터 전송 실패:', error);
      res.status(500).json({ message: '매출 데이터 전송 실패' });
  }
});

// ------------------------------------------모든 서버 실행-------------------------------------------------
app.listen(PORT, () => {
  console.log(`Express 서버가 http://192.168.0.25:${PORT}에서 실행 중입니다.`);
});

customerServer.listen(CUSTOMER_PORT, () => {
  console.log(`고객 인식 Socket.IO 서버가 http://192.168.0.25:${CUSTOMER_PORT}번 포트에서 실행 중입니다.`);
});

