import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Text, 
  Card, 
  Title, 
  TextInput, 
  Button, 
  ProgressBar, 
  List,
  useTheme,
} from 'react-native-paper';
import { Budget, getCurrentBudget, setBudget } from '../../services/budgetService';
import { TRANSACTION_CATEGORIES } from '../../constants/categories';
import { getTransactions } from '../../services/transactionService';

export const BudgetScreen = () => {
  const theme = useTheme();
  const [budget, setBudgetState] = useState<Budget | null>(null);
  const [totalBudget, setTotalBudget] = useState('');
  const [categoryBudgets, setCategoryBudgets] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<{[key: string]: number}>({});

  useEffect(() => {
    loadBudget();
    loadExpenses();
  }, []);

  const loadBudget = async () => {
    try {
      const currentBudget = await getCurrentBudget();
      if (currentBudget) {
        setBudgetState(currentBudget);
        setTotalBudget(currentBudget.totalBudget.toString());
        const budgets: {[key: string]: string} = {};
        Object.entries(currentBudget.categories).forEach(([category, amount]) => {
          budgets[category] = amount.toString();
        });
        setCategoryBudgets(budgets);
      }
    } catch (error) {
      console.error('Error loading budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = async () => {
    try {
      const transactions = await getTransactions();
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      const monthlyExpenses = transactions
        .filter(t => 
          t.type === 'expense' && 
          t.date.toISOString().slice(0, 7) === currentMonth
        )
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as {[key: string]: number});
      
      setExpenses(monthlyExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const handleSaveBudget = async () => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const categories: {[key: string]: number} = {};
      
      Object.entries(categoryBudgets).forEach(([category, amount]) => {
        if (amount) {
          categories[category] = parseFloat(amount);
        }
      });

      await setBudget({
        totalBudget: parseFloat(totalBudget),
        categories,
        month: currentMonth,
      });

      loadBudget();
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Monthly Budget</Title>
            <TextInput
              label="Total Budget"
              value={totalBudget}
              onChangeText={setTotalBudget}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.input}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Category Budgets</Title>
            {TRANSACTION_CATEGORIES
              .filter(cat => cat.type === 'expense')
              .map(category => (
                <View key={category.id} style={styles.categoryContainer}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <TextInput
                    label="Budget"
                    value={categoryBudgets[category.id] || ''}
                    onChangeText={(value) => 
                      setCategoryBudgets(prev => ({...prev, [category.id]: value}))
                    }
                    keyboardType="decimal-pad"
                    mode="outlined"
                    style={styles.categoryInput}
                  />
                  <ProgressBar
                    progress={
                      expenses[category.id] 
                        ? expenses[category.id] / (parseFloat(categoryBudgets[category.id]) || 1)
                        : 0
                    }
                    color={
                      expenses[category.id] > (parseFloat(categoryBudgets[category.id]) || 0)
                        ? theme.colors.error
                        : theme.colors.primary
                    }
                    style={styles.progressBar}
                  />
                  <Text style={styles.expenseText}>
                    Spent: ${expenses[category.id]?.toFixed(2) || '0.00'}
                  </Text>
                </View>
              ))}
            <Button
              mode="contained"
              onPress={handleSaveBudget}
              style={styles.saveButton}
            >
              Save Budget
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
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
  input: {
    marginTop: 8,
  },
  categoryContainer: {
    marginVertical: 8,
  },
  categoryName: {
    fontSize: 16,
    marginBottom: 4,
  },
  categoryInput: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  expenseText: {
    marginTop: 4,
    fontSize: 12,
  },
  saveButton: {
    marginTop: 16,
  },
});

export default BudgetScreen; 