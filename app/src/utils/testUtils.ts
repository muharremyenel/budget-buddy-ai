import { addTransaction, getTransactions, updateTransaction, deleteTransaction } from '../services/transactionService';
import { createBudgetAlert, getUnreadAlerts, markAlertAsRead, getAlertPreferences, updateAlertPreferences } from '../services/notificationService';
import { Transaction, TransactionType, RecurrenceFrequency } from '../types/transaction';
import { AlertType, AlertPreferences } from '../types/notification';
import { auth } from '../config/firebase';

// Performance tracking
interface PerformanceMetrics {
  startTime: number;
  endTime: number;
  operation: string;
  success: boolean;
}

const metrics: PerformanceMetrics[] = [];

const trackPerformance = async (operation: string, fn: () => Promise<any>) => {
  const startTime = performance.now();
  try {
    const result = await fn();
    const endTime = performance.now();
    metrics.push({
      startTime,
      endTime,
      operation,
      success: true
    });
    return result;
  } catch (error) {
    const endTime = performance.now();
    metrics.push({
      startTime,
      endTime,
      operation,
      success: false
    });
    throw error;
  }
};

const printPerformanceReport = () => {
  console.log('\n📊 Performance Report:');
  metrics.forEach(metric => {
    const duration = (metric.endTime - metric.startTime).toFixed(2);
    console.log(`${metric.success ? '✅' : '❌'} ${metric.operation}: ${duration}ms`);
  });

  const totalTime = metrics.reduce((acc, metric) => acc + (metric.endTime - metric.startTime), 0);
  const successRate = (metrics.filter(m => m.success).length / metrics.length * 100).toFixed(1);
  console.log(`\nTotal Time: ${totalTime.toFixed(2)}ms`);
  console.log(`Success Rate: ${successRate}%`);
};

const checkAuth = () => {
  if (!auth.currentUser) {
    throw new Error('❌ No authenticated user. Please log in first.');
  }
  console.log('👤 Authenticated as:', auth.currentUser.email);
};

// Add cleanup function
const cleanup = async () => {
  console.log('\n🧹 Cleaning up test data...');
  const user = auth.currentUser;
  if (!user) return;

  try {
    // Clean up transactions
    const transactions = await getTransactions();
    for (const transaction of transactions) {
      if (transaction.description.startsWith('Test')) {
        await deleteTransaction(transaction.id);
        console.log(`✅ Cleaned up test transaction: ${transaction.id}`);
      }
    }

    // Clean up alerts
    const alerts = await getUnreadAlerts();
    for (const alert of alerts) {
      if (alert.message.startsWith('Test')) {
        await markAlertAsRead(alert.id);
        console.log(`✅ Cleaned up test alert: ${alert.id}`);
      }
    }
  } catch (error) {
    console.error('⚠️ Cleanup error:', error);
  }
};

export const testTransactionFlow = async () => {
  try {
    console.log('🧪 Starting Transaction Flow Test');
    
    await trackPerformance('Authentication Check', async () => {
      checkAuth();
    });

    await trackPerformance('Initial Cleanup', cleanup);

    // 1. Create a basic transaction
    console.log('\n📝 Testing Basic Transaction Creation');
    let createdTransaction;
    const basicTransaction = {
      amount: 50.00,
      description: "Test Grocery Shopping",
      type: "expense" as TransactionType,
      category: "food",
      date: new Date()
    };

    createdTransaction = await trackPerformance('Create Basic Transaction', async () => {
      const result = await addTransaction(basicTransaction);
      console.log('✅ Basic transaction created:', result.id);
      return result;
    });

    // Verify basic transaction
    const verifyBasic = await trackPerformance('Verify Basic Transaction', async () => {
      const transactions = await getTransactions();
      const created = transactions.find(t => t.id === createdTransaction.id);
      if (!created) throw new Error('Created transaction not found');
      if (created.amount !== basicTransaction.amount) throw new Error('Amount mismatch');
      if (created.description !== basicTransaction.description) throw new Error('Description mismatch');
      console.log('✅ Basic transaction verified');
      return created;
    });

    // 2. Create recurring transactions
    console.log('\n🔄 Testing Recurring Transaction Creation');
    let recurringTransaction;
    const recurringData = {
      amount: 1000.00,
      description: "Test Monthly Rent",
      type: "expense" as TransactionType,
      category: "housing",
      date: new Date(),
      isRecurring: true,
      recurrence: {
        frequency: "monthly" as RecurrenceFrequency,
        interval: 1,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3))
      }
    };

    recurringTransaction = await trackPerformance('Create Recurring Transaction', async () => {
      const result = await addTransaction(recurringData);
      console.log('✅ Recurring transaction created:', result.id);
      return result;
    });

    // Verify recurring transaction
    await trackPerformance('Verify Recurring Transaction', async () => {
      const transactions = await getTransactions({ isRecurring: true });
      const recurring = transactions.find(t => t.id === recurringTransaction.id);
      if (!recurring) throw new Error('Recurring transaction not found');
      if (!recurring.recurrence) throw new Error('Recurrence data missing');
      if (recurring.recurrence.frequency !== recurringData.recurrence.frequency) {
        throw new Error('Frequency mismatch');
      }
      console.log('✅ Recurring transaction verified');
      return recurring;
    });

    // 3. Test transaction updates
    console.log('\n✏️ Testing Transaction Updates');
    await trackPerformance('Update Transaction', async () => {
      const updateData = {
        amount: 55.00,
        description: "Updated Test Grocery"
      };
      await updateTransaction(createdTransaction.id, updateData);
      
      // Verify update
      const updated = (await getTransactions()).find(t => t.id === createdTransaction.id);
      if (!updated) throw new Error('Updated transaction not found');
      if (updated.amount !== updateData.amount) throw new Error('Update amount mismatch');
      if (updated.description !== updateData.description) throw new Error('Update description mismatch');
      console.log('✅ Transaction update verified');
    });

    // 4. Test complex filters
    console.log('\n🔍 Testing Advanced Filters');
    await trackPerformance('Complex Filter Operations', async () => {
      // Date range filter
      const dateFiltered = await getTransactions({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        endDate: new Date()
      });
      console.log(`✅ Date filtered transactions: ${dateFiltered.length}`);

      // Category filter
      const categoryFiltered = await getTransactions({
        category: "food"
      });
      console.log(`✅ Category filtered transactions: ${categoryFiltered.length}`);

      // Combined filters
      const complexFiltered = await getTransactions({
        type: "expense",
        minAmount: 50,
        maxAmount: 1000
      });
      console.log(`✅ Complex filtered transactions: ${complexFiltered.length}`);
    });

    // 5. Test batch operations
    console.log('\n📦 Testing Batch Operations');
    await trackPerformance('Batch Transaction Creation', async () => {
      const batchTransactions = [
        { amount: 20, description: "Test Coffee", type: "expense" as TransactionType, category: "food", date: new Date() },
        { amount: 30, description: "Test Snacks", type: "expense" as TransactionType, category: "food", date: new Date() }
      ];

      for (const tx of batchTransactions) {
        await addTransaction(tx);
      }
      console.log('✅ Batch transactions created');
    });

    // 6. Cleanup
    console.log('\n🧹 Final Cleanup');
    await trackPerformance('Cleanup Operations', async () => {
      const allTransactions = await getTransactions();
      const testTransactions = allTransactions.filter(t => t.description.startsWith('Test'));
      for (const tx of testTransactions) {
        await deleteTransaction(tx.id);
      }
      console.log(`✅ Cleaned up ${testTransactions.length} test transactions`);
    });

    console.log('\n✨ Transaction Flow Test Completed Successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Test Failed:', error.message);
    return false;
  }
};

export const testAlertFlow = async () => {
  try {
    console.log('🧪 Starting Alert Flow Test');

    await trackPerformance('Authentication Check', async () => {
      checkAuth();
    });

    await trackPerformance('Initial Cleanup', cleanup);

    // 1. Test alert preferences
    console.log('\n⚙️ Testing Alert Preferences');
    await trackPerformance('Alert Preferences Operations', async () => {
      const defaultPrefs = await getAlertPreferences();
      console.log('✅ Default preferences retrieved');

      const newPrefs: Partial<AlertPreferences> = {
        overBudgetThreshold: 85,
        unusualSpendingThreshold: 40,
        enableEmailNotifications: true,
        enablePushNotifications: false,
        mutedCategories: ['entertainment'],
        mutedTypes: ['approaching_limit', 'unusual_spending'] as AlertType[]
      };

      await updateAlertPreferences(newPrefs);
      console.log('✅ Preferences updated');

      const updatedPrefs = await getAlertPreferences();
      if (updatedPrefs.overBudgetThreshold !== newPrefs.overBudgetThreshold) {
        throw new Error('Preferences update verification failed');
      }
      console.log('✅ Preferences update verified');
    });

    // 2. Test different alert types
    console.log('\n🚨 Testing Multiple Alert Types');
    const alertTypes = [
      {
        type: 'approaching_limit' as const,
        message: 'Test Alert: Approaching food budget limit',
        details: {
          category: 'food',
          amount: 450,
          threshold: 500,
          priority: 'medium' as const,
          actionRequired: true,
          actionType: 'review' as const
        }
      },
      {
        type: 'unusual_spending' as const,
        message: 'Test Alert: Unusual spending detected',
        details: {
          category: 'shopping',
          amount: 1000,
          threshold: 500,
          priority: 'high' as const,
          actionRequired: true,
          actionType: 'review' as const
        }
      }
    ];

    for (const alertConfig of alertTypes) {
      await trackPerformance(`Create ${alertConfig.type} Alert`, async () => {
        const alert = await createBudgetAlert(
          alertConfig.type,
          alertConfig.message,
          alertConfig.details
        );
        console.log(`✅ ${alertConfig.type} alert created:`, alert.id);
      });
    }

    // 3. Test alert retrieval and management
    console.log('\n📬 Testing Alert Management');
    await trackPerformance('Alert Management Operations', async () => {
      const unreadAlerts = await getUnreadAlerts();
      console.log(`✅ Retrieved ${unreadAlerts.length} unread alerts`);

      // Verify alert properties
      for (const alert of unreadAlerts) {
        if (!alert.type || !alert.priority || !alert.message) {
          throw new Error('Alert missing required properties');
        }
      }

      // Mark alerts as read
      for (const alert of unreadAlerts) {
        await markAlertAsRead(alert.id);
        console.log(`✅ Alert ${alert.id} marked as read`);
      }

      // Verify all alerts are read
      const remainingUnread = await getUnreadAlerts();
      if (remainingUnread.length > 0) {
        throw new Error('Some alerts remained unread');
      }
      console.log('✅ All alerts marked as read');
    });

    console.log('\n✨ Alert Flow Test Completed Successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Test Failed:', error.message);
    return false;
  }
};

export const runAllTests = async () => {
  console.log('🚀 Starting All Tests\n');
  metrics.length = 0; // Reset metrics
  
  try {
    await trackPerformance('Full Test Suite', async () => {
      checkAuth();
      await cleanup();
      
      const transactionTestResult = await testTransactionFlow();
      console.log('\n-------------------\n');
      const alertTestResult = await testAlertFlow();
      await cleanup();

      console.log('\n📋 Test Summary:');
      console.log(`Transaction Flow: ${transactionTestResult ? '✅ Passed' : '❌ Failed'}`);
      console.log(`Alert Flow: ${alertTestResult ? '✅ Passed' : '❌ Failed'}`);
      
      printPerformanceReport();
    });
  } catch (error: any) {
    console.error('\n❌ Tests failed to start:', error.message);
  }
}; 