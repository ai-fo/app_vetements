import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import NeedsInput from './NeedsInput';

export default function NeedsInputPortal({ isVisible, onSubmit, onClose }) {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        <NeedsInput 
          isVisible={isVisible}
          onSubmit={onSubmit}
          onClose={onClose}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
});