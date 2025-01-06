import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Text, 
  FAB, 
  Portal, 
  Modal, 
  TextInput, 
  Button, 
  Title,
  List,
  useTheme,
  SegmentedButtons,
  IconButton,
  Searchbar,
  Menu,
  Divider,
  Chip,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { 
  TransactionType, 
  Transaction, 
  TransactionSortOption, 
  TransactionSortOrder,
  TransactionFilters 
} from '../../types/transaction';
import { addTransaction, getTransactions, deleteTransaction, updateTransaction } from '../../services/transactionService';
import { TRANSACTION_CATEGORIES, getCategoriesByType } from '../../constants/categories';
import DateTimePicker from '@react-native-community/datetimepicker';

export const TransactionsScreen = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [sortBy, setSortBy] = useState<TransactionSortOption>('date');
  const [sortOrder, setSortOrder] = useState<TransactionSortOrder>('desc');
  const [menuVisible, setMenuVisible] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [transactions, filters, searchQuery, sortBy, sortOrder]);

  const loadTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...transactions];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getCategoryName(t.category).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.startDate) {
      filtered = filtered.filter(t => new Date(t.date) >= filters.startDate!);
    }
    if (filters.endDate) {
      filtered = filtered.filter(t => new Date(t.date) <= filters.endDate!);
    }
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }
    if (filters.minAmount) {
      filtered = filtered.filter(t => t.amount >= filters.minAmount!);
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(t => t.amount <= filters.maxAmount!);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
          break;
        case 'amount':
          comparison = b.amount - a.amount;
          break;
        case 'category':
          comparison = getCategoryName(a.category).localeCompare(getCategoryName(b.category));
          break;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });

    setFilteredTransactions(filtered);
  };

  const handleAddOrUpdateTransaction = async () => {
    if (!amount || !description || !category) return;
    
    setLoading(true);
    try {
      if (editMode && currentTransaction) {
        await updateTransaction(currentTransaction.id, {
          amount: parseFloat(amount),
          description,
          type,
          category,
          date: new Date(),
        });
      } else {
        await addTransaction({
          amount: parseFloat(amount),
          description,
          type,
          category,
          date: new Date(),
        });
      }
      setVisible(false);
      resetForm();
      loadTransactions();
    } catch (error) {
      console.error('Error with transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setAmount(transaction.amount.toString());
    setDescription(transaction.description);
    setType(transaction.type);
    setCategory(transaction.category);
    setEditMode(true);
    setVisible(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      loadTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setType('expense');
    setCategory('');
    setEditMode(false);
    setCurrentTransaction(null);
  };

  const resetFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const getCategoryName = (categoryId: string) => {
    const category = TRANSACTION_CATEGORIES.find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search transactions"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <IconButton
          icon="filter-variant"
          onPress={() => setShowFilters(!showFilters)}
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="sort"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item 
            onPress={() => { setSortBy('date'); setMenuVisible(false); }} 
            title="Sort by Date"
            leadingIcon={sortBy === 'date' ? 'check' : undefined}
          />
          <Menu.Item 
            onPress={() => { setSortBy('amount'); setMenuVisible(false); }} 
            title="Sort by Amount"
            leadingIcon={sortBy === 'amount' ? 'check' : undefined}
          />
          <Menu.Item 
            onPress={() => { setSortBy('category'); setMenuVisible(false); }} 
            title="Sort by Category"
            leadingIcon={sortBy === 'category' ? 'check' : undefined}
          />
          <Divider />
          <Menu.Item 
            onPress={() => { setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); setMenuVisible(false); }} 
            title={`Order: ${sortOrder.toUpperCase()}`}
          />
        </Menu>
      </View>

      {showFilters && (
        <View style={styles.filters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Button
              mode="outlined"
              onPress={() => setShowStartDatePicker(true)}
              style={styles.dateInput}
            >
              {filters.startDate ? filters.startDate.toLocaleDateString() : 'Start Date'}
            </Button>
            {showStartDatePicker && (
              <DateTimePicker
                value={filters.startDate || new Date()}
                onChange={(event, date) => {
                  setShowStartDatePicker(false);
                  if (date) setFilters(prev => ({ ...prev, startDate: date }));
                }}
              />
            )}
            <Button
              mode="outlined"
              onPress={() => setShowEndDatePicker(true)}
              style={styles.dateInput}
            >
              {filters.endDate ? filters.endDate.toLocaleDateString() : 'End Date'}
            </Button>
            {showEndDatePicker && (
              <DateTimePicker
                value={filters.endDate || new Date()}
                onChange={(event, date) => {
                  setShowEndDatePicker(false);
                  if (date) setFilters(prev => ({ ...prev, endDate: date }));
                }}
              />
            )}
            <TextInput
              label="Min Amount"
              value={filters.minAmount?.toString()}
              onChangeText={(value) => setFilters(prev => ({ ...prev, minAmount: parseFloat(value) || undefined }))}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Max Amount"
              value={filters.maxAmount?.toString()}
              onChangeText={(value) => setFilters(prev => ({ ...prev, maxAmount: parseFloat(value) || undefined }))}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />
          </ScrollView>
          <View style={styles.filterChips}>
            <Chip
              selected={filters.type === 'expense'}
              onPress={() => setFilters(prev => ({ ...prev, type: prev.type === 'expense' ? undefined : 'expense' }))}
              style={styles.chip}
            >
              Expenses
            </Chip>
            <Chip
              selected={filters.type === 'income'}
              onPress={() => setFilters(prev => ({ ...prev, type: prev.type === 'income' ? undefined : 'income' }))}
              style={styles.chip}
            >
              Income
            </Chip>
            <Button onPress={resetFilters}>Reset Filters</Button>
          </View>
        </View>
      )}

      <ScrollView style={styles.list}>
        {filteredTransactions.map((transaction) => (
          <List.Item
            key={transaction.id}
            title={transaction.description}
            description={`${getCategoryName(transaction.category)} • ${new Date(transaction.date).toLocaleDateString()}`}
            left={props => (
              <List.Icon 
                {...props} 
                icon={TRANSACTION_CATEGORIES.find(cat => cat.id === transaction.category)?.icon || 'cash'}
              />
            )}
            right={() => (
              <View style={styles.actionContainer}>
                <Text
                  style={[
                    styles.amount,
                    { color: transaction.type === 'expense' ? theme.colors.error : theme.colors.primary },
                  ]}
                >
                  {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
                </Text>
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={() => handleEditTransaction(transaction)}
                />
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => handleDeleteTransaction(transaction.id)}
                />
              </View>
            )}
          />
        ))}
      </ScrollView>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => {
            setVisible(false);
            resetForm();
          }}
          contentContainerStyle={styles.modal}
        >
          <Title style={styles.modalTitle}>
            {editMode ? 'Edit Transaction' : 'Add Transaction'}
          </Title>
          
          <SegmentedButtons
            value={type}
            onValueChange={value => {
              setType(value as TransactionType);
              setCategory('');
            }}
            buttons={[
              { value: 'expense', label: 'Expense' },
              { value: 'income', label: 'Income' },
            ]}
            style={styles.segmentedButtons}
          />

          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            style={styles.input}
          />

          <ScrollView horizontal style={styles.categoryContainer}>
            {getCategoriesByType(type).map((cat) => (
              <Button
                key={cat.id}
                mode={category === cat.id ? 'contained' : 'outlined'}
                onPress={() => setCategory(cat.id)}
                style={styles.categoryButton}
                icon={cat.icon}
              >
                {cat.name}
              </Button>
            ))}
          </ScrollView>

          <Button
            mode="contained"
            onPress={handleAddOrUpdateTransaction}
            loading={loading}
            disabled={loading || !amount || !description || !category}
            style={styles.button}
          >
            {editMode ? 'Update Transaction' : 'Add Transaction'}
          </Button>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          resetForm();
          setVisible(true);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  searchBar: {
    flex: 1,
  },
  filters: {
    padding: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  dateInput: {
    width: 150,
    marginRight: 8,
  },
  list: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryButton: {
    marginRight: 8,
  },
  button: {
    marginTop: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default TransactionsScreen; 