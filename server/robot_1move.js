//server/robot_1move.js <-> 1_ProductMovement.js
const net = require('net');

// UR3e 로봇의 IP 주소와 포트 번호
const ROBOT_IP = '192.168.0.5';
const ROBOT_CONTROL_PORT = 30002;

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
        }, 1000);
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
        const moveCommand = `movej([${jointsArray.join(', ')}])\n`;
        client.write(moveCommand);

        setTimeout(() => {
            client.destroy();
            if (callback) callback();
        }, delay);
    });

    client.on('error', (err) => {
        console.error('Connection error: ' + err.message);
    });
};

// 스티커 이동 위치에서 카트로 이동(기존 Cartgo 병합)
// 카트로 이동 후 캐리어 그립 후 상품 인식대로 이동 후 언그립 진행
console.log("Starting 1_ProductMovement(robot_1move.js) joint movement...");

// 시작 위치 start
moveRobotJoints([-1.5366, -2.2202, -0.9126, -1.1867, 1.5355, 1.5704], 4000, () => {
    console.log("First joint movement completed.(robot_1move.js)");

    // cart up
    moveRobotJoints([-2.5561, -2.2075, -1.1671, -1.3641, 1.5643, 2.1380], 3000, () => {
        console.log("Second joint movement completed.(robot_1move.js)");

        // cart_first
        //moveRobotJoints([-2.6289, -2.6654, -1.2442, -0.8756, 1.4833, 2.1419], 2000, () => {
        moveRobotJoints([-2.6179, -2.6616, -1.2434, -0.8815, 1.4837, 2.1542], 2000, () => {
            console.log("Third joit movement completed.(robot_1move.js)");
            
            //cart_sen -> 마지막 충돌 회피 기회다. -2.6291, -2.7402, -1.2211, -0.8251, 1.4835, 2.1420
            moveRobotJoints([-2.6179, -2.7327, -1.2218, -0.8326, 1.4841, 2.1542], 2000, () => {
                console.log("Fourth joint movement completed.(robot_1move.js)")

            // grip go -> 그립 직전
            //moveRobotJoints([-2.6293, -2.8397, -1.1736, -0.7732, 1.4836, 2.1422],  2000, () => {
            moveRobotJoints([-2.6179, -2.8402, -1.1719, -0.7756, 1.4843, 2.1545], 2000, () => {
                console.log("Fourth joint movement completed.(robot_1move.js)")
                
                // 그리퍼 C_gripperOpen(언그립)  ■ -> □
                disableGripperOpen(() => {
                    console.log("Gripper released Open C_gripperOpen ■ -> □(robot_1move.js)");

                    // 그리퍼 C_gripperClose(그립) □ -> ■
                    ableGripperClose(() => {
                        console.log("Gripper closed C_gripperClose □ -> ■(robot_1move.js)");

                        // grip_up -> 그립후 고정대에서 살짝 위로 이동 
                            //moveRobotJoints([-2.6291, -2.7904, -1.1994, -0.7968, 1.4836, 2.1422], 3000, () => {
                            moveRobotJoints([-2.6179, -2.8008, -1.1926, -0.7943, 1.4843, 2.1545], 1000, () => {
                            console.log("Fifth joint movement completed.(robot_1move.js)");

                            // table_up -> 상품 인식대로 로봇 이동 
                            moveRobotJoints([-2.567, -2.337, -0.355, -2.060, 1.571, 2.130], 3000, () => {
                                console.log("Sixth joint movement completed.(robot_1move.js)");

                                // table_go -> 상품 인식대 위로 로봇 이동 (테이블 위에 위치) 
                                moveRobotJoints([-1.2062, -1.6666, -1.3825, -1.6511, 1.5882, 1.9648], 3000, () => {
                                    console.log("Seventh joint movement completed.(robot_1move.js)");

                                    // table_down -> 상품 인식대 위로 로봇 이동 (테이블 위에 안착) 
                                    moveRobotJoints([-1.2133, -1.7466, -1.6798, -1.3160, 1.5960, 1.9612], 2000, () => {
                                        console.log("Eighth joint movement completed.(robot_1move.js)");

                                        // 그리퍼 C_gripperClose(그립 해제) ■ -> □
                                        disableGripperClose(() => {
                                            console.log("Gripper released C_gripperClose ■ -> □ (robot_1move.js)");

                                            // 그리퍼 C_gripperOpen(언그립) □ -> ■
                                            ableGripperOpen(() => {
                                                console.log("Gripper Open C_gripperOpen □ -> ■ completed(robot_1move.js)");

                                                // camera_up1 -> 카메라 찍으러 위로 이동
                                                moveRobotJoints([-1.2133, -1.7116, -1.4823, -1.5491, 1.5955, 1.9615], 1500, () => {
                                                    console.log("First joinFirst joint movement completed.(robot_2recog.js)");

                                                    // camera -> 한번에 모든 상품 촬영
                                                    //moveRobotJoints([-1.5554, -1.8359, -1.2317, -1.6597, 1.5308, 0.0442], 8000, () => {
                                                    moveRobotJoints([-1.2174, -1.8371, -0.9530, -2.1991, 1.0147, 0.4872], 5000, () => {
                                                            console.log("Second joint movement completed.(robot_2recog.js)");
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
    });
});
});
});
});