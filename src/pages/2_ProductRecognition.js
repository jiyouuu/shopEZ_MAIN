import React, { useEffect, useState,useRef, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import ProductCard from '../components/ProductCard';
import io from 'socket.io-client';
import axios from 'axios';
import productsData from '../data/products';
import '../styles/2_ProductRecognition.css';
import '../styles/Form.css';
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
    const lang = "ko-KR";
    const utterThis = new SpeechSynthesisUtterance(text);
    const kor_voice = voices.find(
      (elem) => elem.lang === lang || elem.lang === lang.replace("-", "_")
    );

    if (kor_voice) {
      utterThis.voice = kor_voice;
      utterThis.lang = lang;
      window.speechSynthesis.speak(utterThis);
    } else {
      console.error("한국어 음성을 찾을 수 없습니다.");
    }
  });
};

function ProductRecognition() {
  const navigate = useNavigate();
  const [products] = useState(productsData);  // 초기 상태 설정
  const [recognizedProducts, setRecognizedProducts] = useState([]);  // 인식된 상품 상태 관리
  const maxRecognitionCount = 4;  // 최대 인식 개수
  const [isRecognitionComplete, setIsRecognitionComplete] = useState(false);  // 인식 완료 상태 관리
  const [countdown, setCountdown] = useState(10);  // 7초 카운트다운 초기값 설정
  const [isStreamReady, setIsStreamReady] = useState(false); // 스트림 준비 상태
  const [isVideoVisible, setIsVideoVisible] = useState(true); // 비디오 가시성 상태 추가
    // StreamContext에서 stream 가져오기
    const { stream } = useContext(StreamContext);
    // const { stream, setStream } = useContext(StreamContext);
    // 비디오 참조를 위한 useRef 사용
    const videoRef = useRef(null);

  // 2번 페이지 들어오면, 페이지 정보를 인식 서버로 전송
  // const sendPageInfoToServer = async (currentPage = 2) => {
  //   try {
  //     await axios.post('http://192.168.0.25:4002/page-info', { currentPage });
  //     console.log('페이지 정보 전송 완료');
  //   } catch (error) {
  //     console.error('페이지 정보 전송 실패:', error);
  //   }
  // };

  useEffect(() => {
    console.log('Stream 상태:', stream);
  }, [stream]);
  
 
  useEffect(() => {
    if (isRecognitionComplete) {
      setIsVideoVisible(false); // 상품 인식 완료 시 즉시 비디오 창 숨기기
    }
  }, [isRecognitionComplete]);
  

  useEffect(() => {
    // 페이지 초기화
    const initializePage = async () => {
      // 페이지 정보 전송
      // sendPageInfoToServer();
      try {
        // 2recog.js 실행
        await axios.get('http://192.168.0.25:3001/run-2recog');
        console.log('2recog.js 실행 성공');
      } catch (error) {
        console.error('2recog.js 실행 실패:', error);
      }
    };
  
    initializePage();
  }, []); // 빈 배열을 의존성으로 넣어 페이지 로드 시 한 번 실행


  useEffect(() => {
    const isScreenTouched = localStorage.getItem('isScreenTouched');
    if (isScreenTouched === 'true') {
      getSpeech("상품 인식을 시작합니다.")
        .then(() => new Promise(resolve => setTimeout(resolve, 1000))) 
        .then(() => getSpeech("로봇 팔이 인식한 상품이 맞는지 확인해주세요!"));
    }
  }, []);

   // 비디오 스트림 설정
   useEffect(() => {
    if (stream && videoRef.current && !isStreamReady) {
      // 비디오 요소에 단 한 번만 스트림 설정
      videoRef.current.srcObject = stream;
      setIsStreamReady(true); // 스트림이 설정되었음을 기록
    }
  }, [stream,isStreamReady]);

  


  useEffect(() => {
const newSocket = io('http://192.168.0.25:5001');  // 서버에 연결
    
newSocket.on('connect', () => {
  console.log('Socket.IO 연결 성공');
});

newSocket.on('disconnect', () => {
  console.log('Socket.IO 연결 끊김');
});

newSocket.on('product-recognized', (data) => {
  const { class_id } = data;  // 서버에서 넘어온 class_id 추출
  console.log('Received class_id:', class_id);  // class_id를 콘솔에 출력

  const recognizedProduct = products.find(product => product.id === parseInt(class_id));

  if (recognizedProduct) {
    // 중복 여부 확인 없이 추가
    setRecognizedProducts((prevProducts) => [...prevProducts, recognizedProduct]);
  }
});

// 컴포넌트 언마운트 시 소켓 연결 종료
return () => {
  newSocket.close();  // 컴포넌트가 언마운트될 때 소켓 연결 해제
};
}, [products]);






  useEffect(() => {
    const fetchRecognizedProducts = async () => {
      try {
        const response = await axios.get('http://192.168.0.25:5001/recognized-products');
        console.log("Response data:", response.data); 
        if (response.data && response.data.recognized_products) {
          const recognizedProductIDs = response.data.recognized_products;
          const recognizedItems = productsData.filter(product => recognizedProductIDs.includes(product.id));
          setRecognizedProducts(recognizedItems);
        }
      } catch (error) {
        console.error('Error fetching recognized products:', error);
      }
    };

    fetchRecognizedProducts();
  }, []);



  useEffect(() => {
    if (recognizedProducts.length >= 3) {
      // 4개를 기다리는 타이머 설정
      const gracePeriod = setTimeout(() => {
        if (recognizedProducts.length >= maxRecognitionCount) {
          setIsRecognitionComplete(true); // 인식 완료 상태 업데이트
          console.log("4개 이상 상품 인식. 페이지 이동 준비.");
          
        } else {
          console.log("3개만 인식. 유예 기간 만료로 페이지 이동.");
        }
        
        
        
        // 1초 간격으로 카운트다운 감소
        const countdownInterval = setInterval(() => {
          setCountdown((prevCountdown) => prevCountdown - 1);
        }, 1000);
  
        // 10초 후 페이지 이동
        const timeout = setTimeout(() => {
          navigate('/payment');
        }, 10000);
  
        // 컴포넌트 언마운트 시 타이머 및 인터벌 정리
        return () => {
          clearTimeout(timeout);
          clearInterval(countdownInterval);
        };
      }, 5000); // 5초 유예 시간 (원하는 시간으로 변경 가능)
  
      return () => {
        clearTimeout(gracePeriod); // 유예 타이머 초기화
      };
    }
  }, [recognizedProducts, navigate]);


  const totalPrice = recognizedProducts.reduce((acc, product) => acc + product.price , 0);  // 각 상품의 가격을 모두 합산

//--------------------------ShopEZ3상품 통신-----------------------------------------------------------------------------------------
  useEffect(() => {
    if (isRecognitionComplete) {
      console.log('인식된 상품:', recognizedProducts); // 전체 상품 로그 확인
    
      const productIds = recognizedProducts.map((product) => product.id); // 상품 ID 배열 생성


      axios
      .post('http://192.168.0.10:8000/update-inventory', {
        productIds, // 배열로 전송
      })
      .then((response) => {
        console.log('재고 업데이트 성공:', response.data);
      })
      .catch((error) => {
        console.error('재고 업데이트 실패:', error);
      });
    
  
      // 기존 매출 전송 로직
      axios.post('http://192.168.0.10:8000/add-daily-sales', { saleAmount: totalPrice })
        .then(response => {
          console.log('매출 전송 성공:', response.data);
        })
        .catch(error => {
          console.error('매출 전송 실패:', error);
        });
    }
  }, [isRecognitionComplete, recognizedProducts, totalPrice]);

  return (
    <div className="page-container">
      <ProgressBar initialStep={2} />
      <div className="main-form">
       {/* isVideoVisible가 true일 때만 비디오 창 표시 */}
      {isVideoVisible && (
        <video
          autoPlay
          playsInline
          muted
          style={{
            position: "relative",        // 비디오 위치를 조정
            width: "100%",              
            top: "-30px",                // 조금 더 위로 이동
            height: "450px",             // 높이 설정
            maxWidth: "600px",           // 최대 너비를 제한
            maxHeight: "500px",          // 최대 높이를 증가
            objectFit: "cover",        // 비율을 유지하며 전체를 표시
          }}
          ref={videoRef}
        />
      )}
        <p className='recog'>로봇 팔이 인식한 상품이 맞는지 확인해주세요!</p>

        <div className="product-table">
          <table className="product-table2">
            <thead>
              <tr className="table-header">
                <th className="th1">상품 사진</th>
                <th className="th2">상품 이름</th>
                <th className="th3">수량</th>
                <th className="th4">가격</th>
              </tr>
            </thead>
            {/* <tbody>
              {recognizedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </tbody> */}
            <tbody>
            {recognizedProducts.map((product, index) => (
              <ProductCard key={`${product.id}-${index}`} product={product} />
            ))}
           </tbody>
            <tfoot>
              <tr>
                <td colSpan="2" className='th6'>총 합계</td>
                <td colSpan="2" className='th5'>{totalPrice.toLocaleString()}원</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {isRecognitionComplete && (
          <>
            <p className="completion-message">상품 인식이 끝났습니다.</p>
            <p className="completion-message2"><span style={{ color: '#005CB8'}}>{countdown}</span> 초 후에 포장 페이지로 이동합니다.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default ProductRecognition;

