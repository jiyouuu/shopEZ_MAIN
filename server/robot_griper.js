const net = require('net');

const ROBOT_IP = '192.168.0.5';
const ROBOT_CONTROL_PORT = 30002;

const controlClient = new net.Socket();
controlClient.connect(ROBOT_CONTROL_PORT, ROBOT_IP, () => {
  console.log('Connected to UR3e Robot for test.');

  // 그리퍼 열기 명령 전송
  const testCommand = `
  set_tool_digital_out(0, True)
  wait(2.0) 
  set_tool_digital_out(1, False)
  wait(8.0)
  `;

  controlClient.write(testCommand);
  console.log('Test command sent to robot.');

  setTimeout(() => {
    controlClient.destroy();
    console.log('Connection closed after test command.');
  }, 5000);
});

controlClient.on('error', (err) => {
  console.error('Error:', err.message);
});
