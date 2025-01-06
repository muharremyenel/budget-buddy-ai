// src/screens/dashboard/DashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Title, ProgressBar, List, useTheme } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { getTransactions } from '../../services/transactionService';
import { getUnreadAlerts, markAlertAsRead } from '../../services/notificationService';
import { Transaction } from '../../types/transaction';
import { BudgetAlert } from '../../types/notification';
import { TRANSACTION_CATEGORIES } from '../../constants/categories';
import { Card } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { NotificationPanel } from '../../components/notifications/NotificationPanel';
import { LineChartCard } from '../../components/charts/LineChartCard';
import { PieChartCard } from '../../components/charts/PieChartCard';
import { theme } from '../../theme';

export const DashboardScreen = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [unreadAlerts, setUnreadAlerts] = useState<BudgetAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [monthlyData, setMonthlyData] = useState<{
    expenses: { [key: string]: number };
    income: { [key: string]: number };
  }>({ expenses: {}, income: {} });
  const [categoryData, setCategoryData] = useState<{
    name: string;
    amount: number;
  }[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transactionData, alertData] = await Promise.all([
        getTransactions(),
        getUnreadAlerts()
      ]);
      setTransactions(transactionData);
      setUnreadAlerts(alertData);
      processTransactionData(transactionData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleDismissNotification = async (id: string) => {
    try {
      await markAlertAsRead(id);
      setUnreadAlerts(alerts => alerts.filter(alert => alert.id !== id));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const processTransactionData = (transactions: Transaction[]) => {
    const monthlyExpenses: { [key: string]: number } = {};
    const monthlyIncome: { [key: string]: number } = {};
    const categories: { [key: string]: number } = {};

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = date.toISOString().slice(0, 7);
      const amount = Number(transaction.amount) || 0;

      if (amount === Infinity || amount === -Infinity || isNaN(amount)) {
        console.warn('Invalid amount detected:', transaction);
        return;
      }

      if (transaction.type === 'expense') {
        monthlyExpenses[monthKey] = (monthlyExpenses[monthKey] || 0) + amount;
        categories[transaction.category] = (categories[transaction.category] || 0) + amount;
      } else {
        monthlyIncome[monthKey] = (monthlyIncome[monthKey] || 0) + amount;
      }
    });

    // Process category data
    const categoryChartData = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, amount]) => ({
        name: TRANSACTION_CATEGORIES.find(c => c.id === category)?.name || category,
        amount,
      }));

    setCategoryData(categoryChartData);

    // Process monthly data
    const sortedMonths = Object.entries({ ...monthlyExpenses })
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6);

    setMonthlyData({
      expenses: Object.fromEntries(sortedMonths),
      income: Object.fromEntries(
        Object.entries(monthlyIncome)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .slice(-6)
      ),
    });
  };

  const { income, expenses } = transactions.reduce(
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

  const balance = income - expenses;

  return (
    <View style={styles.container}>
      <Header
        title="Dashboard"
        notificationCount={unreadAlerts.length}
        onNotificationPress={() => setShowNotifications(!showNotifications)}
        showNotifications={showNotifications}
      />

      {showNotifications && (
        <NotificationPanel
          notifications={unreadAlerts}
          onDismiss={handleDismissNotification}
        />
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Balance Overview */}
        <Card delay={100}>
          <View style={styles.balanceContainer}>
            <View>
              <Text variant="titleMedium" style={styles.balanceLabel}>
                Total Balance
              </Text>
              <Title style={[
                styles.balanceAmount,
                { color: balance >= 0 ? theme.colors.success : theme.colors.error }
              ]}>
                ${Math.abs(balance).toFixed(2)}
              </Title>
            </View>
          </View>
        </Card>

        {/* Monthly Overview */}
        <Card delay={200}>
          <View style={styles.overviewContainer}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Monthly Overview
            </Text>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Income</Text>
                <Title style={{ color: theme.colors.success }}>
                  ${income.toFixed(2)}
                </Title>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Expenses</Text>
                <Title style={{ color: theme.colors.error }}>
                  ${expenses.toFixed(2)}
                </Title>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text>Budget Usage</Text>
                <Text style={styles.progressPercentage}>
                  {income > 0 ? ((expenses / income) * 100).toFixed(0) : 0}%
                </Text>
              </View>
              <ProgressBar
                progress={income > 0 ? expenses / income : 0}
                color={expenses > income ? theme.colors.error : theme.colors.success}
                style={styles.progressBar}
              />
            </View>
          </View>
        </Card>

        {/* Charts */}
        <PieChartCard
          title="Spending by Category"
          data={categoryData}
          delay={300}
        />

        <LineChartCard
          title="Monthly Trend"
          data={{
            labels: Object.keys(monthlyData.expenses).map(month => month.slice(5)),
            datasets: [
              {
                data: Object.values(monthlyData.expenses),
              },
              {
                data: Object.values(monthlyData.income),
              },
            ],
          }}
          delay={400}
        />

        {/* Recent Transactions */}
        <Card delay={500}>
          <View style={styles.transactionsContainer}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Recent Transactions
            </Text>
            {transactions.slice(0, 5).map((transaction) => (
              <List.Item
                key={transaction.id}
                title={transaction.description}
                description={TRANSACTION_CATEGORIES.find(cat => cat.id === transaction.category)?.name}
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
                      {
                        color: transaction.type === 'expense'
                          ? theme.colors.error
                          : theme.colors.success
                      },
                    ]}
                  >
                    {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
                  </Text>
                )}
              />
            ))}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  balanceContainer: {
    padding: theme.spacing.md,
  },
  balanceLabel: {
    color: theme.colors.onSurfaceVariant,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  overviewContainer: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
    fontWeight: 'bold',
  },
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewDivider: {
    width: 1,
    height: '100%',
    backgroundColor: theme.colors.surfaceVariant,
  },
  overviewLabel: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.xs,
  },
  progressContainer: {
    marginTop: theme.spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  progressPercentage: {
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  transactionsContainer: {
    padding: theme.spacing.md,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;