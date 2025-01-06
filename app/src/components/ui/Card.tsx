import React from 'react';
import { StyleSheet } from 'react-native';
import { Card as PaperCard } from 'react-native-paper';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { theme } from '../../theme';

const AnimatedCard = Animated.createAnimatedComponent(PaperCard);

interface CardProps {
  children: React.ReactNode;
  delay?: number;
  style?: any;
}

export const Card = ({ children, delay = 0, style }: CardProps) => {
  return (
    <AnimatedCard
      style={[styles.card, style]}
      entering={FadeInUp.delay(delay)}
    >
      <PaperCard.Content>
        {children}
      </PaperCard.Content>
    </AnimatedCard>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: theme.spacing.md,
    marginTop: theme.spacing.sm,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: theme.colors.surface,
  },
}); 