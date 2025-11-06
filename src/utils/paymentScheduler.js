// Utilidades para generar y manejar pagos programados
import { toLocaleDateString, addMonths } from './dateHelpers';

export const generateScheduledPayments = (client) => {
  const scheduledPayments = [];
  const startDate = client.paymentStartDate;
  
  // 🆕 NUEVA LÓGICA: Detectar si usa schedule personalizado
  if (client.useCustomSchedule && client.customPaymentSchedule && Array.isArray(client.customPaymentSchedule)) {
    // Usar pagos personalizados
    client.customPaymentSchedule.forEach((customPay, index) => {
      const dueDate = addMonths(startDate, index);
      
      scheduledPayments.push({
        id: `monthly_${customPay.paymentNumber}`,
        paymentNumber: customPay.paymentNumber,
        type: 'monthly',
        concept: `Pago Mensual #${customPay.paymentNumber}`,
        amount: customPay.amount,
        dueDate: dueDate,
        status: 'pending',
        paidAmount: 0,
        remainingAmount: customPay.amount,
        payments: []
      });
    });
  } else {
    // Usar pagos estándar (lógica original)
    for (let i = 0; i < client.numberOfPayments; i++) {
      const dueDate = addMonths(startDate, i);
      
      scheduledPayments.push({
        id: `monthly_${i + 1}`,
        paymentNumber: i + 1,
        type: 'monthly',
        concept: `Pago Mensual #${i + 1}`,
        amount: client.monthlyPayment,
        dueDate: dueDate,
        status: 'pending',
        paidAmount: 0,
        remainingAmount: client.monthlyPayment,
        payments: []
      });
    }
  }
  
  // Enganche
  if (client.downPayment && client.downPayment > 0) {
    const totalAmount = client.downPayment;
    const paidAmount = client.downPaymentPaid || 0;
    const remainingAmount = totalAmount - paidAmount;
    
    if (totalAmount > 0) {
      scheduledPayments.push({
        id: 'downpayment_1',
        paymentNumber: 0,
        type: 'downpayment',
        concept: 'Enganche Pendiente',
        amount: totalAmount,
        dueDate: client.downPaymentDueDate || client.paymentStartDate,
        status: remainingAmount <= 0 ? 'paid' : (paidAmount > 0 ? 'partial' : 'pending'),
        paidAmount: paidAmount,
        remainingAmount: remainingAmount,
        payments: []
      });
    }
  }
  
  // Placas
  if (client.platesAmount && client.platesAmount > 0) {
    const totalAmount = client.platesAmount;
    const paidAmount = client.platesPaid || 0;
    const remainingAmount = totalAmount - paidAmount;
    
    if (totalAmount > 0) {
      scheduledPayments.push({
        id: 'plates_1',
        paymentNumber: 0,
        type: 'plates',
        concept: 'Placas Pendientes',
        amount: totalAmount,
        dueDate: client.platesDueDate || client.paymentStartDate,
        status: remainingAmount <= 0 ? 'paid' : (paidAmount > 0 ? 'partial' : 'pending'),
        paidAmount: paidAmount,
        remainingAmount: remainingAmount,
        payments: []
      });
    }
  }
  
  return scheduledPayments;
};

export const calculatePaymentStatus = (scheduledPayment) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [year, month, day] = scheduledPayment.dueDate.split('-').map(Number);
  const dueDate = new Date(year, month - 1, day);
  dueDate.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
  
  if (scheduledPayment.remainingAmount <= 0) {
    return 'paid';
  } else if (scheduledPayment.paidAmount > 0) {
    return 'partial';
  } else if (daysDiff < 0) {
    return 'overdue';
  } else if (daysDiff <= 7) {
    return 'due_soon';
  } else {
    return 'pending';
  }
};

export const getStatusColor = (status) => {
  const colors = {
    paid: 'bg-green-100 text-green-800 border-green-300',
    partial: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    overdue: 'bg-red-100 text-red-800 border-red-300',
    due_soon: 'bg-orange-100 text-orange-800 border-orange-300',
    pending: 'bg-gray-100 text-gray-800 border-gray-300'
  };
  return colors[status] || colors.pending;
};

export const getStatusLabel = (status) => {
  const labels = {
    paid: 'Pagado',
    partial: 'Pago Parcial',
    overdue: 'Atrasado',
    due_soon: 'Por Vencer',
    pending: 'Pendiente'
  };
  return labels[status] || 'Pendiente';
};

export const applyPaymentToScheduled = (scheduledPayments, paymentData) => {
  const updated = [...scheduledPayments];
  const targetPayment = updated.find(sp => sp.id === paymentData.appliedToScheduledPayment);
  
  if (targetPayment) {
    const currentPaid = targetPayment.paidAmount || 0;
    const newPaidAmount = currentPaid + paymentData.amount;
    
    targetPayment.paidAmount = newPaidAmount;
    targetPayment.remainingAmount = targetPayment.amount - newPaidAmount;
    
    if (!targetPayment.payments.includes(paymentData.id)) {
      targetPayment.payments.push(paymentData.id);
    }
    
    targetPayment.status = calculatePaymentStatus(targetPayment);
  }
  
  return updated;
};