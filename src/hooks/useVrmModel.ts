import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

type VrmState = 'loading' | 'ready' | 'error';

export function useVrmModel(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [vrmState, setVrmState] = useState<VrmState>('loading');
  const [error, setError] = useState<string | null>(null);
  const vrmRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    placeholder: THREE.Mesh;
  } | null>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf9f7f2);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xfff8f0, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xfff8f0, 0.9);
    directionalLight.position.set(1, 3, 2);
    scene.add(directionalLight);

    const geometry = new THREE.CapsuleGeometry(0.3, 0.6, 4, 8);
    const material = new THREE.MeshStandardMaterial({
      color: 0xd4a373,
      roughness: 0.3,
      metalness: 0.05,
    });
    const placeholder = new THREE.Mesh(geometry, material);
    placeholder.position.y = 1;
    scene.add(placeholder);

    vrmRef.current = { scene, camera, renderer, placeholder };
    setVrmState('ready');

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      placeholder.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!vrmRef.current || !container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      vrmRef.current.camera.aspect = w / h;
      vrmRef.current.camera.updateProjectionMatrix();
      vrmRef.current.renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [containerRef]);

  const setAnimation = useCallback((state: 'idle' | 'talking' | 'thinking') => {
    if (!vrmRef.current) return;
    const { placeholder } = vrmRef.current;

    switch (state) {
      case 'idle':
        placeholder.rotation.y += 0.005; // slow idle spin
        break;
      case 'talking':
        placeholder.position.y = 1 + Math.sin(Date.now() * 0.01) * 0.05;
        break;
      case 'thinking':
        placeholder.rotation.y += 0.02;
        break;
    }
  }, []);

  return { vrmState, error, setAnimation };
}
