import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import { Card } from '../ui/Card';
import { theme } from '../../theme';

interface PieChartData {
  name: string;
  amount: number;
}

interface PieChartCardProps {
  title: string;
  data: PieChartData[];
  delay?: number;
}

export const PieChartCard = ({ title, data, delay = 0 }: PieChartCardProps) => {
  const screenWidth = Dimensions.get('window').width;
  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  const chartColors = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
  ];

  const chartData = data.map((item, index) => ({
    name: item.name,
    amount: item.amount,
    color: chartColors[index % chartColors.length],
    legendFontColor: theme.colors.onSurface,
    legendFontSize: 12,
  }));

  return (
    <Card delay={delay}>
      <Text variant="titleMedium" style={styles.title}>{title}</Text>
      {data.length > 0 ? (
        <View style={styles.chartContainer}>
          <PieChart
            data={chartData}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      ) : (
        <Text style={styles.noDataText}>No data available</Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: theme.spacing.md,
    fontWeight: 'bold',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  noDataText: {
    textAlign: 'center',
    marginVertical: theme.spacing.xl,
    color: theme.colors.onSurfaceVariant,
  },
}); 