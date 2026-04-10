import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/5_End.css'; // 스타일링 추가 (선택 사항)
import '../styles/Form.css';
import Bye from '../assets/bye.gif';
import Logo from '../assets/logo4.png';
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
        utterThis.onerror = (error) => {
          console.error("음성 재생 중 오류 발생:", error);
          resolve(); // 오류 발생해도 resolve 호출
        };
        window.speechSynthesis.speak(utterThis);
      } else {
        console.warn("한국어 음성을 찾을 수 없습니다. 음성 안내 없이 진행합니다.");
        resolve(); // 음성을 찾을 수 없는 경우에도 바로 resolve 호출
      }
    });
  });
};

function End() {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('고객님'); // 기본 이름 설정
  
  // 페이지 이동 핸들러
  const handleNavigation = useCallback(() => {
   
    localStorage.removeItem('customerName'); // 고객 이름 초기화
    localStorage.removeItem('isScreenTouched'); // 재실행 방지를 위해 제거
    setCustomerName(''); // 상태 초기화
    navigate('/'); // 메인 페이지로 이동
  }, [navigate ]);


  useEffect(() => {
    let isExecuted = false;
    const initiateProcess = async () => {

      if (isExecuted) return; // 이미 실행된 경우 종료
      isExecuted = true;

      
      const isScreenTouched = localStorage.getItem('isScreenTouched');
      const storedName = localStorage.getItem('customerName') || '고객님';
      setCustomerName(storedName);
  
      

      // 병렬 실행을 위한 Promise 배열
      const tasks = [];
  
  //       // Shopez3에 고객 데이터 전송
  //       const sendCustomerDataTask = (async () => {
  //         try {
  //           await axios.post('http://192.168.0.24:8000/add-daily-customer', { customerName: storedName });
  //           console.log('Shopez3에 고객 데이터 전송 성공');
  //         } catch (error) {
  //           console.error('Shopez3에 고객 데이터 전송 실패:', error);
  //         }
  //       })();
  //       tasks.push(sendCustomerDataTask);

  //     // 음성 안내
  //     if (isScreenTouched === 'true') {
  //       const speechTask = (async () => {
  //         try {
  //           await getSpeech(`${storedName} 님, SHOP 이지를 이용해주셔서 감사합니다!`);
  //           await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 딜레이
  //           await getSpeech("오늘도 좋은 하루 되세요!");
  //         } catch (error) {
  //           console.error("음성 재생 중 오류 발생:", error);
  //         }
  //       })();
  //       tasks.push(speechTask); // 음성 안내를 병렬 실행 작업에 추가
  //     }
      
      
  //     // 로봇 팔 이동
  //     const robotArmTask = (async () => {
  //       try {
  //         const response = await axios.get('http://192.168.0.25:3001/run-5end');
  //         if (response.status === 200 && response.data.status === 'completed') {
  //           console.log('로봇 팔 이동 완료:', response.data);
  //         } else {
  //           console.log('로봇 팔 이동 진행 중:', response.data);
  //         }
  //       } catch (error) {
  //         console.error('로봇 팔 이동 중 오류 발생:', error);
  //       }
  //     })();
  //     tasks.push(robotArmTask); // 로봇 팔 이동을 병렬 실행 작업에 추가
  

  //     // 모든 작업 완료 대기
  //   await Promise.allSettled(tasks);

  //   // End 페이지를 3초 동안 표시한 후 페이지 이동
  //   setTimeout(() => {
  //     handleNavigation();
  //   }, 4000); // 3초 대기
  // };

   // Shopez3에 고객 데이터 전송
  //  tasks.push(
  //   (async () => {
  //     try {
  //       await axios.post('http://192.168.0.24:8000/add-daily-customer', { customerName: storedName });
  //       console.log('Shopez3에 고객 데이터 전송 성공');
  //     } catch (error) {
  //       console.error('Shopez3에 고객 데이터 전송 실패:', error);
  //     }
  //   })()
  // );

  // Shopez3에 고객 데이터 전송
  tasks.push(
    axios.post('http://192.168.0.10:8000/add-daily-customer', { customerName: storedName }).catch((error) => {
      console.error('Shopez3에 고객 데이터 전송 실패:', error);
    })
  );

  // 음성 안내
  if (isScreenTouched === 'true') {
    tasks.push(
      (async () => {
        try {
          await getSpeech(`${storedName} 님, SHOP 이지를 이용해주셔서 감사합니다!`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 딜레이
          await getSpeech("오늘도 좋은 하루 되세요!");
        } catch (error) {
          console.error("음성 재생 중 오류 발생:", error);
        }
      })()
    );
  }

  // 로봇 팔 이동
  // tasks.push(
  //   (async () => {
  //     try {
  //       const response = await axios.get('http://192.168.0.25:3001/run-5end');
  //       if (response.status === 200 && response.data.status === 'completed') {
  //         console.log('로봇 팔 이동 완료:', response.data);
  //       } else {
  //         console.log('로봇 팔 이동 진행 중:', response.data);
  //       }
  //     } catch (error) {
  //       console.error('로봇 팔 이동 중 오류 발생:', error);
  //     }
  //   })()
  // );

  // 로봇 팔 이동 (비동기 처리, 페이지 이동에 영향 없음)
  axios
  .get('http://192.168.0.25:3001/run-5end', { timeout: 3000 }) // 타임아웃 3초 설정
  .then((response) => {
    if (response.status === 200 && response.data.status === 'completed') {
      console.log('로봇 팔 이동 완료:', response.data);
    } else {
      console.log('로봇 팔 이동 진행 중:', response.data);
    }
  })
  .catch((error) => {
    console.error('로봇 팔 이동 중 오류 발생:', error);
  });

  // 모든 작업 완료 대기
  try {
    await Promise.allSettled(tasks);
  } catch (error) {
    console.error('작업 도중 오류 발생:', error);
  } finally {
      handleNavigation();
  }
};
  
    // initiateProcess 실행
    initiateProcess();
  }, [handleNavigation]);

  



  return (
    <div className='main-form'>
      <img src={Logo} alt="로고" className='logo1'/>
      {/* 네모 박스 추가 */}
      <div className='box'>
        <img src={Bye} alt="종료" className='end' />
        <p style={{ color: '#005CB8', fontWeight: '600', fontSize: '4rem' }}>{customerName}님</p>
        <p className='notice2'>이용해주셔서 감사합니다.</p>
        <p className='notice3'>오늘도 좋은 하루 되세요!</p>
      </div>
    </div>
  );
}

export default End;
