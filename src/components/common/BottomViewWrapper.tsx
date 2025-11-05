import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, {useContext, useEffect, useState} from 'react';
import {
  Alert,
  BackHandler,
  Dimensions,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {ms} from 'react-native-size-matters';
import {AppThemeContext} from '../../Contexts/ThemeProviders';
import {AppThemeType} from '../../utils/interface';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ReactNativeModal from 'react-native-modal';

interface BottomViewWrapperInterface {
  children: React.ReactNode;
  isVisible: boolean;
  closeSheet: () => void;
  allowDragToClose?: boolean;
  bottomSheetRef: React.RefObject<BottomSheetModal>;
}

const DEVICE_HEIGHT = Dimensions.get('window').height;
const DEVICE_WIDTH = Dimensions.get('window').width;

const BottomViewWrapper: React.FC<BottomViewWrapperInterface> = ({
  children,
  isVisible,
  closeSheet,
  allowDragToClose = false,
}) => {
  // const { theme } = useContext(AppThemeContext);
  // const styles = dynamicStyles(theme);

  // const translateY = useSharedValue(DEVICE_HEIGHT);
  // const animating = useSharedValue(false);
  // const [showBackdrop, setShowBackdrop] = useState(false);

  // Android back handler
  // useEffect(() => {
  //   const backHandler = BackHandler.addEventListener(
  //     'hardwareBackPress',
  //     () => {
  //       if (isVisible) {
  //         closeSheet();
  //         return false;
  //       }
  //       return true;
  //     },
  //   );
  //   return () => backHandler.remove();
  // }, [isVisible, closeSheet]);

  const {bottom} = useSafeAreaInsets();

  // // Open/close animation
  // useEffect(() => {
  //   animating.value = true;
  //   if (isVisible) {
  //     setShowBackdrop(true);
  //     translateY.value = withSpring(0, { damping: 20, stiffness: 200 }, () => {
  //       animating.value = false;
  //     });
  //   } else {
  //     translateY.value = withTiming(DEVICE_HEIGHT, {}, () => {
  //       animating.value = false;
  //       runOnJS(setShowBackdrop)(false);
  //     });
  //   }
  // }, [isVisible]);

  // // Drag gesture
  // const panGesture = Gesture.Pan()
  //   .onUpdate(event => {
  //     if (!allowDragToClose) return;
  //     translateY.value = Math.max(translateY.value + event.changeY, 0);
  //   })
  //   .onEnd(() => {
  //     if (!allowDragToClose) return;
  //     if (translateY.value > DEVICE_HEIGHT * 0.3) {
  //       translateY.value = withTiming(DEVICE_HEIGHT, {}, () => {
  //         runOnJS(closeSheet)();
  //         runOnJS(setShowBackdrop)(false);
  //       });
  //     } else {
  //       translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
  //     }
  //   });

  // // Backdrop opacity
  // const backdropOpacity = useDerivedValue(() =>
  //   interpolate(
  //     translateY.value,
  //     [0, DEVICE_HEIGHT],
  //     [0.5, 0],
  //     Extrapolation.CLAMP,
  //   ),
  // );

  // const shouldRender = useDerivedValue(() => backdropOpacity.value > 0.01);

  // // Backdrop animated style
  // const backdropStyle = useAnimatedStyle(() => ({
  //   opacity: backdropOpacity.value,
  //   pointerEvents: shouldRender.value ? 'auto' : 'none',
  // }));

  // // Modal animated style
  // const animatedSheetStyle = useAnimatedStyle(() => ({
  //   transform: [{ translateY: translateY.value }],
  // }));

  // // Detect when modal is fully dragged away
  // useAnimatedReaction(
  //   () => translateY.value,
  //   (current, previous) => {
  //     if (
  //       previous !== undefined &&
  //       current >= DEVICE_HEIGHT &&
  //       previous < DEVICE_HEIGHT
  //     ) {
  //       runOnJS(closeSheet)();
  //       runOnJS(setShowBackdrop)(false);
  //     }
  //   },
  // );

  // const navbarHeight =
  //   Dimensions.get('screen').height -
  //   Dimensions.get('window').height -
  //   (StatusBar.currentHeight || 0);

  return (
    // <>
    //   {/* Backdrop */}
    //   {showBackdrop && (
    //     <Animated.View
    //       onTouchStart={() => {
    //         if (!animating.value && backdropOpacity.value > 0.1) {
    //           runOnJS(closeSheet)();
    //           runOnJS(setShowBackdrop)(false);
    //         }
    //       }}
    //       style={[
    //         StyleSheet.absoluteFillObject,
    //         styles.backdrop,
    //         backdropStyle,
    //       ]}
    //     />
    //   )}

    //   {/* Modal Sheet */}
    //   <Animated.View
    //     style={[
    //       styles.modalContainer,
    //       animatedSheetStyle,
    //       { paddingBottom: navbarHeight },
    //     ]}>
    //     <GestureDetector gesture={panGesture}>
    //       <View style={styles.sheetInner}>{children}</View>
    //     </GestureDetector>
    //   </Animated.View>
    // </>
    <ReactNativeModal
      isVisible={isVisible}
      style={{margin: 0}}
      onBackButtonPress={closeSheet}
      onBackdropPress={closeSheet}
      hardwareAccelerated
      animationOutTiming={500}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut={'slideOutDown'}
      onDismiss={() => console.log('DISMIEDDS')}>
      <Pressable
        style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          height: '100%',
          width: '100%',
          justifyContent: 'flex-end',
        }}
        onPress={closeSheet}>
        <View
          style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            padding: 12,
            paddingBottom: 12 + bottom,
          }}>
          <ScrollView>
            <Pressable onPress={Keyboard.dismiss}>{children}</Pressable>
          </ScrollView>
        </View>
      </Pressable>
    </ReactNativeModal>
  );
};

export default React.memo(BottomViewWrapper);

const dynamicStyles = (_theme: AppThemeType) =>
  StyleSheet.create({
    modalContainer: {
      position: 'absolute',
      bottom: 0,
      width: DEVICE_WIDTH,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      overflow: 'hidden',
      backgroundColor: 'white',
      zIndex: 999,
    },
    sheetInner: {
      paddingHorizontal: ms(20),
      paddingVertical: ms(12),
      // paddingBottom: '30%',
      flex: 1,
    },
    backdrop: {
      backgroundColor: 'rgba(0,0,0,0.6)',
      zIndex: 998,
    },
  });

// import { StyleSheet, Text, View } from 'react-native';
// import React, { useCallback } from 'react';
// import { TextNormal } from '../common/Texts';
// import { ms } from 'react-native-size-matters';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// const BottomViewWrapper: React.FC<BottomViewWrapperInterface> = (props) => {
//   const { children, closeSheet, isVisible, allowDragToClose, bottomSheetRef } = props;
//   // callbacks
//   const handleSheetChanges = useCallback((index: number) => {
//     console.log('handleSheetChanges', index);
//     index < 0 && closeSheet()
//   }, []);

//   const { bottom } = useSafeAreaInsets()
//   return (
//     <BottomSheetModal
//       ref={bottomSheetRef}
//       onChange={handleSheetChanges}
//       android_keyboardInputMode='adjustResize'
//       keyboardBehavior='interactive'
//       // animateOnMount={false}
//       animationConfigs={{ duration: 100 }}
//     >
//       <BottomSheetScrollView style={[styles.container, { paddingBottom: bottom }]}>
//         {children}
//       </BottomSheetScrollView>
//     </BottomSheetModal>
//   );
// };

// export default BottomViewWrapper;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingHorizontal: ms(20),
//     paddingVertical: ms(12),
//   }
// });
