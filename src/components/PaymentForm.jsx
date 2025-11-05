import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { getTodayString } from '../utils/dateHelpers';

export default function PaymentForm({ client, scheduledPayment, existingPayment, onSave, onCancel }) {
  const isEditing = !!existingPayment;
  
  const defaultAmount = existingPayment 
    ? existingPayment.amount
    : scheduledPayment 
    ? scheduledPayment.remainingAmount 
    : client?.monthlyPayment || 0;
  
  const defaultType = existingPayment
    ? existingPayment.paymentType
    : scheduledPayment 
    ? scheduledPayment.type 
    : 'monthly';

  const [formData, setFormData] = useState({
    amount: defaultAmount,
    paymentDate: existingPayment ? existingPayment.paymentDate : getTodayString(),  // 🔧 FIX
    paymentMethod: existingPayment ? existingPayment.paymentMethod : 'cash',
    paymentType: defaultType,
    notes: existingPayment ? existingPayment.notes || '' : '',
    appliedToScheduledPayment: existingPayment ? existingPayment.appliedToScheduledPayment : (scheduledPayment?.id || null),
    isPartialPayment: false
  });

  const [showPartialWarning, setShowPartialWarning] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const isPartial = scheduledPayment && formData.amount < scheduledPayment.remainingAmount;
    
    onSave({
      ...formData,
      clientId: client.id,
      vinNumber: client.vinNumber,
      customerName: client.customerName,
      isPartialPayment: isPartial
    });
  };

  const handleAmountChange = (value) => {
    const amount = parseFloat(value) || 0;
    setFormData({ ...formData, amount });
    
    if (scheduledPayment && amount < scheduledPayment.remainingAmount && amount > 0) {
      setShowPartialWarning(true);
    } else {
      setShowPartialWarning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full my-8 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg flex-shrink-0">
          <h3 className="text-xl font-bold">
            {isEditing ? '✏️ Editar Pago' : '💵 Registrar Pago'}
          </h3>
          <button onClick={onCancel} className="p-2 hover:bg-green-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {isEditing && (
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
                <p className="text-sm font-medium text-orange-800">
                  ⚠️ Estás editando un pago existente
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  Los cambios afectarán los balances del cliente
                </p>
              </div>
            )}

            {/* Info del Cliente */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-1">Cliente</p>
              <p className="font-semibold text-gray-800">{client.customerName}</p>
              <p className="text-sm text-gray-600">
                {client.vehicleYear} {client.vehicleMake} {client.vehicleModel}
              </p>
            </div>

            {/* Info del Pago Programado */}
            {scheduledPayment && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-800 font-medium mb-2">Aplicando a:</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{scheduledPayment.concept}</p>
                    <p className="text-sm text-gray-600">
                      Vence: {new Date(scheduledPayment.dueDate).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Falta por pagar</p>
                    <p className="text-2xl font-bold text-purple-700">
                      ${scheduledPayment.remainingAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
                {scheduledPayment.paidAmount > 0 && (
                  <p className="text-xs text-green-700 mt-2">
                    ✓ Ya pagado: ${scheduledPayment.paidAmount.toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Tipo de Pago (solo si no hay pago programado) */}
            {!scheduledPayment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Pago *
                </label>
                <select
                  value={formData.paymentType}
                  onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="monthly">Pago Mensual</option>
                  <option value="downpayment">Enganche</option>
                  <option value="plates">Placas</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            )}

            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto a Pagar *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-semibold"
                  required
                  min="0.01"
                />
              </div>
              
              {scheduledPayment && !isEditing && (
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAmountChange(scheduledPayment.remainingAmount)}
                    className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium"
                  >
                    Pago Completo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAmountChange(scheduledPayment.remainingAmount / 2)}
                    className="flex-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition text-sm font-medium"
                  >
                    50%
                  </button>
                </div>
              )}
            </div>

            {/* Advertencia de Pago Parcial */}
            {showPartialWarning && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Pago Parcial</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Quedará un saldo de ${(scheduledPayment.remainingAmount - formData.amount).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Fecha de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Pago *
              </label>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* Método de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'cash', label: '💵 Efectivo' },
                  { value: 'check', label: '📝 Cheque' },
                  { value: 'card', label: '💳 Tarjeta' },
                  { value: 'transfer', label: '🏦 Transferencia' }
                ].map(method => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: method.value })}
                    className={`px-4 py-3 rounded-lg border-2 transition font-medium ${
                      formData.paymentMethod === method.value
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas de Cobranza
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="3"
                placeholder="Ej: Cliente prometió pagar el resto la próxima semana..."
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Útiles para seguimiento de cobranza
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end flex-shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-lg"
            >
              {isEditing ? '✓ Actualizar Pago' : '✓ Registrar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}