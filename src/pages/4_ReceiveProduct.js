import React, { useEffect, useContext, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar'; // ProgressBar 컴포넌트 불러오기
import '../styles/4_ReceiveProduct.css'; // 스타일 파일
import '../styles/Form.css'; // 기본 스타일링
import Receive from '../assets/bag.png';
import axios from 'axios';
import { StreamContext } from '../components/StreamContext';
import WebRTCClient from '../components/WebRTCClient';

export const getSpeech = (text) => {
    return new Promise((resolve) => {
      let voices = [];
      const setVoiceList = () => {
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
      };
  
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = setVoiceList;
      } else {
        setVoiceList();
      }
    }).then((voices) => {
      const lang = "ko-KR";
      const utterThis = new SpeechSynthesisUtterance(text);
      const kor_voice = voices.find(
        (elem) => elem.lang === lang || elem.lang === lang.replace("-", "_")
      );
  
      return new Promise((resolve) => { // 음성 재생 완료 후 resolve
        if (kor_voice) {
          utterThis.voice = kor_voice;
          utterThis.lang = lang;
          utterThis.onend = () => resolve(); // 음성 재생이 끝나면 resolve 호출
          window.speechSynthesis.speak(utterThis);
        } else {
          console.error("한국어 음성을 찾을 수 없습니다.");
          resolve(); // 음성을 찾을 수 없을 때도 resolve 호출
        }
      });
    });
  };
  
// 마지막 페이지 들어오면, 페이지 정보를 인식 서버로 전송
const sendPageInfoToServer = async (currentPage = 4) => {
    try {
      console.log('페이지 정보 전송 시도 중...');
      await axios.post('http://192.168.0.25:4002/page-info', { currentPage });  //객체 인식 express 서버 번호
      console.log('페이지 정보 전송 완료');
    } catch (error) {
      console.error('페이지 정보 전송 실패:', error);
    }
  };

  function ProductPayment() {
    const navigate = useNavigate();
    const { setStream } = useContext(StreamContext);
    const [isWebRTCReady, setIsWebRTCReady] = useState(false);
    const [hasNavigated, setHasNavigated] = useState(false);
    const [webrtcKey, setWebrtcKey] = useState(0);
  
    useEffect(() => {
      console.log("컴포넌트 로드 시 초기화");
      setIsWebRTCReady(false);
      setHasNavigated(false);
      setWebrtcKey((prev) => prev + 1); // WebRTCClient 강제 재렌더링
      sendPageInfoToServer();
    }, []);
   // WebRTC 연결 완료 시 페이지 이동
   useEffect(() => {
    const checkAndNavigate = async () => {
      try {
        const response = await axios.get('http://192.168.0.25:5003/status');
        if (response.status === 200 && isWebRTCReady && !hasNavigated) {
          console.log("서버 상태 확인 완료, 다음 페이지로 이동");
          setHasNavigated(true);
          navigate('/End');
        }
      } catch (error) {
        console.error("Python 서버 상태 확인 실패:", error);
      }
    };

    if (isWebRTCReady && !hasNavigated) {
      checkAndNavigate(); // 한 번만 확인
    }
  }, [isWebRTCReady, hasNavigated, navigate]);

  const handleStreamReady = (stream) => {
    setStream(stream);
    console.log("WebRTC 연결 완료, isWebRTCReady 설정");
    setIsWebRTCReady(true);
  };

  useEffect(() => {
    console.log("isWebRTCReady 상태 변경:", isWebRTCReady);
  }, [isWebRTCReady]);

  

  
    return (
      <>
        <div style={{ display: "none" }}>
          <WebRTCClient
            key={webrtcKey}
            setStream={handleStreamReady}
            onConnected={() => setIsWebRTCReady(true)}
          />
        </div>
  
        <div className="page-container">
          <ProgressBar initialStep={4} />
          <div className="main-form">
            <img src={Receive} alt="결제중" className="bag2" />
            <h1 className="rement">상품 포장이 완료되었습니다.</h1>
            <h1 className="rement1">
              거치대의 <span style={{ color: '#005CB8' }}>종이 가방</span>을 가져가 주세요!
            </h1>
          </div>
        </div>
      </>
    );
  }
  
  export default ProductPayment;

  