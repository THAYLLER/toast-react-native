import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ToastProvider, useToast } from 'com.devnow.toast.reactnative';

export default function App() {
  return (
    <ToastProvider>
      <View style={styles.container}>
        <Toast />
      </View>
    </ToastProvider>
  );
}

const Toast = () => {
  const { showToast } = useToast();

  const show = (type: string) => {
    switch (type) {
      case 'success':
        showToast({
          success: {
            message: {
              text1: {
                text: 'Show Toast Success',
                textStyle: {
                  color: '#fff',
                  fontSize: 16,
                },
              },
            },
            customStyle: {
              position: 'top',
            },
          },
        });
        break;

      default:
        showToast({
          default: {
            message: {
              text1: {
                text: 'Show Toast Default',
                textStyle: {
                  color: '#fff',
                  fontSize: 16,
                },
              },
            },
            customStyle: {
              position: 'top',
            },
          },
        });
        break;
    }
  };

  return (
    <TouchableOpacity onPress={() => show('default')}>
      <Text>Show Toast</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
