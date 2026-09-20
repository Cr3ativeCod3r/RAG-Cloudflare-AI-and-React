import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';

function Model({ isLoading, ...props }: { isLoading: boolean; [key: string]: any }) {
  const { scene } = useGLTF('/woman_head.glb');
  const groupRef = useRef<THREE.Group>(null);

  // Animacja uruchamiana co klatkę (frame)
  useFrame((state) => {
    if (!groupRef.current) return;

    if (isLoading) {
      // Jeśli AI generuje odpowiedź, głowa wykonuje powolne, subtelne ruchy (np. myślenie)
      // Math.sin tworzy płynne oscylacje z czasem (state.clock.elapsedTime)
      const targetRotationX = Math.sin(state.clock.elapsedTime * 2.5) * 0.04; // lekkie kiwanie góra-dół
      const targetRotationY = Math.sin(state.clock.elapsedTime * 1.5) * 0.08; // lekkie kręcenie lewo-prawo
      
      // Płynne przejście (lerp) do pożądanej rotacji
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.05);
    } else {
      // Gdy czeka, wraca miękko do nieruchomej pozycji patrząc na wprost
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05);
    }
  });

  return (
    <group ref={groupRef} {...props}>
      {/* Dostosowana skala i drobne obniżenie na osi Y wewnątrz grupy centrującej */}
      <primitive object={scene} scale={5} position={[0, -0.4, 0]} />
    </group>
  );
}

export default function Avatar3D({ isLoading = false }: { isLoading?: boolean }) {
  return (
    <div className="w-full h-full min-h-[150px] relative rounded-t-lg overflow-hidden bg-gradient-to-b from-purple-100 to-white">
      {/* 
        - Zablokowana kamera, brak OrbitControls
        - position: [0, 0.3, 1.8] patrzy minimalnie z góry, bardzo blisko (zoom na twarz)
        - fov: 35 daje "portretową" perspektywę (mniej przerysowań jak rybie oko) 
      */}
      <Canvas camera={{ position: [0, 0.3, 1.8], fov: 35 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          {/* Dodatkowe oświetlenie z różnych stron dla głębi detali */}
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-5, 5, 2]} intensity={0.5} />
          
          <Center>
            <Model isLoading={isLoading} />
          </Center>

          <Environment preset="city" />
        </Suspense>
      </Canvas>
      {/* Overlay statusu */}
      <div className="absolute bottom-2 right-2 flex items-center gap-2">
         <span className="flex h-3 w-3 relative">
           {isLoading ? (
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
           ) : (
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
           )}
           <span className={`relative inline-flex rounded-full h-3 w-3 ${isLoading ? 'bg-blue-500' : 'bg-green-500'}`}></span>
         </span>
         <span className="text-xs font-semibold text-gray-700">
           {isLoading ? 'Pisze...' : 'Online'}
         </span>
      </div>
    </div>
  );
}

useGLTF.preload('/woman_head.glb');
