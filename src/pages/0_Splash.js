// src/pages/Splash.js
import React, { useState, useEffect, useCallback, useContext, useRef  } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/0_Splash.css';
import '../styles/Form.css';
import '../styles/Welcome.css';
import Banner1 from '../assets/banner1.png';
import Banner2 from '../assets/banner2.png';
import Banner3 from '../assets/banner3.png';
import balloon from '../assets/balloon.png';
import pop from '../assets/pop.png';
import welcome from '../assets/welcome.png';
import axios from 'axios'; 
import { StreamContext } from '../components/StreamContext';

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
    const lang = "ko-KR"; // 한국어 설정
    const utterThis = new SpeechSynthesisUtterance(text);
    const korVoice = voices.find(
      (voice) => voice.lang === lang || voice.lang === lang.replace("-", "_")
    );

    return new Promise((resolve) => {
      if (korVoice) {
        utterThis.voice = korVoice;
        utterThis.lang = lang;
        utterThis.onend = () => resolve(); // 음성 재생이 끝난 후 resolve 호출
        window.speechSynthesis.speak(utterThis);
      } else {
        console.error("한국어 음성을 찾을 수 없습니다.");
        resolve(); // 음성을 찾을 수 없을 때도 resolve 호출
      }
    });
  });
};

// 마지막 페이지 들어오면, 페이지 정보를 인식 서버로 전송
const sendPageInfoToServer = async (currentPage = 0) => {
  
  try {
    console.log('페이지 정보 전송 시도 중...');
    await axios.post('http://192.168.0.25:4002/page-info', { currentPage });  //객체 인식 express 서버 번호
    console.log('페이지 정보 전송 완료');
  } catch (error) {
    console.error('페이지 정보 전송 실패:', error);
  }
};

function Splash() {
  const navigate = useNavigate();
  const banners = [Banner1, Banner2, Banner3];
  const [currentBanner, setCurrentBanner] = React.useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false); // 카메라 활성화 상태
  const [isCustomerRecognized, setIsCustomerRecognized] = useState(false); // 고객 인식 여부 상태
  const [customerName, setCustomerName] = useState(''); // 인식된 고객의 이름
  const [isAnimated, setIsAnimated] = useState(false); // 애니메이션 상태 추가
  const [isYoloActive, setIsYoloActive] = useState(false); // YOLO 활성화 상태
  const [isStreamReady, setIsStreamReady] = useState(false); // 스트림 준비 상태

  // StreamContext에서 stream 가져오기
  const { stream } = useContext(StreamContext);
  
   // 비디오 참조를 위한 useRef 사용
   const videoRef = useRef(null);

    // 터치 이벤트 처리
    const handleScreenTouch = async () => {
      localStorage.setItem('isScreenTouched', 'true'); // 터치 여부를 localStorage에 저장
      setIsCameraActive(true); // 터치 시 카메라 활성화
    };
  
    useEffect(() => {
      console.log('Stream 상태:', stream);
console.log('비디오 요소:', videoRef.current);
    }, [stream]);


  // 고객 인식 확인
  const checkCustomerRecognition = useCallback(async () => {
    if (isCustomerRecognized) 
      return;  // 이미 고객이 인식된 경우 함수 중지

    try {
      // 고객 인식 서버에 고객 인식 정보 요청
      const response = await axios.get('http://192.168.0.25:5001/get_recognized_customer');

      if (response.data.customer) {
        console.log('인식된 고객 정보:', response.data.customer);
        setCustomerName(response.data.customer.name); // 고객 이름 설정
        localStorage.setItem('customerName', response.data.customer.name); // localStorage에 고객 이름 저장
        setIsCustomerRecognized(true); // 고객 인식 상태 완료 true
        setIsCameraActive(false); // 카메라 종료
        setIsAnimated(true);

        // 환영 음성 재생 후 페이지 이동
      try {
        await getSpeech(`${response.data.customer.name}님, 환영합니다!`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
        await getSpeech("곧 상품 인식이 시작됩니다.");

        navigate('/product-movement'); // 음성 재생 후 페이지 이동
      } catch (error) {
        console.error("음성 재생 중 오류 발생:", error);
        navigate('/product-movement'); // 오류 발생 시에도 페이지 이동
      }

        // // 10초 후에 product-movement 페이지로 이동
        // setTimeout(() => {
        //   navigate('/product-movement'); // 10초 후 페이지 이동
        // }, 5000);
      }
      
      else {
        console.log('고객 정보가 없습니다. 객체 인식 서버로 스티커 인식 요청 중...');
      }
    } catch (error) {
      console.error('고객 인식 실패:', error);
    }
  }, [navigate, isCustomerRecognized]);


  useEffect(() => {
    // 화면 터치되었을 때 고객 인식 시작 
    if (isCameraActive && isYoloActive && !isCustomerRecognized) {
        const intervalId = setInterval(checkCustomerRecognition, 3000);
        
        // 클린업 함수로 인터벌 정리
        return () => clearInterval(intervalId);
    }
}, [isCameraActive, isYoloActive, isCustomerRecognized, checkCustomerRecognition]);


  // 배너 전환
  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentBanner((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [banners.length]);



  useEffect(() => {
    // YOLO 활성화 요청 및 페이지 초기화
    const initializePage = async () => {
      try {
        sendPageInfoToServer();
        await axios.post('http://192.168.0.25:5003/toggle_yolo', { yolo_active: true });
        setIsYoloActive(true); 
      } catch (error) {
        console.error('YOLO 활성화 요청 실패:', error);
      }
    };
  
    initializePage();
  
    // 정리 함수가 필요 없는 경우, 아무것도 반환하지 않음
  }, []); // 빈 배열을 의존성으로 넣어 한 번만 실행


    // 비디오 스트림 설정
  useEffect(() => {
    if (isCameraActive && isYoloActive && stream && videoRef.current && !isStreamReady) {
      // 비디오 요소에 단 한 번만 스트림 설정
      videoRef.current.srcObject = stream;
      setIsStreamReady(true); // 스트림이 설정되었음을 기록
    }
  }, [isCameraActive, isYoloActive, stream,isStreamReady]);

    // 카메라 안내 음성 실행
    useEffect(() => {
      if (isCameraActive && isStreamReady) {
        getSpeech("로봇팔에 부착된 카메라에 회원 카드를 보여주세요 !");
      }
    }, [isCameraActive, isStreamReady]);
    
  return (
    <>
      <div className="main-form" onClick={handleScreenTouch}>
        <div className="banner-container">
        {isCameraActive && isYoloActive ? (
            <>
              {isStreamReady && (
                <div
                  style={{
                    position: "absolute",
                    top: "250px",
                    left: "49%",
                    transform: "translateX(-50%)",
                    zIndex: 1,
                    color: "#005CB8",
                    padding: "20px 20px",
                    borderRadius: "1px",
                    fontSize: "43px",
                    fontFamily: "'GongGothicLight', sans-serif",
                    fontWeight: "bold",
                    lineHeight: "1.5",
                  
                  }}
                >
              로봇팔에 부착된 카메라에<br />
              회원 카드를 보여주세요!

                </div>
              )}
              <video
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%", 
                  position: "relative", 
                  top: "80px",
                  height: "100%",      // 부모 요소에 맞게 높이 설정
                  maxWidth: "800px",
                  maxHeight: "650px",
                  objectFit: "cover", // 비율을 유지하면서 요소에 맞추기
                }}
                ref={videoRef}
              />
          </>
          ) : isCustomerRecognized ? (
            <>
              <div className="balloons">
                <img src={balloon} alt="풍선" />
              </div>
              <div className="pop-container" style={{ marginTop: '280px' }}>
                <img src={pop} alt="가루" className="pop" />
                <div className="pop-text">
                  <h1 className="moveh">
                    <span style={{ color: '#005CB8' }}>{customerName}</span>님
                  </h1>
                  <div className="moveh1">
                    {'환영합니다!'.split('').map((char, index) => (
                      <span key={`환영합니다-${index}`}>{char}</span>
                    ))}
                  </div>
                  <div className={`moveh3 ${isAnimated ? 'animate' : ''}`} style={{ whiteSpace: 'nowrap' }}>
                    {'곧 상품 인식이 시작됩니다.'.split('').map((char, index) => (
                      <span key={`char-${index}`} style={{ fontSize: '2.5rem', marginRight: '0.5rem' }}>
                        {char}
                      </span>
                    ))}
                  </div>
                  <div className="moveh4">
                    {'카트를 안내선에 맞춰 주차해주세요.'.split('').map((char, index) => (
                      <span key={`char-${index}`} style={{ fontSize: '3rem', marginRight: '0.5rem' }}>
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <img src={welcome} alt="웰컴" className="welcome" />
              </div>
            </>
          ) : (
            <img
              src={banners[currentBanner]}
              alt={`배너 ${currentBanner + 1}`}
              className="banner-image"
            />
          )}
        </div>
      </div>
    </>
  );
}

export default Splash;
