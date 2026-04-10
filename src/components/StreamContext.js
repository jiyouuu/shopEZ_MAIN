// src/components/StreamContext.js
import React, { createContext, useState } from 'react';

export const StreamContext = createContext(null);

export const StreamProvider = ({ children }) => {
  const [stream, setStream] = useState(null);

  return (
    <StreamContext.Provider value={{ stream, setStream }}>
      {children}
    </StreamContext.Provider>
  );
};

// import React, { createContext, useState, useEffect } from 'react';

// export const StreamContext = createContext(null);

// export const StreamProvider = ({ children }) => {
//   const [stream, setStream] = useState(null);

//   useEffect(() => {
//     const initStream = async () => {
//       try {
//         // MediaStream 초기화
//         const mediaStream = await navigator.mediaDevices.getUserMedia({
//           video: true,
//           audio: false, // 오디오 스트림이 필요 없으면 false
//         });
//         setStream(mediaStream);
//         console.log('Stream 초기화 성공:', mediaStream);
//       } catch (error) {
//         console.error('Stream 초기화 실패:', error);
//       }
//     };

//     // 새로고침 시 스트림 복원
//     if (!stream) {
//       initStream();
//     }

//     // 컴포넌트 언마운트 시 스트림 정리
//     return () => {
      
//     };
//   }, []);

//   return (
//     <StreamContext.Provider value={{ stream, setStream }}>
//       {children}
//     </StreamContext.Provider>
//   );
// };
