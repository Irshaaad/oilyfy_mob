import React from 'react';
import {Modal, StyleSheet, View, ViewStyle} from 'react-native';
import {COLORS, FIXED_SIZES} from '../../utils/theme';
import ReactNativeModal from 'react-native-modal';

export type ModalWrapperType = {
  isVisible: boolean;
  closeOnBackDrop?: boolean;
  closeModal: () => void;
  onModalClose?: () => void;
  children?: React.ReactNode;
  modalStyles?: ViewStyle | ViewStyle[];
};

const ModalWrapper: React.FC<ModalWrapperType> = props => {
  const {
    isVisible,
    closeModal,
    children,
    modalStyles,
    closeOnBackDrop,
    onModalClose,
  } = props;

  const styles = dynamicStyles();

  return (
    <Modal
      visible={isVisible}
      hardwareAccelerated
      style={{margin: 0}}
      transparent
      animationType="slide">
      <View style={[styles.modal, modalStyles]}>
        <View style={styles.container}>{children}</View>
      </View>
    </Modal>
  );
};

export default ModalWrapper;

const dynamicStyles = () =>
  StyleSheet.create({
    container: {
      // flex: 1,
      backgroundColor: COLORS.white,
      borderRadius: FIXED_SIZES.smallBorderRadius,
      padding: FIXED_SIZES.padding,
      justifyContent: 'center',
      gap:10,
      minWidth: 100,
      minHeight: 100,
    },
    modal: {
      margin: 0,
      height: '100%',
      width: '100%',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
  });
