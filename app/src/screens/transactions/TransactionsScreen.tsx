import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { TransactionType, Transaction } from '../../types/transaction';
import { addTransaction, getTransactions, deleteTransaction } from '../../services/transactionService';
import { TRANSACTION_CATEGORIES, getCategoriesByType } from '../../constants/categories';

export const TransactionsScreen = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleAddTransaction = async () => {
    if (!amount || !description || !category) return;
    
    setLoading(true);
    try {
      await addTransaction({
        amount: parseFloat(amount),
        description,
        type,
        category,
        date: new Date(),
      });
      setVisible(false);
      resetForm();
      loadTransactions(); // Refresh the list
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      loadTransactions(); // Refresh the list
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setType('expense');
    setCategory('');
  };

  const formatAmount = (amount: number, type: TransactionType) => {
    const formattedAmount = amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    return type === 'expense' ? `- ${formattedAmount}` : `+ ${formattedAmount}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.list}>
        <Title style={styles.title}>Recent Transactions</Title>
        {transactions.map((transaction) => (
          <List.Item
            key={transaction.id}
            title={transaction.description}
            description={transaction.category}
            right={() => (
              <View style={styles.amountContainer}>
                <Text
                  style={[
                    styles.amount,
                    { color: transaction.type === 'expense' ? theme.colors.error : theme.colors.primary },
                  ]}
                >
                  {formatAmount(transaction.amount, transaction.type)}
                </Text>
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
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title style={styles.modalTitle}>Add Transaction</Title>
          
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

          <View style={styles.categoryContainer}>
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
          </View>

          <Button
            mode="contained"
            onPress={handleAddTransaction}
            loading={loading}
            disabled={loading || !amount || !description || !category}
            style={styles.button}
          >
            Add Transaction
          </Button>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setVisible(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryButton: {
    margin: 4,
    flexGrow: 1,
  },
  button: {
    marginTop: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TransactionsScreen; 