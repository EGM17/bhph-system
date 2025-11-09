import { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MapPin, Car, DollarSign, Calendar, FileText, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import PaymentSchedule from './PaymentSchedule';
import ContractGenerator from './contracts/ContractGenerator';
import { generateScheduledPayments } from '../utils/paymentScheduler';
import { useSettings } from '../context/SettingsContext';

export default function ClientDetailPage({ client, payments, onClose, onUpdateClient, onAddPayment, onEditPayment, onDeletePayment }) {
  const [activeTab, setActiveTab] = useState('schedule');
  const [scheduledPayments, setScheduledPayments] = useState([]);
  const [showContractGenerator, setShowContractGenerator] = useState(false);
  const { formatDate, formatCurrency } = useSettings();

  useEffect(() => {
    const needsRegeneration = () => {
      if (!client.scheduledPayments) return true;
      
      const enganche = client.scheduledPayments.find(sp => sp.type === 'downpayment');
      if (enganche) {
        if (enganche.amount < enganche.paidAmount) return true;
        if (client.downPayment && enganche.amount !== client.downPayment) return true;
      }
      
      const placas = client.scheduledPayments.find(sp => sp.type === 'plates');
      if (placas) {
        if (placas.amount < placas.paidAmount) return true;
        if (client.platesAmount && placas.amount !== client.platesAmount) return true;
      }
      
      return false;
    };

    if (needsRegeneration()) {
      const generated = generateScheduledPayments(client);
      setScheduledPayments(generated);
      onUpdateClient(client.id, { scheduledPayments: generated });
    } else if (client.scheduledPayments) {
      setScheduledPayments(client.scheduledPayments);
    } else {
      const generated = generateScheduledPayments(client);
      setScheduledPayments(generated);
      onUpdateClient(client.id, { scheduledPayments: generated });
    }
  }, [client]);

  const clientPayments = payments.filter(p => p.clientId === client.id);
  const totalPaid = clientPayments.reduce((sum, p) => sum + p.amount, 0);
  const monthlyPayments = scheduledPayments.filter(p => p.type === 'monthly');
  const paidMonthlyCount = monthlyPayments.filter(p => p.status === 'paid').length;

  const handleUpdateDate = async (paymentId, newDate) => {
    // 🔧 FIX: La fecha ya viene en formato YYYY-MM-DD correcto
    const updated = scheduledPayments.map(sp =>
      sp.id === paymentId ? { ...sp, dueDate: newDate } : sp
    );
    setScheduledPayments(updated);
    await onUpdateClient(client.id, { scheduledPayments: updated });
  };

  const handleApplyPayment = (scheduledPayment) => {
    onAddPayment(client, scheduledPayment);
  };

  const handleDeletePayment = (paymentId) => {
    if (confirm('¿Estás seguro de eliminar este pago? Esta acción no se puede deshacer.')) {
      onDeletePayment(paymentId);
    }
  };

  const tabs = [
    { id: 'schedule', label: 'Calendario de Pagos', icon: Calendar },
    { id: 'history', label: 'Historial', icon: DollarSign },
    { id: 'info', label: 'Información', icon: FileText }
  ];

  const downPaymentPending = (client.downPayment || 0) - (client.downPaymentPaid || 0);
  const platesPending = (client.platesAmount || 0) - (client.platesPaid || 0);
  
  // 🔧 FIX: Calcular pagos atrasados comparando fechas correctamente
  const overduePayments = scheduledPayments.filter(sp => {
    if (sp.status === 'paid' || sp.remainingAmount <= 0) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parsear dueDate como fecha local
    const [year, month, day] = sp.dueDate.split('-').map(Number);
    const dueDate = new Date(year, month - 1, day);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  });

  // 🔧 FIX: Encontrar próximo pago comparando fechas correctamente
  const nextPaymentDate = scheduledPayments
    .filter(sp => sp.status === 'pending' && sp.type === 'monthly')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]?.dueDate;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={onClose} className="p-2 hover:bg-blue-800 rounded-lg transition">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{client.customerName}</h1>
              <p className="text-blue-100 mt-1 flex items-center gap-2">
                <Car className="w-4 h-4" />
                {client.vehicleYear} {client.vehicleMake} {client.vehicleModel}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Botón de Generar Contratos */}
              <button
                onClick={() => setShowContractGenerator(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium shadow-lg"
              >
                <FileText className="w-5 h-5" />
                <span className="hidden sm:inline">Generar Contratos</span>
                <span className="sm:hidden">Contratos</span>
              </button>
              
              <span className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${
                client.status === 'active' ? 'bg-green-500' :
                client.status === 'paid' ? 'bg-blue-500' : 'bg-red-500'
              }`}>
                {client.status === 'active' ? '✓ Activo' : 
                 client.status === 'paid' ? '✓ Pagado' : '⚠ Moroso'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-800 rounded-lg">
              <Phone className="w-4 h-4" />
              <span>{client.phone}</span>
            </div>
            {client.address && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-800 rounded-lg">
                <MapPin className="w-4 h-4" />
                <span>{client.address}</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-800 rounded-lg font-mono text-xs">
              <span>VIN: {client.vinNumber}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Balance Restante</p>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(client.remainingBalance || 0)}</p>
            <p className="text-xs text-gray-500 mt-1">de {formatCurrency(client.totalBalance || 0)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Pagado</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
            <p className="text-xs text-gray-500 mt-1">{clientPayments.length} pagos realizados</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Progreso</p>
            <p className="text-3xl font-bold text-purple-600">{paidMonthlyCount} / {monthlyPayments.length}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${monthlyPayments.length > 0 ? (paidMonthlyCount / monthlyPayments.length) * 100 : 0}%` }} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Pago Mensual</p>
            <p className="text-3xl font-bold text-orange-600">{formatCurrency(client.monthlyPayment || 0)}</p>
            {/* 🔧 FIX: formatDate ya maneja las fechas correctamente */}
            <p className="text-xs text-gray-500 mt-1">Próximo: {nextPaymentDate ? formatDate(nextPaymentDate) : 'N/A'}</p>
          </div>
        </div>

        {(overduePayments.length > 0 || downPaymentPending > 0 || platesPending > 0) && (
          <div className="space-y-3 mb-6">
            {overduePayments.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                  <div>
                    <p className="font-semibold text-red-800">{overduePayments.length} pago{overduePayments.length > 1 ? 's' : ''} atrasado{overduePayments.length > 1 ? 's' : ''}</p>
                    <p className="text-sm text-red-700">Total atrasado: {formatCurrency(overduePayments.reduce((sum, p) => sum + p.remainingAmount, 0))}</p>
                  </div>
                </div>
              </div>
            )}

            {downPaymentPending > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                    <div>
                      <p className="font-semibold text-yellow-800">Enganche Pendiente</p>
                      <p className="text-sm text-yellow-700">
                        {formatCurrency(downPaymentPending)}
                        {/* 🔧 FIX: formatDate maneja las fechas correctamente */}
                        {client.downPaymentDueDate && ` - Vence: ${formatDate(client.downPaymentDueDate)}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-yellow-700">Pagado</p>
                    <p className="text-lg font-bold text-yellow-800">{formatCurrency(client.downPaymentPaid || 0)}</p>
                  </div>
                </div>
              </div>
            )}

            {platesPending > 0 && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-semibold text-blue-800">Placas Pendientes</p>
                      <p className="text-sm text-blue-700">
                        {formatCurrency(platesPending)}
                        {/* 🔧 FIX: formatDate maneja las fechas correctamente */}
                        {client.platesDueDate && ` - Vence: ${formatDate(client.platesDueDate)}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-blue-700">Pagado</p>
                    <p className="text-lg font-bold text-blue-800">{formatCurrency(client.platesPaid || 0)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`}>
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'schedule' && (
              <PaymentSchedule 
                scheduledPayments={scheduledPayments} 
                onUpdateDate={handleUpdateDate} 
                onApplyPayment={handleApplyPayment}
              />
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Historial de Pagos ({clientPayments.length})</h3>
                {clientPayments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay pagos registrados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clientPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)).map(payment => (
                      <div key={payment.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${payment.paymentType === 'monthly' ? 'bg-green-100 text-green-800' : payment.paymentType === 'downpayment' ? 'bg-yellow-100 text-yellow-800' : payment.paymentType === 'plates' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                {payment.paymentType === 'monthly' ? 'Pago Mensual' : payment.paymentType === 'downpayment' ? 'Enganche' : payment.paymentType === 'plates' ? 'Placas' : 'Otro'}
                              </span>
                              {/* 🔧 FIX: formatDate maneja las fechas correctamente */}
                              <span className="text-sm text-gray-600">{formatDate(payment.paymentDate)}</span>
                            </div>
                            <div className="flex items-center gap-4 mb-2">
                              <p className="text-2xl font-bold text-green-600">{formatCurrency(payment.amount || 0)}</p>
                              <span className="text-sm text-gray-600">{payment.paymentMethod === 'cash' ? '💵 Efectivo' : payment.paymentMethod === 'check' ? '📝 Cheque' : payment.paymentMethod === 'card' ? '💳 Tarjeta' : '🏦 Transferencia'}</span>
                            </div>
                            {payment.notes && (
                              <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                                <p className="text-sm text-gray-700"><span className="font-medium">Notas:</span> {payment.notes}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => onEditPayment(payment)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Editar pago"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePayment(payment.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Eliminar pago"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'info' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Vehículo</h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div><p className="text-sm text-gray-600">VIN</p><p className="font-mono font-medium">{client.vinNumber}</p></div>
                    <div><p className="text-sm text-gray-600">Año</p><p className="font-medium">{client.vehicleYear}</p></div>
                    <div><p className="text-sm text-gray-600">Marca</p><p className="font-medium">{client.vehicleMake}</p></div>
                    <div><p className="text-sm text-gray-600">Modelo</p><p className="font-medium">{client.vehicleModel}</p></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalles Financieros</h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    {/* 🔧 FIX: formatDate maneja las fechas correctamente */}
                    <div><p className="text-sm text-gray-600">Fecha de Compra</p><p className="font-medium">{formatDate(client.purchaseDate)}</p></div>
                    <div><p className="text-sm text-gray-600">Inicio de Pagos</p><p className="font-medium">{formatDate(client.paymentStartDate)}</p></div>
                    <div><p className="text-sm text-gray-600">Balance Original</p><p className="font-medium text-lg">{formatCurrency(client.totalBalance || 0)}</p></div>
                    <div><p className="text-sm text-gray-600">Pago Mensual</p><p className="font-medium text-lg">{formatCurrency(client.monthlyPayment || 0)}</p></div>
                    <div><p className="text-sm text-gray-600">Número de Pagos</p><p className="font-medium">{client.numberOfPayments}</p></div>
                    <div><p className="text-sm text-gray-600">Enganche</p><p className="font-medium">{formatCurrency(client.downPayment || 0)}</p></div>
                  </div>
                </div>

                {client.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Notas</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-gray-700">{client.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Generador de Contratos */}
      {showContractGenerator && (
        <ContractGenerator
          client={client}
          onClose={() => setShowContractGenerator(false)}
        />
      )}
    </div>
  );
}