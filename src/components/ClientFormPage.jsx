import { useState } from 'react';
import { ArrowLeft, ToggleLeft, ToggleRight, FileText } from 'lucide-react';
import { getTodayString } from '../utils/dateHelpers';
import CustomPaymentScheduleEditor from './CustomPaymentScheduleEditor';
import CreditApplicationEditor from './CreditApplicationEditor';

export default function ClientFormPage({ client, onSave, onCancel }) {
  const [formData, setFormData] = useState(client || {
    vinNumber: '',
    customerName: '',
    phone: '',
    address: '',
    vehicleYear: new Date().getFullYear(),
    vehicleMake: '',
    vehicleModel: '',
    purchaseDate: getTodayString(),
    downPayment: 0,
    downPaymentPaid: 0,
    downPaymentDueDate: '',
    platesAmount: 0,
    platesPaid: 0,
    platesDueDate: '',
    totalBalance: 0,
    monthlyPayment: 0,
    numberOfPayments: 24,
    paymentStartDate: getTodayString(),
    status: 'active',
    notes: '',
    // Campos de pagos personalizados
    useCustomSchedule: client?.useCustomSchedule || false,
    customPaymentSchedule: client?.customPaymentSchedule || null,
    // 🆕 Campos de aplicación de crédito
    hasCreditApplication: client?.hasCreditApplication || false,
    creditApplication: client?.creditApplication || null
  });

  const [customScheduleValid, setCustomScheduleValid] = useState(true);
  const [customScheduleData, setCustomScheduleData] = useState(null);
  
  // 🆕 Estados para aplicación de crédito
  const [creditApplicationValid, setCreditApplicationValid] = useState(true);
  const [creditApplicationData, setCreditApplicationData] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar schedule personalizado
    if (formData.useCustomSchedule && !customScheduleValid) {
      alert('Por favor ajusta los montos del calendario personalizado para que sumen el balance total.');
      return;
    }
    
    // 🆕 Validar aplicación de crédito
    if (formData.hasCreditApplication && !creditApplicationValid) {
      alert('Por favor completa todos los campos requeridos de la aplicación de crédito.');
      return;
    }
    
    // Calcular pendientes
    const downPaymentPending = formData.downPayment - (formData.downPaymentPaid || 0);
    const platesPending = formData.platesAmount - (formData.platesPaid || 0);
    
    onSave({
      ...formData,
      downPaymentPending,
      platesPending,
      remainingBalance: client ? formData.remainingBalance : formData.totalBalance,
      lastPaymentDate: formData.paymentStartDate,
      // Guardar schedule personalizado si está activo
      customPaymentSchedule: formData.useCustomSchedule ? customScheduleData : null,
      // 🆕 Guardar aplicación de crédito si está activa
      creditApplication: formData.hasCreditApplication ? creditApplicationData : null
    });
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleToggleCustomSchedule = () => {
    setFormData(prev => ({
      ...prev,
      useCustomSchedule: !prev.useCustomSchedule
    }));
  };

  // 🆕 Toggle para aplicación de crédito
  const handleToggleCreditApplication = () => {
    setFormData(prev => ({
      ...prev,
      hasCreditApplication: !prev.hasCreditApplication
    }));
  };

  const handleCustomScheduleChange = (schedule, isValid) => {
    setCustomScheduleData(schedule);
    setCustomScheduleValid(isValid);
  };

  // 🆕 Manejar cambios en aplicación de crédito
  const handleCreditApplicationChange = (data, isValid) => {
    setCreditApplicationData(data);
    setCreditApplicationValid(isValid);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {client ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h1>
              <p className="text-sm text-gray-600">
                {client ? 'Actualiza la información del cliente' : 'Ingresa los datos del nuevo cliente'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Cliente */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b">
              Información del Cliente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="555-123-4567"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Main St, Ciudad, Estado"
                />
              </div>
            </div>
          </div>

          {/* Información del Vehículo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b">
              Información del Vehículo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VIN Number *
                </label>
                <input
                  type="text"
                  name="vinNumber"
                  value={formData.vinNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder="1HGBH41JXMN109186"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año *
                </label>
                <input
                  type="number"
                  name="vehicleYear"
                  value={formData.vehicleYear}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca *
                </label>
                <input
                  type="text"
                  name="vehicleMake"
                  value={formData.vehicleMake}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Honda"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modelo *
                </label>
                <input
                  type="text"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Civic"
                  required
                />
              </div>
            </div>
          </div>

          {/* Información Financiera */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b">
              Información Financiera
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Compra *
                </label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Balance Total *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="totalBalance"
                    value={formData.totalBalance}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {!formData.useCustomSchedule && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pago Mensual *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="monthlyPayment"
                        value={formData.monthlyPayment}
                        onChange={handleChange}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required={!formData.useCustomSchedule}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Pagos *
                    </label>
                    <input
                      type="number"
                      name="numberOfPayments"
                      value={formData.numberOfPayments}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={!formData.useCustomSchedule}
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio de Pagos *
                </label>
                <input
                  type="date"
                  name="paymentStartDate"
                  value={formData.paymentStartDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN DE PAGOS PERSONALIZADOS */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-purple-900 flex items-center gap-2">
                  📅 Calendario de Pagos
                </h2>
                <p className="text-sm text-purple-700 mt-1">
                  {formData.useCustomSchedule 
                    ? 'Define el monto de cada mensualidad individualmente' 
                    : 'Usa pagos mensuales iguales'}
                </p>
              </div>
              
              <button
                type="button"
                onClick={handleToggleCustomSchedule}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition shadow-md ${
                  formData.useCustomSchedule
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300'
                }`}
              >
                {formData.useCustomSchedule ? (
                  <>
                    <ToggleRight className="w-5 h-5" />
                    Pagos Personalizados
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5" />
                    Pagos Estándar
                  </>
                )}
              </button>
            </div>

            {formData.useCustomSchedule ? (
              <div className="bg-white rounded-lg p-4">
                <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> Puedes tener diferentes montos por mes. Por ejemplo: 11 meses de $400 y 1 mes de $200.
                    Usa el botón "Distribuir Equitativamente" para empezar y luego ajusta los montos.
                  </p>
                </div>
                
                <CustomPaymentScheduleEditor
                  numberOfPayments={formData.numberOfPayments}
                  monthlyPayment={formData.monthlyPayment}
                  totalBalance={formData.totalBalance}
                  initialCustomSchedule={formData.customPaymentSchedule}
                  onChange={handleCustomScheduleChange}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-2">
                  Actualmente usando pagos mensuales estándar
                </p>
                <div className="inline-flex items-center gap-4 text-lg font-semibold text-gray-800">
                  <span>{formData.numberOfPayments} pagos</span>
                  <span>×</span>
                  <span>${formData.monthlyPayment.toLocaleString()}</span>
                  <span>=</span>
                  <span className="text-green-600">${(formData.numberOfPayments * formData.monthlyPayment).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Activa "Pagos Personalizados" si necesitas montos diferentes por mes
                </p>
              </div>
            )}
          </div>

          {/* 🆕 SECCIÓN DE APLICACIÓN DE CRÉDITO */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow p-6 border-2 border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-orange-900 flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Aplicación de Crédito
                </h2>
                <p className="text-sm text-orange-700 mt-1">
                  {formData.hasCreditApplication 
                    ? 'Captura la información para generar el formulario de crédito' 
                    : 'Información opcional para documentación completa'}
                </p>
              </div>
              
              <button
                type="button"
                onClick={handleToggleCreditApplication}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition shadow-md ${
                  formData.hasCreditApplication
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300'
                }`}
              >
                {formData.hasCreditApplication ? (
                  <>
                    <ToggleRight className="w-5 h-5" />
                    Con Aplicación
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5" />
                    Sin Aplicación
                  </>
                )}
              </button>
            </div>

            {formData.hasCreditApplication ? (
              <div className="bg-white rounded-lg p-4">
                <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                  <p className="text-sm text-blue-800">
                    📋 <strong>Información:</strong> Completa los datos del cliente para poder generar 
                    el documento "Credit Application" desde la sección de contratos. Los campos marcados 
                    con * son obligatorios.
                  </p>
                </div>
                
                <CreditApplicationEditor
                  initialData={formData.creditApplication}
                  onChange={handleCreditApplicationChange}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">
                  Aplicación de crédito desactivada
                </p>
                <p className="text-sm text-gray-500">
                  Activa esta opción si necesitas generar el documento de aplicación de crédito
                </p>
              </div>
            )}
          </div>

          {/* Enganche */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow p-6 border-2 border-yellow-200">
            <h2 className="text-xl font-semibold text-yellow-900 mb-6 pb-3 border-b border-yellow-300">
              💰 Enganche (Down Payment)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-yellow-900 mb-2">
                  Total de Enganche
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="downPayment"
                    value={formData.downPayment}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-yellow-900 mb-2">
                  Enganche Pagado
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="downPaymentPaid"
                    value={formData.downPaymentPaid}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-yellow-900 mb-2">
                  Fecha Límite
                </label>
                <input
                  type="date"
                  name="downPaymentDueDate"
                  value={formData.downPaymentDueDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 bg-white"
                />
              </div>

              {formData.downPayment > 0 && (
                <div className="md:col-span-3 bg-yellow-200 border border-yellow-300 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-900">
                    Enganche Pendiente: ${((formData.downPayment || 0) - (formData.downPaymentPaid || 0)).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Placas */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6 border-2 border-blue-200">
            <h2 className="text-xl font-semibold text-blue-900 mb-6 pb-3 border-b border-blue-300">
              🚗 Placas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Costo de Placas
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="platesAmount"
                    value={formData.platesAmount}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Placas Pagadas
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="platesPaid"
                    value={formData.platesPaid}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Fecha Límite
                </label>
                <input
                  type="date"
                  name="platesDueDate"
                  value={formData.platesDueDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              {formData.platesAmount > 0 && (
                <div className="md:col-span-3 bg-blue-200 border border-blue-300 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900">
                    Placas Pendientes: ${((formData.platesAmount || 0) - (formData.platesPaid || 0)).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b">
              📝 Notas del Cliente
            </h2>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
              placeholder="Información adicional del cliente, referencias, notas especiales..."
            />
          </div>

          {/* Botones de Acción */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="px-8 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-lg"
              >
                {client ? '✓ Actualizar Cliente' : '✓ Guardar Cliente'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}