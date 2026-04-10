// // src/App.js
// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import SplashPage from './pages/0_Splash';
// import ProductMovementPage from './pages/1_ProductMovement';
// import ProductRecognitionPage from './pages/2_ProductRecognition';
// import PaymentPage from './pages/3_Payment';
// import ReceiveProductPage from './pages/4_ReceiveProduct';
// import EndPage from './pages/5_End';
// import { StreamProvider } from './components/StreamContext';
// import { WebRTCProvider } from './components/WebRTCContext';

// function App() {
//   return (
//     // 페이지 설정
//     <WebRTCProvider>
//     <StreamProvider>
//       <Router>
//         <Routes>
//           {/* 스플래쉬 화면이 기본 페이지로 로드 */}
//           <Route path="/" element={<SplashPage />} />
//           {/* 상품 이동 페이지 */}
//           <Route path="/product-movement" element={<ProductMovementPage />} />
//           {/* 상품 인식 페이지 */}
//           <Route path="/product-recognition" element={<ProductRecognitionPage />} />
//           {/* 상품 결제 페이지 */}
//           <Route path="/payment" element={<PaymentPage />} />
//           {/* 상품 수령 페이지 */}
//           <Route path="/receive-product" element={<ReceiveProductPage />} />
//           {/* 시스템 종료 페이지 */}
//           <Route path="/end" element={<EndPage />} />
//         </Routes>
//       </Router>
//     </StreamProvider>
//     </WebRTCProvider>
//   );
// }

// export default App;


import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SplashPage from './pages/0_Splash';
import ProductMovementPage from './pages/1_ProductMovement';
import ProductRecognitionPage from './pages/2_ProductRecognition';
import PaymentPage from './pages/3_Payment';
import ReceiveProductPage from './pages/4_ReceiveProduct';
import EndPage from './pages/5_End';
import { StreamProvider } from './components/StreamContext';
import { WebRTCProvider } from './components/WebRTCContext';

function App() {
  return (
    <WebRTCProvider>
      <StreamProvider>
        <Router>
          <Routes>
            {/* 스플래쉬 화면이 기본 페이지로 로드 */}
            <Route path="/" element={<SplashPage />} />
            {/* 상품 이동 페이지 */}
            <Route path="/product-movement" element={<ProductMovementPage />} />
            {/* 상품 인식 페이지 */}
            <Route path="/product-recognition" element={<ProductRecognitionPage />} />
            {/* 상품 결제 페이지 */}
            <Route path="/payment" element={<PaymentPage />} />
            {/* 상품 수령 페이지 */}
            <Route path="/receive-product" element={<ReceiveProductPage />} />
            {/* 시스템 종료 페이지 */}
            <Route path="/end" element={<EndPage />} />
            {/* 정의되지 않은 모든 경로는 Express 서버로 전달 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </StreamProvider>
    </WebRTCProvider>
  );
}

// 경로가 없는 경우 NotFound 컴포넌트
function NotFound() {
  return <h1>404: 페이지를 찾을 수 없습니다.</h1>;
}

export default App;
