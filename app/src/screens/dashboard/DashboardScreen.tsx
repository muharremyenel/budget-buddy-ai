// src/screens/dashboard/DashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Text, Card, Title, ProgressBar, List, useTheme } from 'react-native-paper';
import { PieChart, LineChart, BarChart } from 'react-native-chart-kit';
import { useAuth } from '../../contexts/AuthContext';
import { getTransactions } from '../../services/transactionService';
import { Transaction } from '../../types/transaction';
import { TRANSACTION_CATEGORIES } from '../../constants/categories';

export const DashboardScreen = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<{
    expenses: { [key: string]: number };
    income: { [key: string]: number };
  }>({ expenses: {}, income: {} });
  const [categoryData, setCategoryData] = useState<{
    labels: string[];
    data: number[];
    colors: string[];
  }>({ labels: [], data: [], colors: [] });

  useEffect(() => {
    loadTransactions();
  }, []);

  const processTransactionData = (transactions: Transaction[]) => {
    const monthly: { [key: string]: { expenses: number; income: number } } = {};
    const categories: { [key: string]: number } = {};
    
    transactions.forEach(transaction => {
      // Process monthly data
      const monthKey = new Date(transaction.date).toISOString().slice(0, 7);
      if (!monthly[monthKey]) {
        monthly[monthKey] = { expenses: 0, income: 0 };
      }
      
      if (transaction.type === 'expense') {
        monthly[monthKey].expenses += transaction.amount;
        // Process category data for expenses
        categories[transaction.category] = (categories[transaction.category] || 0) + transaction.amount;
      } else {
        monthly[monthKey].income += transaction.amount;
      }
    });

    // Prepare category chart data
    const categoryChartData = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Top 5 categories

    setCategoryData({
      labels: categoryChartData.map(([category]) => {
        const cat = TRANSACTION_CATEGORIES.find(c => c.id === category);
        return cat?.name || category;
      }),
      data: categoryChartData.map(([_, amount]) => amount),
      colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
    });

    // Sort monthly data by date
    const sortedMonths = Object.entries(monthly)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6); // Last 6 months

    setMonthlyData({
      expenses: Object.fromEntries(sortedMonths.map(([month, data]) => [month, data.expenses])),
      income: Object.fromEntries(sortedMonths.map(([month, data]) => [month, data.income])),
    });
  };

  const loadTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
      processTransactionData(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
  };

  const screenWidth = Dimensions.get('window').width;

  const calculateTotals = () => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.income += transaction.amount;
        } else {
          acc.expenses += transaction.amount;
        }
        return acc;
      },
      { income: 0, expenses: 0 }
    );
  };

  const { income, expenses } = calculateTotals();
  const balance = income - expenses;

  const getRecentTransactions = () => {
    return transactions.slice(0, 5); // Show last 5 transactions
  };

  const getCategoryName = (categoryId: string) => {
    const category = TRANSACTION_CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Balance Overview */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Total Balance</Text>
          <Title style={{ color: balance >= 0 ? theme.colors.primary : theme.colors.error }}>
            ${balance.toFixed(2)}
          </Title>
        </Card.Content>
      </Card>

      {/* Monthly Overview */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Monthly Overview</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text>Income</Text>
              <Title style={{ color: theme.colors.primary }}>${income.toFixed(2)}</Title>
            </View>
            <View style={styles.column}>
              <Text>Expenses</Text>
              <Title style={{ color: theme.colors.error }}>${expenses.toFixed(2)}</Title>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <Text>Budget Usage</Text>
            <ProgressBar 
              progress={income > 0 ? expenses / income : 0} 
              color={expenses > income ? theme.colors.error : theme.colors.primary}
              style={styles.progressBar} 
            />
          </View>
        </Card.Content>
      </Card>

      {/* Spending by Category */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Spending by Category</Title>
          {categoryData.labels.length > 0 && (
            <PieChart
              data={categoryData.labels.map((label, index) => ({
                name: label,
                amount: categoryData.data[index],
                color: categoryData.colors[index],
                legendFontColor: '#7F7F7F',
                legendFontSize: 12,
              }))}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
            />
          )}
        </Card.Content>
      </Card>

      {/* Monthly Trend */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Monthly Trend</Title>
          <LineChart
            data={{
              labels: Object.keys(monthlyData.expenses).map(month => month.slice(5)), // Show only MM
              datasets: [
                {
                  data: Object.values(monthlyData.expenses),
                  color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
                  strokeWidth: 2,
                },
                {
                  data: Object.values(monthlyData.income),
                  color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`,
                  strokeWidth: 2,
                },
              ],
            }}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            bezier
          />
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: 'red' }]} />
              <Text>Expenses</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: 'green' }]} />
              <Text>Income</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Recent Transactions */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Recent Transactions</Text>
          {getRecentTransactions().map((transaction) => (
            <List.Item
              key={transaction.id}
              title={transaction.description}
              description={getCategoryName(transaction.category)}
              left={props => (
                <List.Icon 
                  {...props} 
                  icon={TRANSACTION_CATEGORIES.find(cat => cat.id === transaction.category)?.icon || 'cash'}
                />
              )}
              right={() => (
                <Text
                  style={[
                    styles.amount,
                    { color: transaction.type === 'expense' ? theme.colors.error : theme.colors.primary },
                  ]}
                >
                  {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
                </Text>
              )}
            />
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
});

export default DashboardScreen;