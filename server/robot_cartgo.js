const net = require('net');

// UR3e 로봇의 IP 주소와 포트 번호
const ROBOT_IP = '192.168.0.5';
const ROBOT_CONTROL_PORT = 30002;

// 그리퍼 제어 함수 (그리퍼 열기 설정 해제)
const releaseGripperFirst = (callback) => {
    const controlClient = new net.Socket();

    controlClient.connect(ROBOT_CONTROL_PORT, ROBOT_IP, () => {
        console.log('Connected to UR3e Robot for releasing gripper');

        //그리퍼 열기 설정 해제
        const FirstCommand = `
            set_tool_digital_out(1, True)
            wait(2.0)
            set_tool_digital_out(0, False)
            wait(2.0) 
        `;
        controlClient.write(FirstCommand);
        console.log('Release command sent to robot.');

        // 5초 후 연결 종료 및 콜백 호출
        setTimeout(() => {
            controlClient.destroy();
            console.log('Gripper release connection closed');
            if (callback) callback(); // 두 번째 releaseGripper 호출
        }, 5000);
    });

    controlClient.on('error', (err) => {
        console.error('Error: ' + err.message);
    });
};


// 관절 각도로 로봇을 움직이기 위한 함수
const moveRobotJoints = (jointsArray, delay, callback) => {
    const client = new net.Socket();

    client.connect(ROBOT_CONTROL_PORT, ROBOT_IP, () => {
        console.log('Connected to UR3e Robot for joint movement');

        // movej 명령어 전송
        const moveCommand = `movej([${jointsArray.join(', ')}])\n`;
        client.write(moveCommand);
        console.log(`Command sent: ${moveCommand}`);

        // delay 시간 후 연결 종료 또는 다음 명령 실행
        setTimeout(() => {
            client.destroy();
            console.log('Joint movement connection closed');
            if (callback) callback(); // 다음 명령 실행을 위한 콜백 호출
        }, delay);
    });

    client.on('error', (err) => {
        console.error('Connection error: ' + err.message);
    });
};

// 관절 이동만 수행 (movej 4번)
console.log("Starting first joint movement...");

// 첫 번째 위치로 로봇을 이동
moveRobotJoints([-2.3213, -2.7855, -1.0427, -0.9674, 1.4850, 3.9874], 5000, () => {
console.log("First joint movement completed, starting second joint movement...");

    // 그리퍼 open 해제
    releaseGripperFirst(() => {
    console.log("First gripper release completed, starting second gripper release...");


        // 두 번째 위치로 로봇을 이동 (중간 이동)
        moveRobotJoints([-2.3299, -2.9921, -0.9219, -0.8777, 1.4875, 3.9833], 5000, () => {
            console.log("Second joint movement completed, starting third joint movement...");
        });
    });
});