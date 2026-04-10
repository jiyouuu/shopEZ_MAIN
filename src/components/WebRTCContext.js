// src/components/WebRTCContext.js
import React, { createContext, useState, useEffect } from 'react';

export const WebRTCContext = createContext(null);

export const WebRTCProvider = ({ children }) => {
    const [pc, setPc] = useState(null);

    useEffect(() => {
        const peerConnection = new RTCPeerConnection();
        setPc(peerConnection);

        return () => {
            peerConnection.close(); // 컴포넌트 언마운트 시 연결 닫기
        };
    }, []);

    return (
        <WebRTCContext.Provider value={{ pc }}>
            {children}
        </WebRTCContext.Provider>
    );
};
