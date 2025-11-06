import { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, CheckCircle, Calculator } from 'lucide-react';

export default function CustomPaymentScheduleEditor({ 
  numberOfPayments, 
  monthlyPayment, 
  totalBalance,
  initialCustomSchedule = null,
  onChange 
}) {
  const [customPayments, setCustomPayments] = useState(() => {
    if (initialCustomSchedule && Array.isArray(initialCustomSchedule)) {
      return initialCustomSchedule;
    }
    // Generar schedule estándar inicial
    return Array.from({ length: numberOfPayments }, (_, i) => ({
      paymentNumber: i + 1,
      amount: monthlyPayment
    }));
  });

  const totalCustom = customPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const difference = totalBalance - totalCustom;
  const isValid = Math.abs(difference) < 0.01; // Tolerancia de 1 centavo

  useEffect(() => {
    onChange(customPayments, isValid);
  }, [customPayments, isValid]);

  const handleAmountChange = (index, value) => {
    const newPayments = [...customPayments];
    newPayments[index] = {
      ...newPayments[index],
      amount: parseFloat(value) || 0
    };
    setCustomPayments(newPayments);
  };

  const handleAddPayment = () => {
    setCustomPayments([
      ...customPayments,
      {
        paymentNumber: customPayments.length + 1,
        amount: 0
      }
    ]);
  };

  const handleRemovePayment = (index) => {
    const newPayments = customPayments.filter((_, i) => i !== index);
    // Renumerar
    const renumbered = newPayments.map((p, i) => ({
      ...p,
      paymentNumber: i + 1
    }));
    setCustomPayments(renumbered);
  };

  const handleDistributeEvenly = () => {
    const amountPerPayment = totalBalance / customPayments.length;
    const newPayments = customPayments.map((p, i) => ({
      ...p,
      amount: parseFloat(amountPerPayment.toFixed(2))
    }));
    
    // Ajustar el último pago para compensar redondeos
    const newTotal = newPayments.reduce((sum, p) => sum + p.amount, 0);
    const diff = totalBalance - newTotal;
    if (Math.abs(diff) > 0.01) {
      newPayments[newPayments.length - 1].amount += diff;
      newPayments[newPayments.length - 1].amount = parseFloat(newPayments[newPayments.length - 1].amount.toFixed(2));
    }
    
    setCustomPayments(newPayments);
  };

  const handleFillRemaining = () => {
    const remaining = totalBalance - totalCustom;
    if (remaining > 0 && customPayments.length > 0) {
      const newPayments = [...customPayments];
      newPayments[newPayments.length - 1].amount += remaining;
      newPayments[newPayments.length - 1].amount = parseFloat(newPayments[newPayments.length - 1].amount.toFixed(2));
      setCustomPayments(newPayments);
    }
  };

  return (
    <div className="space-y-4">
      {/* Resumen y Validación */}
      <div className={`p-4 rounded-lg border-2 ${
        isValid 
          ? 'bg-green-50 border-green-300' 
          : 'bg-yellow-50 border-yellow-300'
      }`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {isValid ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            )}
            <span className="font-semibold text-gray-800">
              {isValid ? '✓ Schedule válido' : '⚠ Ajusta los montos'}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Balance Total</p>
            <p className="text-xl font-bold text-gray-800">
              ${totalBalance.toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-600">Suma de pagos: </span>
            <span className="font-semibold text-gray-800">
              ${totalCustom.toLocaleString()}
            </span>
          </div>
          {!isValid && (
            <div>
              <span className="text-gray-600">Diferencia: </span>
              <span className={`font-semibold ${difference > 0 ? 'text-orange-600' : 'text-blue-600'}`}>
                {difference > 0 ? '+' : ''}{difference.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Botones de Ayuda */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={handleDistributeEvenly}
          className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
        >
          <Calculator className="w-4 h-4" />
          Distribuir Equitativamente
        </button>
        
        {!isValid && difference > 0 && (
          <button
            type="button"
            onClick={handleFillRemaining}
            className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition text-sm font-medium"
          >
            Agregar ${difference.toFixed(2)} al último pago
          </button>
        )}
        
        <button
          type="button"
          onClick={handleAddPayment}
          className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Agregar Pago
        </button>
      </div>

      {/* Lista de Pagos */}
      <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 flex items-center justify-between border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-700">
            Calendario de Pagos Personalizados ({customPayments.length})
          </span>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          <div className="divide-y divide-gray-200">
            {customPayments.map((payment, index) => (
              <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50">
                <div className="flex-shrink-0 w-16 text-center">
                  <span className="text-sm font-semibold text-gray-600">
                    Pago #{payment.paymentNumber}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={payment.amount}
                      onChange={(e) => handleAmountChange(index, e.target.value)}
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                {customPayments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePayment(index)}
                    className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Eliminar este pago"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advertencia de validación */}
      {!isValid && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Importante:</strong> La suma de todos los pagos debe ser igual al balance total (${totalBalance.toLocaleString()}) 
            para poder guardar el cliente.
          </p>
        </div>
      )}
    </div>
  );
}
