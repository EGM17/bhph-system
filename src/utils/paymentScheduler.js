// 🔧 FIXED: Utilidades para generar y manejar pagos programados SIN bugs de UTC
// Este archivo corrige el problema de que las fechas se agendan un día antes

/**
 * 🔧 FIX: Convierte un string de fecha a formato YYYY-MM-DD local
 */
export const toLocaleDateString = (date) => {
  if (!date) return '';
  
  // Si ya es un string YYYY-MM-DD, devolverlo
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  
  const d = new Date(date);
  
  // Usar componentes LOCALES (no UTC)
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * 🔧 FIX: Agrega meses a una fecha MANTENIENDO el día correcto
 * Problema anterior: new Date('2025-11-10') creaba fecha UTC que se mostraba como 11-09
 * Solución: Parsear como fecha local
 */
export const addMonths = (dateString, months) => {
  // Parsear la fecha como LOCAL, no UTC
  let year, month, day;
  
  if (typeof dateString === 'string' && dateString.includes('-')) {
    [year, month, day] = dateString.split('-').map(Number);
  } else {
    const d = new Date(dateString);
    year = d.getFullYear();
    month = d.getMonth() + 1;
    day = d.getDate();
  }
  
  // Crear nueva fecha sumando los meses (mes 0-indexed)
  const newDate = new Date(year, month - 1 + months, day);
  
  // Convertir a string YYYY-MM-DD
  const newYear = newDate.getFullYear();
  const newMonth = String(newDate.getMonth() + 1).padStart(2, '0');
  const newDay = String(newDate.getDate()).padStart(2, '0');
  
  return `${newYear}-${newMonth}-${newDay}`;
};

/**
 * Genera todos los pagos programados para un cliente
 */
export const generateScheduledPayments = (client) => {
  const scheduledPayments = [];
  const startDate = client.paymentStartDate;
  
  // Verificar si usa schedule personalizado
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
    // Usar pagos estándar
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

/**
 * 🔧 FIXED: Calcula el estado de un pago programado comparando fechas correctamente
 */
export const calculatePaymentStatus = (scheduledPayment) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 🔧 FIX: Parsear dueDate como fecha LOCAL
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