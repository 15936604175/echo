import { useEffect, useRef, useState, useCallback } from 'react';

type VrmState = 'loading' | 'ready' | 'error';

function setupModel(app: any, model: any, w: number, h: number) {
  const modelW = model.internalModel.width;
  const modelH = model.internalModel.height;

  const scale = (w / modelW) * 1.02;

  model.scale.set(scale);
  model.x = (w - modelW * scale) / 2;
  model.y = 0;
}

export function useVrmModel(containerRef: React.RefObject<HTMLDivElement | null>, modelUrl: string) {
  const [vrmState, setVrmState] = useState<VrmState>('loading');
  const [error, setError] = useState<string | null>(null);
  const appRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = container.clientWidth || 320;
    const cssH = container.clientHeight || 400;
    const pxW = Math.round(cssW * dpr);
    const pxH = Math.round(cssH * dpr);

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

        app = new PIXI.Application({
          view: canvas,
          width: pxW,
          height: pxH,
          resolution: dpr,
          transparent: true,
          backgroundAlpha: 0,
          antialias: true,
          autoStart: true,
        });
        appRef.current = app;

        const model = await PIXI.live2d.Live2DModel.from(modelUrl);
        modelRef.current = model;

        setupModel(app, model, pxW, pxH);
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
      const cW = container.clientWidth;
      const cH = container.clientHeight;
      const pW = Math.round(cW * dpr);
      const pH = Math.round(cH * dpr);
      app.renderer.resolution = dpr;
      app.renderer.resize(pW, pH);
      setupModel(app, modelRef.current, pW, pH);
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
  }, [containerRef, modelUrl]);

  const setAnimation = useCallback((state: 'idle' | 'talking' | 'thinking') => {
    if (!modelRef.current) return;
    modelRef.current.motion(`Tap@Body`);
  }, []);

  return { vrmState, error, setAnimation };
}
