import { useEffect, useContext, useRef } from 'react';
import { WebRTCContext } from './WebRTCContext';
import { StreamContext } from './StreamContext';

const WebRTCClient = ({ onConnected }) => {
  const { pc } = useContext(WebRTCContext);
  const { stream, setStream } = useContext(StreamContext);
  const isNegotiatingRef = useRef(false);

  
    const checkPythonServerReady = async (delay = 2000) => {
      let attempt = 0;
      while (true) {
        try {
          const response = await fetch("http://192.168.0.25:5003/status", {
            method: "GET",
          });
          if (response.ok) {
            console.log("Python 서버가 준비되었습니다.");
            return true; // 서버가 준비되었으므로 함수 종료
          }
        } catch (error) {
          attempt += 1;
          console.log(`Python 서버 준비 확인 재시도 중... (${attempt})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    };

  useEffect(() => {
    if (!pc) return; // pc가 없거나, 이미 stream이 존재하면 중단

    // 트랜시버가 이미 설정되어 있는지 확인하고, 추가하지 않음
    if (pc.getTransceivers().length === 0) {
      const transceiver = pc.addTransceiver("video", { direction: "recvonly" });
      transceiver.direction = "recvonly";
    }

    if (stream) {
      console.log("기존 스트림이 이미 설정되어 있습니다:", stream);
      if (typeof onConnected === 'function') onConnected();
      return;
    }


    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE Candidate 생성:", event.candidate);
        fetch("http://192.168.0.25:5003/candidate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
          }),
          credentials: "include",
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            console.log("ICE Candidate 전송 성공:", data);
          })
          .catch((error) => {
            console.error("ICE Candidate 전송 실패:", error);
          });
    };

    
    if (!pc.ontrack) {
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          console.log("ontrack 이벤트로 스트림을 설정합니다.");
          setStream(event.streams[0]); // StreamContext의 스트림 업데이트
        } else {
          console.log("ontrack 이벤트에 스트림이 없습니다.");
        }
      };
    }
  }
    const negotiate = async () => {
      // 이미 협상 중이거나 signaling 상태가 안정적이지 않으면 새로운 협상을 시작하지 않음
      if (isNegotiatingRef.current || pc.signalingState !== 'stable') return;

      isNegotiatingRef.current = true;
      try {
          // Python 서버 준비 상태 확인
          const isPythonReady = await checkPythonServerReady();
          if (!isPythonReady) {
            console.error("Python 서버가 준비되지 않았으므로 연결 시도를 중단합니다.");
            return;
          }

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

        const response = await fetch("http://192.168.0.25:5003/offer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sdp: pc.localDescription.sdp,
            type: pc.localDescription.type,
          }),
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const answer = await response.json();

        if (!answer.sdp || !answer.type) {
          throw new Error("Invalid answer received from the server.");
        }

        await pc.setRemoteDescription(answer);

        if (typeof onConnected === 'function') {
          onConnected();
        }
      } catch (error) {
        console.error("오류 발생:", error);
      } finally {
        isNegotiatingRef.current = false; // 협상이 완료되었으므로 플래그를 해제
      }
    };

    // signalingState가 stable 상태에서만 negotiate 함수 호출
    if (pc.signalingState === 'stable') {
      negotiate();
    }

    return () => {
      // 클린업: 필요한 경우 추가적인 클린업 로직을 여기에 추가
    };
  }, [pc, stream,setStream, onConnected]);

  return null; // 이 컴포넌트는 화면에 렌더링되지 않음
};

export default WebRTCClient;
