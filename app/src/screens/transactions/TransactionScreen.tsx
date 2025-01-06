import React, { useState } from 'react';
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
  useTheme
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { TransactionType } from '../../types/transaction';

export const TransactionsScreen = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddTransaction = async () => {
    if (!amount || !description || !category) return;
    
    setLoading(true);
    try {
      // We'll implement this next
      // await addTransaction({
      //   amount: parseFloat(amount),
      //   description,
      //   type,
      //   category,
      //   date: new Date(),
      // });
      setVisible(false);
      resetForm();
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setType('expense');
    setCategory('');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.list}>
        <Title style={styles.title}>Recent Transactions</Title>
        {/* We'll add the transaction list here */}
      </ScrollView>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title style={styles.modalTitle}>Add Transaction</Title>
          
          <View style={styles.typeButtons}>
            <Button
              mode={type === 'expense' ? 'contained' : 'outlined'}
              onPress={() => setType('expense')}
              style={styles.typeButton}
            >
              Expense
            </Button>
            <Button
              mode={type === 'income' ? 'contained' : 'outlined'}
              onPress={() => setType('income')}
              style={styles.typeButton}
            >
              Income
            </Button>
          </View>

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

          <TextInput
            label="Category"
            value={category}
            onChangeText={setCategory}
            mode="outlined"
            style={styles.input}
          />

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
  typeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  button: {
    marginTop: 8,
  },
});

export default TransactionsScreen;