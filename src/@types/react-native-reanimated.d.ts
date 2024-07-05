// @types/react-native-reanimated.d.ts
declare module 'react-native-reanimated' {
  import { ComponentType } from 'react';
  import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

  export type SharedValue<T> = {
    value: T;
  };

  export function useSharedValue<T>(value: T): SharedValue<T>;

  export function withTiming<T>(
    value: T,
    config?: {
      duration?: number;
      easing?: (value: number) => number;
    },
    callback?: (finished: boolean) => void
  ): T;

  export function useAnimatedStyle<
    T extends ViewStyle | TextStyle | ImageStyle,
  >(updater: () => T, deps?: any[]): { [key: string]: any };

  export const Easing: {
    linear: (value: number) => number;
    ease: (value: number) => number;
    inOut: (easing: (value: number) => number) => (value: number) => number;
  };

  const Reanimated: {
    View: ComponentType<any>;
    [key: string]: any;
  };

  export default Reanimated;
}
