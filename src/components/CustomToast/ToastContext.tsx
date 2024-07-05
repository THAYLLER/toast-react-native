/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
  useRef,
} from 'react';
import Toast, { type ToastProps } from './Toast';
import type { DimensionValue, TextStyle } from 'react-native';

interface ToastContextProps {
  children: ReactNode;
  globalStyle?: ToastStyle;
  duration?: number;
}

interface ToastContextType {
  showToast: (params: ToastParams, behavior?: 'row' | 'replace') => void;
}

interface ToastStyle {
  backgroundColor?: string;
  width?: DimensionValue;
  height?: DimensionValue;
  position?: 'top' | 'bottom';
  borderRadius?: number;
}

type ToastMessage = {
  text1?: TextInfo;
  text2?: TextInfo;
};

type TextInfo = {
  text: string;
  textStyle?: TextStyle;
};

type ToastParams = {
  success?: OptionalParams;
  info?: OptionalParams;
  error?: OptionalParams;
  warning?: OptionalParams;
  default?: OptionalParams;
  duration?: number;
  behavior?: 'row' | 'replace';
};

type OptionalParams = {
  message?: ToastMessage;
  customStyle?: ToastStyle;
  customCloseIcon?: ReactNode;
  leftIcon?: ReactNode;
  duration?: number;
  progressBarColor?: string;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<ToastContextProps> = ({
  children,
  globalStyle,
  duration = 3000,
}) => {
  const [currentToast, setCurrentToast] = useState<ToastProps | null>(null);
  const toastQueueRef = useRef<Array<ToastProps>>([]);
  const timerRef = useRef<number | null>(null);

  const showToast = (
    params: ToastParams,
    behavior: 'row' | 'replace' = 'row'
  ) => {
    const {
      success,
      info,
      error,
      warning,
      default: defaultToast,
      duration: customDuration,
    } = params;
    const toastParams: OptionalParams =
      success || info || error || warning || defaultToast || {};
    const {
      message,
      customStyle,
      customCloseIcon,
      leftIcon,
      duration: specificDuration,
      progressBarColor,
    } = toastParams;

    const filledParams: ToastProps = {
      message: message || undefined,
      style: customStyle
        ? {
            ...globalStyle,
            ...customStyle,
            width: customStyle.width ?? globalStyle?.width,
            height: customStyle.height ?? globalStyle?.height,
          }
        : globalStyle,
      customCloseIcon: customCloseIcon || undefined,
      leftIcon: leftIcon || undefined,
      duration: specificDuration || customDuration || duration,
      progressBarColor: progressBarColor || 'blue',
    };

    if (behavior === 'replace') {
      hideCurrentToast();
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      toastQueueRef.current = [filledParams];
    } else {
      toastQueueRef.current.push(filledParams);
      hideCurrentToast();
    }

    if (!currentToast) {
      showNextToast();
    }
  };

  const showNextToast = () => {
    if (toastQueueRef.current.length > 0 && !currentToast) {
      const nextToast = toastQueueRef.current.shift() || null;
      setCurrentToast(nextToast);

      if (nextToast) {
        timerRef.current = setTimeout(() => {
          setCurrentToast(null);
          showNextToast();
        }, nextToast.duration || duration) as unknown as number;
      }
    }
  };

  const hideCurrentToast = () => {
    if (currentToast) {
      setCurrentToast(null);
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    }
  };

  useEffect(() => {
    setTimeout(() => {
      showNextToast();
    }, 100);
  }, [currentToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {currentToast && <Toast {...currentToast} />}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
