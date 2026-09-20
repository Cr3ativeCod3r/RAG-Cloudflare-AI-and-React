import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';

function Model(props: any) {
  // Load the GLB from the public folder
  const { scene } = useGLTF('/woman_head.glb');
  
  // Center and scale the model so it looks good in a small container
  return <primitive object={scene} scale={1.5} position={[0, -1.2, 0]} {...props} />;
}

export default function Avatar3D() {
  return (
    <div className="w-full h-full min-h-[150px] relative rounded-t-lg overflow-hidden bg-gradient-to-b from-purple-100 to-white">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Model />
          <Environment preset="city" />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            minPolarAngle={Math.PI / 2.5} 
            maxPolarAngle={Math.PI / 2.5} 
            autoRotate 
            autoRotateSpeed={2}
          />
        </Suspense>
      </Canvas>
      {/* Overlay to give a bit of styling, optional */}
      <div className="absolute bottom-2 right-2 flex items-center gap-2">
         <span className="flex h-3 w-3 relative">
           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
           <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
         </span>
         <span className="text-xs font-semibold text-gray-700">Online</span>
      </div>
    </div>
  );
}

// Preload the model
useGLTF.preload('/woman_head.glb');
