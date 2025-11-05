import { useState } from 'react';
import { X } from 'lucide-react';

export default function ClientForm({ client, onSave, onCancel }) {
  const [formData, setFormData] = useState(client || {
    vinNumber: '',
    customerName: '',
    phone: '',
    address: '',
    vehicleYear: new Date().getFullYear(),
    vehicleMake: '',
    vehicleModel: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    downPayment: 0,
    downPaymentPaid: 0,
    downPaymentPending: 0,
    downPaymentDueDate: '',
    platesAmount: 0,
    platesPaid: 0,
    platesPending: 0,
    platesDueDate: '',
    totalBalance: 0,
    monthlyPayment: 0,
    numberOfPayments: 24,
    paymentStartDate: new Date().toISOString().split('T')[0],
    status: 'active',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Calcular enganches y placas pendientes
    const downPaymentPending = formData.downPayment - (formData.downPaymentPaid || 0);
    const platesPending = formData.platesAmount - (formData.platesPaid || 0);
    
    onSave({
      ...formData,
      downPaymentPending,
      platesPending,
      remainingBalance: client ? formData.remainingBalance : formData.totalBalance,
      lastPaymentDate: formData.paymentStartDate
    });
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full my-8">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-xl font-bold text-gray-800">
            {client ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h3>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del Cliente */}
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Información del Cliente</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Información del Vehículo */}
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Información del Vehículo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VIN Number *
                </label>
                <input
                  type="text"
                  name="vinNumber"
                  value={formData.vinNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año del Vehículo *
                </label>
                <input
                  type="number"
                  name="vehicleYear"
                  value={formData.vehicleYear}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca *
                </label>
                <input
                  type="text"
                  name="vehicleMake"
                  value={formData.vehicleMake}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo *
                </label>
                <input
                  type="text"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Información Financiera */}
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Información Financiera</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Compra *
                </label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Balance Total del Vehículo *
                </label>
                <input
                  type="number"
                  name="totalBalance"
                  value={formData.totalBalance}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pago Mensual *
                </label>
                <input
                  type="number"
                  name="monthlyPayment"
                  value={formData.monthlyPayment}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Pagos *
                </label>
                <input
                  type="number"
                  name="numberOfPayments"
                  value={formData.numberOfPayments}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inicio de Pagos *
                </label>
                <input
                  type="date"
                  name="paymentStartDate"
                  value={formData.paymentStartDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Enganche */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Enganche (Down Payment)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total de Enganche *
                </label>
                <input
                  type="number"
                  name="downPayment"
                  value={formData.downPayment}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enganche Pagado
                </label>
                <input
                  type="number"
                  name="downPaymentPaid"
                  value={formData.downPaymentPaid}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Límite de Enganche
                </label>
                <input
                  type="date"
                  name="downPaymentDueDate"
                  value={formData.downPaymentDueDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Placas */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Placas</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo de Placas
                </label>
                <input
                  type="number"
                  name="platesAmount"
                  value={formData.platesAmount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placas Pagadas
                </label>
                <input
                  type="number"
                  name="platesPaid"
                  value={formData.platesPaid}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Límite de Placas
                </label>
                <input
                  type="date"
                  name="platesDueDate"
                  value={formData.platesDueDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas del Cliente
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Notas, comentarios o información adicional del cliente..."
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {client ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
