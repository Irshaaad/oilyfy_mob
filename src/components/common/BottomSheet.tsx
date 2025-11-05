import React, { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface BottomSheetProps {
  children: React.ReactNode;
  snapPoints?: number[]; // e.g. [0.25, 0.5, 0.9]
  onClose?: () => void;
}

export const CustomBottomSheet = ({
  children,
  snapPoints = [0.25, 0.5, 0.9],
  onClose,
}: BottomSheetProps) => {
  // Convert to pixel heights
  const snapHeights = snapPoints
    .map(p => SCREEN_HEIGHT * (1 - p))
    .sort((a, b) => a - b);

  const translateY = useSharedValue(SCREEN_HEIGHT);

  // === Handle pan gesture ===
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx: any) => {
      translateY.value = Math.max(ctx.startY + event.translationY, 0);
    },
    onEnd: () => {
      const closest = snapHeights.reduce((prev, curr) =>
        Math.abs(curr - translateY.value) < Math.abs(prev - translateY.value)
          ? curr
          : prev,
      );

      const shouldClose = translateY.value > SCREEN_HEIGHT * 0.75;

      if (shouldClose) {
        translateY.value = withSpring(SCREEN_HEIGHT, {}, () => {
          runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(closest);
      }
    },
  });

  // === Animate sheet position ===
  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // === Animate backdrop opacity ===
  const backdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [SCREEN_HEIGHT, snapHeights[0]],
      [0, 0.5],
      Extrapolate.CLAMP,
    );
    return { opacity };
  });

  // === Auto open to first snap point ===
  useEffect(() => {
    translateY.value = withSpring(snapHeights[0]);
  }, []);

  const handleBackdropPress = () => {
    translateY.value = withSpring(SCREEN_HEIGHT, {}, () => {
      runOnJS(onClose)();
    });
  };

  return (
    <>
      {/* === Backdrop === */}
      <Pressable onPress={handleBackdropPress} style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </Pressable>

      {/* === Bottom Sheet === */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.sheetContainer, animatedSheetStyle]}>
          <View style={styles.handleBar} />
          <Animated.ScrollView>
            {children}
          </Animated.ScrollView>
        </Animated.View>
      </PanGestureHandler>
    </>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 20,
    zIndex: 100, // ✅ ensures it's on top
    elevation: 100, // ✅ for Android
  },

  handleBar: {
    width: 50,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'black',
    zIndex: 99,
    elevation: 99,
  },
});
