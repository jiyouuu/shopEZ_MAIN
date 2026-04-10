import React, { useState, useEffect } from 'react';
import './ProgressBar.css';

const steps = [
  { label: '상품이동', step: 1 },
  { label: '상품인식', step: 2 },
  { label: '상품포장', step: 3 },
  { label: '상품수령', step: 4 }
];

const ProgressSteps = ({ initialStep }) => {
  const [activeStep, setActiveStep] = useState(initialStep - 1); // 이전 단계에서 시작

  const totalSteps = steps.length;
  const width = `${100 / (totalSteps - 1) * (activeStep - 1)}%`;

  // 페이지 로드 후에 initialStep으로 자연스럽게 이동
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveStep(initialStep); // 타이머 후에 initialStep으로 이동
    }, 100); // 100ms 후에 단계 변경 (딜레이는 필요에 따라 조정 가능)

    return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
  }, [initialStep]);

  return (
    <div className="MainContainer">
      <div className="StepContainer" style={{ '--step-width': width }}>
        {steps.map(({ step, label }) => (
          <div className="StepWrapper" key={step}>
            <div
              className="StepStyle"
              style={{
                '--step-border-color': activeStep >= step ? '#005CB8' : '#e7e8f3'
              }}
            >
              {activeStep > step ? (
                <div className="CheckMark">L</div>
              ) : (
                <span className="StepCount">{step}</span>
              )}
            </div>
            <div className="StepsLabelContainer">
              <span className="StepLabel">{label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressSteps;
