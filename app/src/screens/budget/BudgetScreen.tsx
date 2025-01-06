import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Surface, FAB, Portal, Dialog, TextInput, Button, List, IconButton, ProgressBar, Chip } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { getBudget, setBudget, getBudgetHistory } from '../../services/budgetService';
import { getTransactions } from '../../services/transactionService';
import { Budget } from '../../types/budget';
import { Transaction } from '../../types/transaction';
import { TRANSACTION_CATEGORIES } from '../../constants/categories';
import { theme } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LineChartCard } from '../../components/charts/LineChartCard';
import { PieChartCard } from '../../components/charts/PieChartCard';

export const BudgetScreen = () => {
  const { user } = useAuth();
  const [budget, setBudgetState] = useState<Budget | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetHistory, setBudgetHistory] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [error, setError] = useState('');

  // New Budget State
  const [newBudget, setNewBudget] = useState({
    amount: '',
    period: 'monthly' as 'monthly' | 'weekly',
    categoryLimits: {} as Record<string, number>,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [budgetData, transactionsData, historyData] = await Promise.all([
        getBudget(),
        getTransactions(),
        getBudgetHistory(),
      ]);
      setBudgetState(budgetData);
      setTransactions(transactionsData);
      setBudgetHistory(historyData);
    } catch (error) {
      console.error('Error loading budget data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSetBudget = async () => {
    if (!newBudget.amount) {
      setError('Please enter a budget amount');
      return;
    }

    try {
      setLoading(true);
      await setBudget({
        ...newBudget,
        amount: parseFloat(newBudget.amount),
      });
      setShowAddDialog(false);
      loadData();
      resetNewBudget();
    } catch (error) {
      setError('Failed to set budget');
    } finally {
      setLoading(false);
    }
  };

  const resetNewBudget = () => {
    setNewBudget({
      amount: '',
      period: 'monthly',
      categoryLimits: {},
    });
    setError('');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const calculateSpending = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return (
          t.type === 'expense' &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .reduce((total, t) => total + t.amount, 0);
  };

  const calculateCategorySpending = () => {
    const spending: Record<string, number> = {};
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return (
          t.type === 'expense' &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .forEach(t => {
        spending[t.category] = (spending[t.category] || 0) + t.amount;
      });

    return spending;
  };

  const totalSpending = calculateSpending();
  const categorySpending = calculateCategorySpending();
  const spendingPercentage = budget ? (totalSpending / budget.amount) * 100 : 0;
  const remainingBudget = budget ? budget.amount - totalSpending : 0;

  const chartData = {
    labels: budgetHistory.map(b => new Date(b.date).toLocaleDateString('en-US', { month: 'short' })),
    datasets: [
      {
        data: budgetHistory.map(b => b.amount),
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red for budget
        strokeWidth: 2,
      },
      {
        data: budgetHistory.map(() => calculateSpending()),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green for spending
        strokeWidth: 2,
      },
    ],
  };

  const pieChartData = Object.entries(categorySpending).map(([categoryId, amount]) => {
    const category = TRANSACTION_CATEGORIES.find(cat => cat.id === categoryId);
    return {
      name: category?.name || categoryId,
      amount,
    };
  });

  return (
    <View style={styles.container}>
      {/* Budget Overview */}
      <Surface style={styles.header}>
        <Text variant="titleLarge" style={styles.title}>Budget Overview</Text>
        <View style={styles.budgetInfo}>
          <View style={styles.budgetRow}>
            <Text variant="titleMedium">Monthly Budget:</Text>
            <Text variant="titleMedium" style={styles.budgetAmount}>
              ${budget?.amount.toFixed(2) || '0.00'}
            </Text>
          </View>
          <View style={styles.budgetRow}>
            <Text variant="titleMedium">Total Spending:</Text>
            <Text
              variant="titleMedium"
              style={[styles.budgetAmount, { color: theme.colors.error }]}
            >
              ${totalSpending.toFixed(2)}
            </Text>
          </View>
          <View style={styles.budgetRow}>
            <Text variant="titleMedium">Remaining:</Text>
            <Text
              variant="titleMedium"
              style={[
                styles.budgetAmount,
                { color: remainingBudget >= 0 ? theme.colors.success : theme.colors.error }
              ]}
            >
              ${remainingBudget.toFixed(2)}
            </Text>
          </View>
        </View>
        <ProgressBar
          progress={spendingPercentage / 100}
          color={spendingPercentage > 100 ? theme.colors.error : theme.colors.primary}
          style={styles.progressBar}
        />
        <Text style={styles.progressText}>
          {spendingPercentage.toFixed(1)}% of budget used
        </Text>
      </Surface>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Budget History Chart */}
        <Surface style={styles.card}>
          <Text variant="titleMedium" style={styles.cardTitle}>Budget History</Text>
          <LineChartCard
            title="Budget vs Spending"
            data={chartData}
            delay={200}
          />
        </Surface>

        {/* Category Spending */}
        <Surface style={styles.card}>
          <Text variant="titleMedium" style={styles.cardTitle}>Category Spending</Text>
          <PieChartCard
            title="Spending by Category"
            data={pieChartData}
            delay={300}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
            {Object.entries(categorySpending).map(([categoryId, amount]) => {
              const category = TRANSACTION_CATEGORIES.find(cat => cat.id === categoryId);
              const limit = budget?.categoryLimits?.[categoryId] || 0;
              const percentage = limit > 0 ? (amount / limit) * 100 : 0;

              return (
                <Surface key={categoryId} style={styles.categoryCard}>
                  <List.Item
                    title={category?.name || categoryId}
                    description={`$${amount.toFixed(2)}`}
                    left={props => (
                      <List.Icon {...props} icon={category?.icon || 'cash'} />
                    )}
                  />
                  {limit > 0 && (
                    <View style={styles.categoryLimit}>
                      <ProgressBar
                        progress={percentage / 100}
                        color={percentage > 100 ? theme.colors.error : theme.colors.primary}
                        style={styles.categoryProgress}
                      />
                      <Text style={styles.categoryLimitText}>
                        {percentage.toFixed(1)}% of ${limit.toFixed(2)}
                      </Text>
                    </View>
                  )}
                </Surface>
              );
            })}
          </ScrollView>
        </Surface>
      </ScrollView>

      {/* Add/Edit Budget FAB */}
      <FAB
        icon={budget ? 'pencil' : 'plus'}
        style={styles.fab}
        onPress={() => setShowAddDialog(true)}
      />

      {/* Set Budget Dialog */}
      <Portal>
        <Dialog visible={showAddDialog} onDismiss={() => {
          setShowAddDialog(false);
          resetNewBudget();
        }}>
          <Dialog.Title>{budget ? 'Edit Budget' : 'Set Budget'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Monthly Budget Amount"
              value={newBudget.amount}
              onChangeText={text => {
                const amount = text.replace(/[^0-9.]/g, '');
                setNewBudget(prev => ({ ...prev, amount }));
                setError('');
              }}
              keyboardType="decimal-pad"
              style={styles.input}
            />

            <Text variant="titleSmall" style={styles.sectionTitle}>Category Limits (Optional)</Text>
            <ScrollView style={styles.categoryLimits}>
              {TRANSACTION_CATEGORIES
                .filter(cat => cat.type === 'expense')
                .map(category => (
                  <TextInput
                    key={category.id}
                    label={`${category.name} Limit`}
                    value={newBudget.categoryLimits[category.id]?.toString() || ''}
                    onChangeText={text => {
                      const amount = text.replace(/[^0-9.]/g, '');
                      setNewBudget(prev => ({
                        ...prev,
                        categoryLimits: {
                          ...prev.categoryLimits,
                          [category.id]: parseFloat(amount) || 0,
                        },
                      }));
                    }}
                    keyboardType="decimal-pad"
                    style={styles.input}
                    left={<TextInput.Icon icon={category.icon || 'cash'} />}
                  />
                ))}
            </ScrollView>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setShowAddDialog(false);
              resetNewBudget();
            }}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleSetBudget}
              loading={loading}
              disabled={loading}
            >
              {budget ? 'Update Budget' : 'Set Budget'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    elevation: 2,
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  budgetInfo: {
    marginBottom: theme.spacing.md,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  budgetAmount: {
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    color: theme.colors.onSurfaceVariant,
  },
  content: {
    flex: 1,
  },
  card: {
    margin: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.roundness,
    elevation: 1,
  },
  cardTitle: {
    marginBottom: theme.spacing.sm,
  },
  categoryList: {
    marginTop: theme.spacing.sm,
  },
  categoryCard: {
    width: 200,
    marginRight: theme.spacing.sm,
    borderRadius: theme.roundness,
    elevation: 1,
  },
  categoryLimit: {
    padding: theme.spacing.sm,
  },
  categoryProgress: {
    marginBottom: theme.spacing.xs,
  },
  categoryLimitText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: theme.spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  input: {
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  sectionTitle: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  categoryLimits: {
    maxHeight: 200,
  },
  error: {
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});

export default BudgetScreen; 