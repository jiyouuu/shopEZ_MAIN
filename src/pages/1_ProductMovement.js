import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import '../styles/1_ProductMovement.css';
import '../styles/Form.css';
import Cookies from '../assets/snacks.png';
import RobotArm from '../assets/robot_arm1.png';
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
  
        return new Promise((resolve) => {  // 음성 재생에 대한 Promise 추가
            if (kor_voice) {
                utterThis.voice = kor_voice;
                utterThis.lang = lang;
                utterThis.onend = () => resolve(); // 음성이 끝나면 resolve
                window.speechSynthesis.speak(utterThis);
            } else {
                console.error("한국어 음성을 찾을 수 없습니다.");
                resolve(); // 오류 시에도 resolve 호출
            }
        });
    });
};


function ProductMovement() {
    const navigate = useNavigate();
    const containerRef = useRef(null);

    useEffect(() => {
        const restartAnimation = () => {
            if (containerRef.current) {
                containerRef.current.classList.remove('animate');
                void containerRef.current.offsetHeight;
                containerRef.current.classList.add('animate');
            }
        };
        const intervalId = setInterval(restartAnimation, 4000);

        const isScreenTouched = localStorage.getItem('isScreenTouched');
        if (isScreenTouched === 'true') {
              // 음성과 API를 병렬로 실행
              const apiCall = axios.get('http://192.168.0.25:3001/run-1move');
              const speechSequence = getSpeech("상품 이동을 시작합니다")
                  .then(() => getSpeech("로봇팔이 상품을 이동 중입니다."));

             // 병렬 실행 완료 후 처리
             Promise.all([apiCall, speechSequence])
             .then(async([apiResponse]) => {
                 if (apiResponse.data.status === 'completed') {
                     console.log('로봇 팔 이동 완료, 다음 페이지로 이동합니다.');
                    //  localStorage.setItem('isScreenTouched', 'true');
                     
                    //  navigate('/product-recognition');

                    
                try {
                    // currentPage 값을 서버로 전송
                    await axios.post('http://192.168.0.25:4002/page-info', { currentPage: 2 });
                    console.log('현재 페이지 정보 전송 완료.');
                } catch (error) {
                    console.error('현재 페이지 정보 전송 중 오류 발생:', error);
                }
         
                localStorage.setItem('isScreenTouched', 'true');
                navigate('/product-recognition');
                    
                 } else {
                     console.log('로봇 팔 이동 진행 중.');
                 }
             })
             .catch(error => {
                 console.error('로봇팔 이동 또는 음성 재생 중 오류 발생:', error);
             });
     }

     return () => clearInterval(intervalId);
 }, [navigate]);



    return (
        <div className="page-container">
            <ProgressBar initialStep={1} />
            <img src={RobotArm} alt="로봇팔" className='robotarm' />
            <div className="main-form">
                <img src={Cookies} alt="바닥과자" className='cookies' />
                <div className='container animate' ref={containerRef}>
                    <h1 className="moveh1">
                        {'로봇 팔이 상품을'.split('').map((char, index) => (
                            <span key={index} style={{ whiteSpace: 'pre' }}>{char}</span>
                        ))}
                    </h1>
                    <h1 className="moveh2">
                        {'이동 중입니다.'.split('').map((char, index) => (
                            <span key={index} style={{ whiteSpace: 'pre' }}>{char}</span>
                        ))}
                    </h1>
                    <p className='notice1'>*로봇 팔 근처에 다가가지 마세요.</p>
                </div>
            </div>
        </div>
    );
}

export default ProductMovement;
