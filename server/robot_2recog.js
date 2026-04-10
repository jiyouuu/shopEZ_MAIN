//server/robot_2recog.js <-> 2_ProductRecognition.js
const net = require('net');

// UR3e 로봇의 IP 주소와 포트 번호
const ROBOT_IP = '192.168.0.5';
const ROBOT_CONTROL_PORT = 30002;

// 관절 각도로 로봇을 움직이기 위한 함수
const moveRobotJoints = (jointsArray, delay, callback) => {
    const client = new net.Socket();

    client.connect(ROBOT_CONTROL_PORT, ROBOT_IP, () => {
        // movej 명령어 전송
        const moveCommand = `movej([${jointsArray.join(', ')}])\n`;
        client.write(moveCommand);

        // delay 시간 후 연결 종료 또는 다음 명령 실행
        setTimeout(() => {
            client.destroy();
            if (callback) callback(); // 다음 명령 실행을 위한 콜백 호출
        }, delay);
    });

    client.on('error', (err) => {
        console.error('Connection error: ' + err.message);
    });
};

// 전 상태: 상품 인식대로 이동 완료 후 카메라 인식 시작
console.log("Starting 2_ProductRecognition(robot_2recog.js) joint movement...");

    // camera -> 한번에 모든 상품 촬영
    //moveRobotJoints([-1.5554, -1.8359, -1.2317, -1.6597, 1.5308, 0.0442], 8000, () => {
    moveRobotJoints([-1.2174, -1.8371, -0.9530, -2.1991, 1.0147, 0.4872], 10000, () => {
    console.log("Second joint movement completed.(robot_2recog.js)");


        // camera_up2 -> 다시 그립하러 캐리어 위로 이동 (3000줄 이하면 충돌남)
        moveRobotJoints([-1.2133, -1.7116, -1.4823, -1.5491, 1.5955, 1.9615], 4000, () => {
            console.log("Third joint movement completed.(robot_2recog.js)");
 
            // camera_down -> 캐리어 잡으로 하강
            moveRobotJoints([-1.2133, -1.7492, -1.6877, -1.3056, 1.5960, 1.9612], 3000, () => {
                console.log("Fourth joint movement completed.(robot_2recog.js)");
            });
        });
    });