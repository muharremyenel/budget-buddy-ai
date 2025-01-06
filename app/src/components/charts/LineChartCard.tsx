import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { Card } from '../ui/Card';
import { theme } from '../../theme';

interface LineChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity?: number) => string;
    strokeWidth?: number;
  }[];
}

interface LineChartCardProps {
  title: string;
  data: LineChartData;
  delay?: number;
}

export const LineChartCard = ({ title, data, delay = 0 }: LineChartCardProps) => {
  const screenWidth = Dimensions.get('window').width;
  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '0',
    },
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: true,
  };

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        ...data.datasets[0],
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red for expenses
        strokeWidth: 2,
      },
      {
        ...data.datasets[1],
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green for income
        strokeWidth: 2,
      },
    ],
    legend: ['Expenses', 'Income'],
  };

  return (
    <Card delay={delay}>
      <Text variant="titleMedium" style={styles.title}>{title}</Text>
      {data.labels.length > 0 ? (
        <>
          <LineChart
            data={chartData}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            bezier
            withDots={false}
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLines={false}
            withHorizontalLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            fromZero={true}
            style={styles.chart}
          />
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: theme.colors.error }]} />
              <Text>Expenses</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: theme.colors.success }]} />
              <Text>Income</Text>
            </View>
          </View>
        </>
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
  chart: {
    marginVertical: theme.spacing.md,
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.xs,
  },
  noDataText: {
    textAlign: 'center',
    marginVertical: theme.spacing.xl,
    color: theme.colors.onSurfaceVariant,
  },
}); 