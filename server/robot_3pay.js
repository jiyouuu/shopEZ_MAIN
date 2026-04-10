//server/robot_3pay.js <- > 3_Payment.js
const net = require('net');

// UR3e 로봇의 IP 주소와 포트 번호
const ROBOT_IP = '192.168.0.5';
const ROBOT_CONTROL_PORT = 30002;

// 로봇을 관절 각도로 이동시키는 함수
const moveRobotJoints = (jointsArray, delay, callback) => {
    const client = new net.Socket();

    client.connect(ROBOT_CONTROL_PORT, ROBOT_IP, () => {
        // movej 명령어 전송
        const moveCommand = `movej([${jointsArray.join(', ')}])\n`;
        client.write(moveCommand);

        // delay 시간 후 연결 종료 및 콜백 호출
        setTimeout(() => {
            client.destroy();
            if (callback) callback(); // 다음 명령 실행을 위한 콜백 호출
        }, delay);
    });

    client.on('error', (err) => {
        console.error('Connection error: ' + err.message);
    });
};

// 가속도(a)와 속도(v)를 추가하여 로봇을 이동시키는 함수 (물품 드랍에 적용)
const moveRobotJoints2 = (jointsArray, delay, speed, accel, callback) => {
    const client = new net.Socket();

    client.connect(ROBOT_CONTROL_PORT, ROBOT_IP, () => {
        // movej 명령어에 가속도와 속도를 추가하여 전송
        const moveCommand = `movej([${jointsArray.join(', ')}], a=${accel}, v=${speed})\n`;
        client.write(moveCommand);

        // delay 시간 후 연결 종료 및 콜백 호출
        setTimeout(() => {
            client.destroy();
            if (callback) callback(); // 다음 명령 실행을 위한 콜백 호출
        }, delay);
    });

    client.on('error', (err) => {
        console.error('Connection error: ' + err.message);
    });
};
// 그리퍼 제어 함수 C_gripperOpen(언그립)■ -> □
const disableGripperOpen = (callback) => {
    const controlClient = new net.Socket();

    controlClient.connect(ROBOT_CONTROL_PORT, ROBOT_IP, () => {
        const FirstCommand = `
            set_tool_digital_out(0, False)
            wait(2.0)
        `;
        controlClient.write(FirstCommand);

        setTimeout(() => {
            controlClient.destroy();
            if (callback) callback();
        }, 2000);
    });

    controlClient.on('error', (err) => {
        console.error('Error: ' + err.message);
    });
};

// 그리퍼 제어 함수 C_gripperClose(그립) □ -> ■
const ableGripperClose = (callback) => {
    const controlClient = new net.Socket();

    controlClient.connect(ROBOT_CONTROL_PORT, ROBOT_IP, () => {
        const testCommand = `
            set_tool_digital_out(1, True)
            wait(2.0)
        `;
        controlClient.write(testCommand);

        setTimeout(() => {
            controlClient.destroy();
            if (callback) callback();
        }, 2000);
    });

    controlClient.on('error', (err) => {
        console.error('Error: ' + err.message);
    });
};

// 전 상태: 상품 인식 완료 후 그립
// 상품을 포장하기 위해 상승 후 속도 줘서 상품 떨구기
console.log("Starting 3_Payment(robot_3pay.js) joint movement...");
// 그리퍼 C_gripperOpen(언그립)  ■ -> □
disableGripperOpen(() => {
    console.log("Gripper released Open C_gripperOpen ■ -> □(robot_2recog.js)");

    // 그리퍼 C_gripperClose(그립) □ -> ■
    ableGripperClose(() => {
        console.log("Gripper closed C_gripperClose □ -> ■(robot_2recog.js)");

        // drop_go1 -> 상품 일정 높이 올리기 
        moveRobotJoints([-1.1627, -1.1841, -1.3643, -1.9615, 1.5155, 1.4356], 3000, () => {
            console.log("First joint movement completed.(robot_3pay.js)");

            // drop_go2 -> 상품 올려서 이동대 쪽으로 이동
            moveRobotJoints([-0.8045, -1.1534, -1.1766, -1.4302, 1.6523, 0.4016], 2000, () => {
                console.log("Second joint movement completed.(robot_3pay.js)");

                // drop_go3 -> 상품 올려서 이동대 오른쪽으로 이동 0.8410, -1.1557, -1.1769, -1.5097, 1.3527, 1.0809 
                //moveRobotJoints([0.6525, -1.1848, -1.1721, -1.4671, 1.4989, 0.9591], 3000, () => {
                moveRobotJoints([0.8410, -1.1557, -1.1769, -1.5097, 1.3527, 1.0809], 3000, () => {
                    console.log("Third joint movement completed.(robot_3pay.js)");

                    // drop_go4 -> 이동대에 부울 위치 조정 
                    //moveRobotJoints([0.6913, -1.2142, -1.1719, -1.5298, 1.1337, 2.3006], 2000, () => {
                        //drop_go4_2 
                        moveRobotJoints([1.0001, -1.1404, -1.1392, -1.7735, 0.9266, 2.5696], 2000, () => {
                        console.log("Fourth joint movement completed.(robot_3pay.js)");

                        // drop1 -> 상품 돌리기1
                        moveRobotJoints2([0.7213, -1.2228, -1.1721, -1.7054, 0.8253, 3.4091], 1000, 5, 5, () => {
                            console.log("Fifth joint movement completed.(robot_3pay.js)");

                            // drop2 -> 상품 빠르게 돌리기(빠르게 이동)
                            moveRobotJoints2([0.5585, -1.1633, -1.1946, -1.6013, 0.9149, 3.6383], 2000, 3, 3, () => {
                                console.log("Sixth joint movement completed.(robot_3pay.js)");

                                // drop_down1 -> 캐리어 내리기 시작
                                //moveRobotJoints([-0.3337, -1.1534, -1.1927, -1.7307, 1.0318, 3.6404], 3000, () => {
                                    //drop_down1_2 수정
                                    moveRobotJoints([-0.3369, -1.4175, -0.5796, -2.0782, 1.0343, 3.6387], 3000, () => {
                                    console.log("Seventh joint movement completed.(robot_3pay.js)");

                                    // drop_down_end -> 상품 인식 장소로 캐리어 내려놓기 
                                    moveRobotJoints([-1.2894, -1.7631, -1.6519, -1.3066, 1.5918, 1.8527], 4000, () => {
                                        console.log("Eighth joint movement completed.(robot_3pay.js)");

                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
