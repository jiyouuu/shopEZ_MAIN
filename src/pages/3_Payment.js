// src/pages/ProductRecognition.js

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar'; // ProgressBar 컴포넌트 불러오기
import '../styles/3_Payment.css'; // 스타일 파일
import '../styles/Form.css'; // 기본 스타일링
import Packing from '../assets/bag1.png';
import Arrow1 from '../assets/arrow1.png';
import Cookie from '../assets/cookies.png';
import axios from 'axios';


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
  

function ProductPayment() {
    const navigate = useNavigate();

    // 페이지 로드 시 음성 안내 실행

        useEffect(() => {
          const isScreenTouched = localStorage.getItem('isScreenTouched');
          if (isScreenTouched === 'true') {
              // 로봇팔 이동과 음성 병렬 실행
              const robotArmMovement = axios.get('http://192.168.0.25:3001/run-3pay');
              const playSpeech = getSpeech("고객님의 소중한 상품, 로봇 팔이 안전하게 포장을 시작합니다!");
      
              // 병렬 실행 완료 후 처리
              Promise.all([robotArmMovement, playSpeech])
                  .then(([robotResponse]) => {
                      // 로봇팔 작업 상태 확인
                      if (robotResponse.data.status === 'completed') {
                          console.log('로봇 팔 이동 완료(3pay.js), 다음 페이지로 이동합니다.');
                          navigate('/receive-product');
                      } else {
                          console.log('로봇 팔 이동 진행 중.');
                      }
                  })
                  .catch(error => {
                      console.error('로봇 팔 이동 또는 음성 안내 중 오류 발생:', error);
                  });
          }
      }, [navigate]);

      
    return (
        <div className="page-container">
            {/* ProgressBar는 상단에 고정 */}
            <ProgressBar initialStep={3} />
            <div className="main-form">
                <div className='arrow_form'>
                <img src={Arrow1} alt="화살표"  className='arrow1' />
                <img src={Cookie} alt="cookie"  className='cookiepack' />
                <img src={Arrow1} alt="화살표" className='arrow2' /></div>
                <img src={Packing} alt="포장중" className='bag' />
                <h1 className="pack">
                        로봇 팔이 상품을 포장 중입니다.
                </h1>
                <p className='notice1'>*로봇 팔이 빠르게 움직입니다.<br></br>다가가지 마세요!</p>
            </div>
        </div>
    );
}

export default ProductPayment;
