import { useEffect, useRef, useState, useCallback } from 'react';

type VrmState = 'loading' | 'ready' | 'error';

const MODEL_URL =
  'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json';

export function useVrmModel(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [vrmState, setVrmState] = useState<VrmState>('loading');
  const [error, setError] = useState<string | null>(null);
  const appRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);
    canvasRef.current = canvas;

    let cancelled = false;
    let app: any = null;

    const init = async () => {
      try {
        const PIXI = (window as any).PIXI;
        if (!PIXI) throw new Error('PIXI not loaded');

        const w = container.clientWidth || 320;
        const h = container.clientHeight || 180;

        app = new PIXI.Application({
          view: canvas,
          width: w,
          height: h,
          transparent: true,
          backgroundAlpha: 0,
          antialias: true,
          autoStart: true,
        });
        appRef.current = app;

        const model = await PIXI.live2d.Live2DModel.from(MODEL_URL);
        modelRef.current = model;

        const modelW = model.internalModel.width;
        const modelH = model.internalModel.height;
        const scale = Math.min(w / modelW, h / modelH) * 0.85;

        model.scale.set(scale);
        model.x = (w - modelW * scale) / 2;
        model.y = (h - modelH * scale) / 2 - 15;

        app.stage.addChild(model);

        if (!cancelled) setVrmState('ready');
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || '模型加载失败');
          setVrmState('error');
        }
      }
    };

    init();

    const handleResize = () => {
      if (!app || !modelRef.current || !container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      app.renderer.resize(w, h);
      const model = modelRef.current;
      const mW = model.internalModel.width;
      const mH = model.internalModel.height;
      const s = Math.min(w / mW, h / mH) * 0.85;
      model.scale.set(s);
      model.x = (w - mW * s) / 2;
      model.y = (h - mH * s) / 2 - 15;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleResize);
      try {
        if (modelRef.current) {
          modelRef.current.destroy();
          modelRef.current = null;
        }
        if (app) {
          app.destroy(true);
          appRef.current = null;
        }
      } catch {}
      if (canvasRef.current && container.contains(canvasRef.current)) {
        container.removeChild(canvasRef.current);
      }
    };
  }, [containerRef]);

  const setAnimation = useCallback((state: 'idle' | 'talking' | 'thinking') => {
    if (!modelRef.current) return;
    modelRef.current.motion(`Tap@Body`);
  }, []);

  return { vrmState, error, setAnimation };
}
