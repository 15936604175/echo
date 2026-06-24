declare namespace PIXI {
  namespace live2d {
    class Live2DModel {
      static from(url: string, options?: object): Promise<Live2DModel>;
      scale: { set(x: number, y?: number): void };
      x: number;
      y: number;
      destroy(): void;
      motion(name: string, index?: number): void;
      internalModel: {
        motions: Record<string, Array<{ file: string }>>;
      };
      update(delta: number): void;
    }
  }
}

declare class PIXI {
  static Application: new (options: {
    view?: HTMLCanvasElement;
    autoStart?: boolean;
    resizeTo?: Window | HTMLElement;
    width?: number;
    height?: number;
    backgroundAlpha?: number;
    transparent?: boolean;
    antialias?: boolean;
  }) => {
    stage: {
      addChild(child: any): void;
      removeChild(child: any): void;
    };
    renderer: {
      resize(w: number, h: number): void;
      view: HTMLCanvasElement;
      backgroundColor: number;
    };
    ticker: {
      add(fn: (delta: number) => void): void;
      remove(fn: (delta: number) => void): void;
    };
    destroy(): void;
    view: HTMLCanvasElement;
  };
}
