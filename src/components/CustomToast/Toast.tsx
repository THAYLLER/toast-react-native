/* eslint-disable react-native/no-inline-styles */
import React, { type ReactNode, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import type { DimensionValue, TextStyle, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';

export interface ToastProps {
  message?: ToastMessage;
  style?: ToastStyle;
  customCloseIcon?: ReactNode;
  leftIcon?: ReactNode;
  duration?: number;
  progressBarColor?: string;
}

interface ToastMessage {
  text1?: TextInfo;
  text2?: TextInfo;
}

interface TextInfo {
  text: string;
  textStyle?: TextStyle; // Use TextStyle para estilo de texto
}

interface ToastStyle {
  backgroundColor?: string;
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  position?: 'top' | 'bottom';
  defaultTextStyle?: TextStyle; // Use TextStyle para estilo de texto
}

const defaultStyle: ToastStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  width: 'auto',
  height: 'auto',
  borderRadius: 5,
  position: 'bottom',
  defaultTextStyle: {
    color: '#fff',
    fontSize: 16,
  },
};

const defaultHeaderStyle: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const generateContainerStyle = (
  style: ToastStyle,
  translateY: SharedValue<number>
): ViewStyle => {
  const screenHeight = Dimensions.get('window').height;
  const positionValue =
    style.position === 'top' ? screenHeight * 0.06 : undefined;

  return {
    position: 'absolute',
    bottom: style.position === 'bottom' ? 20 : undefined,
    top: positionValue,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: style.borderRadius || defaultStyle.borderRadius,
    backgroundColor: style.backgroundColor || defaultStyle.backgroundColor,
    width: style.width ?? defaultStyle.width,
    height: style.height ?? defaultStyle.height,
    transform: [{ translateY: translateY.value }],
  };
};

const WIDTH = Dimensions.get('window').width * 0.965;

const Toast: React.FC<ToastProps> = ({
  message,
  style,
  customCloseIcon,
  leftIcon,
  duration = 3000,
  progressBarColor,
}) => {
  const { height } = Dimensions.get('window');
  const positionPercentage = 1.9;
  const translateY = useSharedValue(
    style?.position === 'top'
      ? -height * positionPercentage
      : height * positionPercentage
  );
  const progressWidth = useSharedValue(style?.width || defaultStyle.width);
  const remainingTime = useRef<number | null>(duration);

  useEffect(() => {
    translateY.value = withTiming(0, {
      duration: 500,
      easing: Easing.inOut(Easing.ease),
    });
  }, [translateY]);

  const exitAnimation = withTiming(style?.position === 'top' ? -300 : 300, {
    duration: 500,
    easing: Easing.inOut(Easing.ease),
  });

  const closeToast = () => {
    translateY.value = exitAnimation;
  };

  setTimeout(() => {
    closeToast();
  }, duration);

  useEffect(() => {
    progressWidth.value = withTiming(WIDTH, {
      duration: duration,
      easing: Easing.linear,
    });

    const updateProgress = (value: number) => {
      progressWidth.value = withTiming((value / 100) * WIDTH, {
        duration: duration,
        easing: Easing.linear,
      });
    };

    const interval = setInterval(() => {
      if (remainingTime.current !== null && duration) {
        const percentageCompleted =
          ((duration - remainingTime.current) / duration) * 100;

        // Update progress bar width
        updateProgress(percentageCompleted);

        // Decrement remaining time
        remainingTime.current -= 100;

        // Clear interval if remaining time is less than or equal to zero
        if (remainingTime.current <= 0) {
          clearInterval(interval);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [duration, progressWidth, remainingTime]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const barStyle = useAnimatedStyle(() => {
    return {
      height: 4,
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: progressWidth.value,
      backgroundColor: progressBarColor || 'blue',
    };
  });

  const containerStyle = generateContainerStyle(
    { ...defaultStyle, ...style },
    translateY
  );

  return (
    <Animated.View style={[containerStyle, animatedStyle]}>
      {message && (
        <View style={defaultHeaderStyle}>
          {leftIcon && (
            <View style={{ marginRight: 8, alignSelf: 'center' }}>
              {React.isValidElement(leftIcon) ? (
                leftIcon
              ) : (
                <Text>{leftIcon}</Text>
              )}
            </View>
          )}
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            {message.text1?.text ? (
              <Text
                style={{
                  ...defaultStyle.defaultTextStyle,
                  ...message.text1?.textStyle,
                }}
              >
                {message.text1.text}
              </Text>
            ) : null}
            {message.text2?.text ? (
              <Text
                style={{
                  ...defaultStyle.defaultTextStyle,
                  ...message.text2?.textStyle,
                  marginTop: message.text1?.text ? 8 : 0,
                }}
              >
                {message.text2.text}
              </Text>
            ) : null}
          </View>
          {customCloseIcon && (
            <TouchableOpacity onPress={closeToast}>
              <View style={{ padding: 8 }}>
                {React.isValidElement(customCloseIcon) ? (
                  customCloseIcon
                ) : (
                  <Text style={defaultStyle.defaultTextStyle}>
                    {customCloseIcon}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}
      <Animated.View style={barStyle} />
    </Animated.View>
  );
};

export default Toast;
