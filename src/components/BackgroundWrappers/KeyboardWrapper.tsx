import React from 'react';
import {Keyboard, StyleSheet, TouchableWithoutFeedback} from 'react-native';

interface KeyboardWrapperProps {
  children: React.ReactNode;
}

export const KeyboardWrapper: React.FC<KeyboardWrapperProps> = props => {
  const {children} = props;

  return (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
      style={styles.container}>
      {children}
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
});
