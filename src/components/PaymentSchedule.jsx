import { useState } from 'react';
import { Calendar, DollarSign, Edit2, Check, X } from 'lucide-react';
import { calculatePaymentStatus, getStatusColor, getStatusLabel } from '../utils/paymentScheduler';
import { useSettings } from '../context/SettingsContext';

export default function PaymentSchedule({ scheduledPayments, onUpdateDate, onApplyPayment }) {
  const [editingId, setEditingId] = useState(null);
  const [newDate, setNewDate] = useState('');
  const { formatDate, formatCurrency, toInputDate } = useSettings();

  const handleSaveDate = (payment) => {
    if (newDate) {
      onUpdateDate(payment.id, newDate);
      setEditingId(null);
      setNewDate('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewDate('');
  };

  const handlePaymentClick = (payment) => {
    if (onApplyPayment) {
      onApplyPayment(payment);
    }
  };

  const sortedPayments = [...scheduledPayments].sort((a, b) => {
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const monthlyPayments = sortedPayments.filter(p => p.type === 'monthly');
  const downpaymentPayments = sortedPayments.filter(p => p.type === 'downpayment');
  const platesPayments = sortedPayments.filter(p => p.type === 'plates');

  const PaymentCard = ({ payment }) => {
    const status = calculatePaymentStatus(payment);
    const isEditing = editingId === payment.id;

    const calculateProgress = () => {
      if (!payment.amount || payment.amount === 0) return 0;
      if (payment.remainingAmount === 0) return 100;
      const percentage = (payment.paidAmount / payment.amount) * 100;
      return Math.min(100, Math.max(0, percentage));
    };

    const progressPercentage = calculateProgress();

    return (
      <div className={`border-2 rounded-lg p-4 ${getStatusColor(status)}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-lg">
                {payment.concept}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(status)}`}>
                {getStatusLabel(status)}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={newDate || toInputDate(payment.dueDate)}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveDate(payment)}
                      className="p-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{formatDate(payment.dueDate)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(payment.id);
                        setNewDate(toInputDate(payment.dueDate));
                      }}
                      className="p-1 hover:bg-white/50 rounded cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold">
              {formatCurrency(payment.amount)}
            </div>
            {payment.paidAmount > 0 && (
              <div className="text-xs mt-1">
                <div className="text-green-700 font-medium">
                  Pagado: {formatCurrency(payment.paidAmount)}
                </div>
                <div className="text-orange-700 font-medium">
                  Falta: {formatCurrency(payment.remainingAmount)}
                </div>
              </div>
            )}
          </div>
        </div>

        {payment.amount > 0 && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1 text-center">
              {progressPercentage.toFixed(0)}% completado
            </p>
          </div>
        )}

        {payment.remainingAmount > 0 && (
          <button
            type="button"
            onClick={() => handlePaymentClick(payment)}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition font-semibold shadow-md cursor-pointer"
          >
            <DollarSign className="w-5 h-5" />
            Aplicar Pago
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {downpaymentPayments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-yellow-600">💰</span>
            Enganche
          </h3>
          <div className="space-y-3">
            {downpaymentPayments.map(payment => (
              <PaymentCard key={payment.id} payment={payment} />
            ))}
          </div>
        </div>
      )}

      {platesPayments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-blue-600">🚗</span>
            Placas
          </h3>
          <div className="space-y-3">
            {platesPayments.map(payment => (
              <PaymentCard key={payment.id} payment={payment} />
            ))}
          </div>
        </div>
      )}

      {monthlyPayments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-green-600">📅</span>
            Pagos Mensuales ({monthlyPayments.filter(p => p.status === 'paid').length} / {monthlyPayments.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {monthlyPayments.map(payment => (
              <PaymentCard key={payment.id} payment={payment} />
            ))}
          </div>
        </div>
      )}

      {scheduledPayments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No hay pagos programados</p>
        </div>
      )}
    </div>
  );
}