import React, { useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import LetterModel from "./LetterModel";

function App() {
  const TEXTS = ["A", "$", "A", "P", , "R", "O", "C", "K", "Y"];

  const spacing = 7.5;
  const [isAnimationActive, setIsAnimationActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const speedMultiplier = 1.4; // Коэффициент скорости анимации

  //запуск анимации при наведении
  const startAnimation = useCallback(() => {
    if (!isAnimationActive) {
      setIsAnimationActive(true);
      setStartTime(Date.now()); // Устанавливаем время начала анимации
      setTimeout(
        () => {
          setIsAnimationActive(false);
        },
        4000 + TEXTS.length * 50 // Увеличиваем время ожидания на общую задержку
      );
    }
  }, [isAnimationActive, TEXTS.length]);

  return (
    <div style={{ height: "100vh", width: "100vw", background: "black" }}>
      <Canvas camera={{ position: [0, 0, 80], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 30]} intensity={1} />

        {TEXTS.map((text, index) => (
          <group key={index}>
            <LetterModel
              text={text}
              position={[index * spacing - (TEXTS.length * spacing) / 2, 10, 0]} // Исходная позиция Y для "падения"
              isAnimationActive={isAnimationActive}
              startTime={startTime}
              startAnimation={startAnimation}
              index={index}
              speedMultiplier={speedMultiplier}
            />
          </group>
        ))}

        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
