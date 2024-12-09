import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import * as THREE from "three";

const easeInOutCubic = (t) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// Функция для легкого корректирования положения вершин вдоль оси X во время вращения
const applyControlledBend = (
  geometry,
  originalPositions,
  bendAmount,
  progress
) => {
  const positionAttribute = geometry.attributes.position;
  const vertex = new THREE.Vector3();

  for (let i = 0; i < positionAttribute.count; i++) {
    vertex.fromBufferAttribute(originalPositions, i); // Используем исходные позиции

    // добавления плавности при вращении
    vertex.x += Math.sin(progress * Math.PI) * bendAmount;

    //  изменения к геометрии
    positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  positionAttribute.needsUpdate = true;
};

function LetterModel({
  text,
  position,
  isAnimationActive,
  startTime,
  startAnimation,
  index,
  speedMultiplier = 1, // Коэффициент скорости
}) {
  const ref = useRef();
  const [geometry, setGeometry] = useState();
  const [originalPositions, setOriginalPositions] = useState();

  useEffect(() => {
    const loader = new FontLoader();
    loader.load(
      "/fonts/Peddana_Regular.json",
      (font) => {
        const textGeometry = new TextGeometry(text, {
          font: font,
          size: 12,
          height: 2,
          curveSegments: 17,
          bevelEnabled: true,
          bevelThickness: 0.1,
          bevelSize: 0.1,
          bevelOffset: 0,
          bevelSegments: 3,
        });
        textGeometry.center();
        setGeometry(textGeometry);

        const original = new THREE.BufferAttribute(
          new Float32Array(textGeometry.attributes.position.array),
          3
        );
        setOriginalPositions(original);
      },
      undefined,
      (error) => {
        console.error("Error loading font:", error);
      }
    );
  }, [text]);

  // Анимация
  useFrame(() => {
    if (ref.current && isAnimationActive && geometry && originalPositions) {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;

      // Продолжительность анимации: увеличена для более плавного эффекта
      const animationDuration = 4000 / speedMultiplier;

      // Задержка между буквами, 50 мс (для более мягкого эффекта)
      const delay = index * 50;

      // Прогресс с учетом задержки
      let progress = (elapsedTime - delay) / animationDuration;

      // Ограничиваем progress от 0 до 1
      progress = Math.min(Math.max(progress, 0), 1);

      // Чуть более быстрый старт и ускорение в конце
      const easedProgress = easeInOutCubic(progress);

      // Вращаем на один полный оборот (360 градусов)
      ref.current.rotation.x = easedProgress * Math.PI * 2;

      // Применение лёгкой деформации для плавности при вращении
      const bendAmount = 0.2; // Лёгкое смещение для плавности вращения
      applyControlledBend(
        geometry,
        originalPositions,
        bendAmount,
        easedProgress
      );

      if (progress >= 1) {
        ref.current.rotation.x = Math.PI * 2;
      }
    }
  });

  // Обработка наведения курсора
  const handlePointerEnter = () => {
    startAnimation();
  };

  return geometry ? (
    <mesh
      ref={ref}
      position={position}
      onPointerEnter={handlePointerEnter}
      geometry={geometry}
    >
      <meshPhongMaterial
        attach="material"
        color="rgb(206, 159, 113)"
        specular="rgb(150, 150, 150)"
        shininess={5}
      />
    </mesh>
  ) : null;
}

export default LetterModel;
