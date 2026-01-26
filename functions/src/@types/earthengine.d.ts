/**
 * Déclarations de types pour @google/earthengine
 * Le package n'inclut pas de types TypeScript officiels
 */

declare module '@google/earthengine' {
  export interface InitializeOptions {
    project?: string;
  }

  export interface Geometry {
    // Base geometry interface
  }

  export interface Point extends Geometry {
    // Point geometry
  }

  export interface Image {
    select(band: number | string | string[]): Image;
    rename(name: string | string[]): Image;
    addBands(other: Image): Image;
    reduceRegion(options: ReduceRegionOptions): Dictionary;
    bandNames(): ee.List;
  }

  export interface ImageCollection {
    first(): Image;
  }

  export interface Dictionary {
    get(key: string): ee.ComputedObject;
    getInfo(): Record<string, unknown> | null;
    evaluate(callback: (result: Record<string, unknown> | null, error: string | null) => void): void;
  }

  export interface List {
    // List interface
  }

  export interface ComputedObject {
    // Base computed object
  }

  export interface Reducer {
    // Reducer interface
  }

  export interface ReduceRegionOptions {
    reducer: Reducer;
    geometry: Geometry;
    scale?: number;
    maxPixels?: number;
    crs?: string;
    bestEffort?: boolean;
  }

  export const Image: {
    (assetId: string): Image;
    cat(images: Image[]): Image;
  };

  export const ImageCollection: {
    (assetId: string): ImageCollection;
  };

  export const Geometry: {
    Point(coordinates: [number, number]): Point;
  };

  export const Reducer: {
    first(): Reducer;
    mean(): Reducer;
    median(): Reducer;
  };

  export const data: {
    authenticateViaPrivateKey(
      key: object,
      onSuccess: () => void,
      onError: (error: string) => void
    ): void;
  };

  export function initialize(
    options: InitializeOptions | null,
    onSuccess: () => void,
    onError: (error: string) => void
  ): void;

  // Export par défaut pour import * as ee
  const ee: {
    Image: {
      (assetId: string): Image;
      cat(images: Image[]): Image;
    };
    ImageCollection: {
      (assetId: string): ImageCollection;
    };
    Geometry: {
      Point(coordinates: [number, number]): Point;
    };
    Reducer: {
      first(): Reducer;
      mean(): Reducer;
      median(): Reducer;
    };
    data: {
      authenticateViaPrivateKey(
        key: object,
        onSuccess: () => void,
        onError: (error: string) => void
      ): void;
    };
    initialize(
      options: InitializeOptions | null,
      onSuccess: () => void,
      onError: (error: string) => void
    ): void;
  };

  export = ee;
}
