import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Surface, FAB, Portal, Dialog, TextInput, Button, List, IconButton, Menu, Searchbar, Chip } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { getTransactions, addTransaction, deleteTransaction, updateTransaction } from '../../services/transactionService';
import { Transaction } from '../../types/transaction';
import { TRANSACTION_CATEGORIES } from '../../constants/categories';
import { theme } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';

export const TransactionsScreen = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // New Transaction State
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    date: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.category || !newTransaction.description) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await addTransaction({
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
      });
      setShowAddDialog(false);
      loadTransactions();
      resetNewTransaction();
    } catch (error) {
      setError('Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const resetNewTransaction = () => {
    setNewTransaction({
      amount: '',
      type: 'expense',
      category: '',
      description: '',
      date: new Date(),
    });
    setError('');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || transaction.type === selectedType;
      const matchesCategory = !selectedCategory || transaction.category === selectedCategory;
      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return sortOrder === 'desc'
          ? b.amount - a.amount
          : a.amount - b.amount;
      }
    });

  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteTransaction(transaction.id);
              loadTransactions();
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Error', 'Failed to delete transaction');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleEditTransaction = async () => {
    if (!selectedTransaction || !newTransaction.amount || !newTransaction.category || !newTransaction.description) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await updateTransaction(selectedTransaction.id, {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
      });
      setShowEditDialog(false);
      loadTransactions();
      resetNewTransaction();
      setSelectedTransaction(null);
    } catch (error) {
      setError('Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setNewTransaction({
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      description: transaction.description,
      date: new Date(transaction.date),
    });
    setShowEditDialog(true);
  };

  const renderTransaction = (transaction: Transaction) => {
    const category = TRANSACTION_CATEGORIES.find(cat => cat.id === transaction.category);
    return (
      <Surface key={transaction.id} style={styles.transactionCard}>
        <List.Item
          title={transaction.description}
          description={new Date(transaction.date).toLocaleDateString()}
          left={props => (
            <List.Icon
              {...props}
              icon={category?.icon || 'cash'}
              color={transaction.type === 'expense' ? theme.colors.error : theme.colors.success}
            />
          )}
          right={() => (
            <View style={styles.amountContainer}>
              <Text
                style={[
                  styles.amount,
                  {
                    color: transaction.type === 'expense'
                      ? theme.colors.error
                      : theme.colors.success
                  }
                ]}
              >
                {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
              </Text>
              <Text style={styles.category}>{category?.name}</Text>
              <View style={styles.actionButtons}>
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={() => openEditDialog(transaction)}
                />
                <IconButton
                  icon="delete"
                  size={20}
                  iconColor={theme.colors.error}
                  onPress={() => handleDeleteTransaction(transaction)}
                />
              </View>
            </View>
          )}
        />
      </Surface>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <Surface style={styles.header}>
        <Searchbar
          placeholder="Search transactions"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
        >
          <Chip
            selected={selectedType === 'all'}
            onPress={() => setSelectedType('all')}
            style={styles.chip}
          >
            All
          </Chip>
          <Chip
            selected={selectedType === 'expense'}
            onPress={() => setSelectedType('expense')}
            style={styles.chip}
          >
            Expenses
          </Chip>
          <Chip
            selected={selectedType === 'income'}
            onPress={() => setSelectedType('income')}
            style={styles.chip}
          >
            Income
          </Chip>
          {selectedCategory && (
            <Chip
              onClose={() => setSelectedCategory(null)}
              style={styles.chip}
            >
              {TRANSACTION_CATEGORIES.find(cat => cat.id === selectedCategory)?.name}
            </Chip>
          )}
        </ScrollView>
      </Surface>

      {/* Sort Menu */}
      <Surface style={styles.sortContainer}>
        <Menu
          visible={showSortMenu}
          onDismiss={() => setShowSortMenu(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setShowSortMenu(true)}
              icon="sort"
              style={styles.sortButton}
            >
              Sort by: {sortBy === 'date' ? 'Date' : 'Amount'} ({sortOrder === 'desc' ? 'Desc' : 'Asc'})
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setSortBy('date');
              setSortOrder('desc');
              setShowSortMenu(false);
            }}
            title="Date (Newest)"
          />
          <Menu.Item
            onPress={() => {
              setSortBy('date');
              setSortOrder('asc');
              setShowSortMenu(false);
            }}
            title="Date (Oldest)"
          />
          <Menu.Item
            onPress={() => {
              setSortBy('amount');
              setSortOrder('desc');
              setShowSortMenu(false);
            }}
            title="Amount (Highest)"
          />
          <Menu.Item
            onPress={() => {
              setSortBy('amount');
              setSortOrder('asc');
              setShowSortMenu(false);
            }}
            title="Amount (Lowest)"
          />
        </Menu>
      </Surface>

      {/* Transactions List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map(renderTransaction)
        ) : (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={styles.emptyStateText}>
              No transactions found
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Transaction FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowAddDialog(true)}
      />

      {/* Add Transaction Dialog */}
      <Portal>
        <Dialog visible={showAddDialog} onDismiss={() => {
          setShowAddDialog(false);
          resetNewTransaction();
        }}>
          <Dialog.Title>Add Transaction</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Amount"
              value={newTransaction.amount}
              onChangeText={text => {
                const amount = text.replace(/[^0-9.]/g, '');
                setNewTransaction(prev => ({ ...prev, amount }));
                setError('');
              }}
              keyboardType="decimal-pad"
              style={styles.input}
            />

            <View style={styles.typeContainer}>
              <Button
                mode={newTransaction.type === 'expense' ? 'contained' : 'outlined'}
                onPress={() => setNewTransaction(prev => ({ ...prev, type: 'expense' }))}
                style={[styles.typeButton, styles.expenseButton]}
              >
                Expense
              </Button>
              <Button
                mode={newTransaction.type === 'income' ? 'contained' : 'outlined'}
                onPress={() => setNewTransaction(prev => ({ ...prev, type: 'income' }))}
                style={[styles.typeButton, styles.incomeButton]}
              >
                Income
              </Button>
            </View>

            <TextInput
              label="Description"
              value={newTransaction.description}
              onChangeText={text => {
                setNewTransaction(prev => ({ ...prev, description: text }));
                setError('');
              }}
              style={styles.input}
            />

            <Button
              mode="outlined"
              onPress={() => setShowDatePicker(true)}
              style={styles.input}
            >
              {newTransaction.date.toLocaleDateString()}
            </Button>

            {showDatePicker && (
              <DateTimePicker
                value={newTransaction.date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setNewTransaction(prev => ({ ...prev, date: selectedDate }));
                  }
                }}
              />
            )}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesContainer}
            >
              {TRANSACTION_CATEGORIES
                .filter(cat => !cat.type || cat.type === newTransaction.type)
                .map(category => (
                  <Chip
                    key={category.id}
                    selected={newTransaction.category === category.id}
                    onPress={() => {
                      setNewTransaction(prev => ({ ...prev, category: category.id }));
                      setError('');
                    }}
                    style={styles.categoryChip}
                    icon={category.icon}
                  >
                    {category.name}
                  </Chip>
                ))}
            </ScrollView>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setShowAddDialog(false);
              resetNewTransaction();
            }}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleAddTransaction}
              loading={loading}
              disabled={loading}
            >
              Add
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Edit Transaction Dialog */}
      <Portal>
        <Dialog visible={showEditDialog} onDismiss={() => {
          setShowEditDialog(false);
          resetNewTransaction();
          setSelectedTransaction(null);
        }}>
          <Dialog.Title>Edit Transaction</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Amount"
              value={newTransaction.amount}
              onChangeText={text => {
                const amount = text.replace(/[^0-9.]/g, '');
                setNewTransaction(prev => ({ ...prev, amount }));
                setError('');
              }}
              keyboardType="decimal-pad"
              style={styles.input}
            />

            <View style={styles.typeContainer}>
              <Button
                mode={newTransaction.type === 'expense' ? 'contained' : 'outlined'}
                onPress={() => setNewTransaction(prev => ({ ...prev, type: 'expense' }))}
                style={[styles.typeButton, styles.expenseButton]}
              >
                Expense
              </Button>
              <Button
                mode={newTransaction.type === 'income' ? 'contained' : 'outlined'}
                onPress={() => setNewTransaction(prev => ({ ...prev, type: 'income' }))}
                style={[styles.typeButton, styles.incomeButton]}
              >
                Income
              </Button>
            </View>

            <TextInput
              label="Description"
              value={newTransaction.description}
              onChangeText={text => {
                setNewTransaction(prev => ({ ...prev, description: text }));
                setError('');
              }}
              style={styles.input}
            />

            <Button
              mode="outlined"
              onPress={() => setShowDatePicker(true)}
              style={styles.input}
            >
              {newTransaction.date.toLocaleDateString()}
            </Button>

            {showDatePicker && (
              <DateTimePicker
                value={newTransaction.date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setNewTransaction(prev => ({ ...prev, date: selectedDate }));
                  }
                }}
              />
            )}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesContainer}
            >
              {TRANSACTION_CATEGORIES
                .filter(cat => !cat.type || cat.type === newTransaction.type)
                .map(category => (
                  <Chip
                    key={category.id}
                    selected={newTransaction.category === category.id}
                    onPress={() => {
                      setNewTransaction(prev => ({ ...prev, category: category.id }));
                      setError('');
                    }}
                    style={styles.categoryChip}
                    icon={category.icon}
                  >
                    {category.name}
                  </Chip>
                ))}
            </ScrollView>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setShowEditDialog(false);
              resetNewTransaction();
              setSelectedTransaction(null);
            }}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleEditTransaction}
              loading={loading}
              disabled={loading}
            >
              Update
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
    elevation: 2,
  },
  searchbar: {
    margin: theme.spacing.sm,
    elevation: 0,
  },
  filtersContainer: {
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  chip: {
    marginRight: theme.spacing.xs,
  },
  sortContainer: {
    padding: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  sortButton: {
    marginLeft: theme.spacing.sm,
  },
  content: {
    flex: 1,
  },
  transactionCard: {
    marginHorizontal: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    borderRadius: theme.roundness,
    elevation: 1,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  category: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
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
  typeContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  typeButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  expenseButton: {
    borderColor: theme.colors.error,
  },
  incomeButton: {
    borderColor: theme.colors.success,
  },
  categoriesContainer: {
    marginBottom: theme.spacing.sm,
  },
  categoryChip: {
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  error: {
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyStateText: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
});

export default TransactionsScreen; 