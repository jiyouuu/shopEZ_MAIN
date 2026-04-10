//server/robot_5end.js <-> 5_end.js
const net = require('net');

// UR3e 로봇의 IP 주소와 포트 번호
const ROBOT_IP = '192.168.0.5';
const ROBOT_CONTROL_PORT = 30002;

// 그리퍼 제어 함수 C_gripperClose(그립 해제) ■ -> □
const disableGripperClose = (callback) => {
    const controlClient = new net.Socket();

    controlClient.connect(ROBOT_CONTROL_PORT, ROBOT_IP, () => {
        const releaseCommand = `
            set_tool_digital_out(1, False)
            wait(2.0)
        `;
        controlClient.write(releaseCommand);

        setTimeout(() => {
            controlClient.destroy();
            if (callback) callback();
        }, 2000);
    });

    controlClient.on('error', (err) => {
        console.error('Error: ' + err.message);
    });
};

// 그리퍼 제어 함수 C_gripperOpen(언그립) □ -> ■
const ableGripperOpen = (callback) => {
    const controlClient = new net.Socket();

    controlClient.connect(ROBOT_CONTROL_PORT, ROBOT_IP, () => {
        const releaseCommand = `
            set_tool_digital_out(0, True)
            wait(2.0)
        `;
        controlClient.write(releaseCommand);

        setTimeout(() => {
            controlClient.destroy();
            if (callback) callback();
        }, 2000);
    });

    controlClient.on('error', (err) => {
        console.error('Error: ' + err.message);
    });
};

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

// 상태: 상품 포장 이후 고객이 수령 시간 기다리기 위한 캐리어를 상품 인식 장소롤 이동 후 그립 상태
// 캐리어 언그립 이후 프로세스 다음 고객을 받기 위한 초기 자세로 이동
console.log("Starting 5_End(robot_5end.js) joint movement...");

// 그리퍼 C_gripperClose(그립 해제) ■ -> □
disableGripperClose(() => {
    console.log("Gripper released C_gripperClose ■ -> □ (robot_5end.js)");

    // 그리퍼 C_gripperOpen(언그립) □ -> ■
    ableGripperOpen(() => {
        console.log("Gripper Open C_gripperOpen □ -> ■  (robot_5end.js)");

        // restart_go -> 캐리어 언그립 후 일정 높이로 상승
        moveRobotJoints([-1.2894, -1.7305, -1.4389, -1.5528, 1.5913, 1.8530], 2000, () => {
            console.log("First joint movement completed.(robot_5end.js)");

            //start2 -> 시작 자세로 이동
            moveRobotJoints([-1.5366, -2.2202, -0.9126, -1.1867, 1.5355, 1.5705], 3000, () => {
                console.log("Second joint movement completed.(robot_5end.js)");
        });
    });
});
});
