import React from 'react';
import { Button as PaperButton } from 'react-native-paper';
import { StyleSheet } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  mode?: 'text' | 'outlined' | 'contained';
  children: React.ReactNode;
  loading?: boolean;
}

export const Button = ({ onPress, mode = 'contained', children, loading }: ButtonProps) => {
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      loading={loading}
      style={styles.button}
    >
      {children}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 8,
  },
});