import { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MapPin, Car, DollarSign, Calendar, FileText, Edit2, Trash2, Zap } from 'lucide-react';
import PaymentSchedule from './PaymentSchedule';
import ContractGenerator from './contracts/ContractGenerator';
import { generateScheduledPayments } from '../utils/paymentScheduler';
import { useSettings } from '../context/SettingsContext';

export default function ClientDetailPage({ client: initialClient, payments, onClose, onUpdateClient, onAddPayment, onEditPayment, onDeletePayment }) {
  const [activeTab, setActiveTab] = useState('schedule');
  const [scheduledPayments, setScheduledPayments] = useState([]);
  const [showContractGenerator, setShowContractGenerator] = useState(false);
  const [client, setClient] = useState(initialClient);
  const { formatDate, formatCurrency } = useSettings();

  useEffect(() => {
    setClient(initialClient);
  }, [initialClient]);

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

  // Calcular balance restante correctamente
  const remainingBalance = client.remainingBalance || client.totalBalance || 0;
  
  // Calcular total pendiente de todos los scheduled payments
  const downpaymentScheduled = scheduledPayments.filter(p => p.type === 'downpayment');
  const platesScheduled = scheduledPayments.filter(p => p.type === 'plates');
  const monthlyScheduled = scheduledPayments.filter(p => p.type === 'monthly' && p.status !== 'paid');
  
  const totalPendingAmount = downpaymentScheduled.reduce((sum, p) => sum + (p.remainingAmount || 0), 0) +
                             platesScheduled.reduce((sum, p) => sum + (p.remainingAmount || 0), 0) +
                             monthlyScheduled.reduce((sum, p) => sum + (p.remainingAmount || 0), 0);

  const handleUpdateDate = async (paymentId, newDate) => {
    const updated = scheduledPayments.map(sp =>
      sp.id === paymentId ? { ...sp, dueDate: newDate } : sp
    );
    setScheduledPayments(updated);
    await onUpdateClient(client.id, { scheduledPayments: updated });
  };

  const handleApplyPayment = (scheduledPayment) => {
    onAddPayment(client, scheduledPayment);
  };

  const handleQuickPayment = () => {
    onAddPayment(client, null);
  };

  const handleDeletePayment = (paymentId) => {
    if (confirm('¿Estás seguro de eliminar este pago? Esta acción no se puede deshacer.')) {
      onDeletePayment(paymentId);
    }
  };

  const tabs = [
    { id: 'schedule', label: 'Calendario de Pagos', icon: Calendar },
    { id: 'history', label: 'Historial', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{client.customerName}</h1>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  {client.vehicleYear} {client.vehicleMake} {client.vehicleModel} - VIN: {client.vinNumber}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleQuickPayment}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-sm"
                title="Registrar pago que se distribuirá automáticamente"
              >
                <Zap className="w-5 h-5" />
                Pago Rápido
              </button>
              <button
                onClick={() => setShowContractGenerator(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                <FileText className="w-5 h-5" />
                Contratos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info Bar */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-6 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Teléfono:</span>
              <span>{client.phone || 'No registrado'}</span>
            </div>
            {client.address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Dirección:</span>
                <span>{client.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Balance Restante</p>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(remainingBalance)}</p>
            <p className="text-xs text-gray-500 mt-1">de {formatCurrency(client.totalBalance || 0)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Pago Mensual</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(client.monthlyPayment || 0)}</p>
            <p className="text-xs text-gray-500 mt-1">Monto regular</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Progreso de Pagos</p>
            <p className="text-3xl font-bold text-purple-600">{paidMonthlyCount} / {client.numberOfPayments}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${client.numberOfPayments > 0 ? (paidMonthlyCount / client.numberOfPayments) * 100 : 0}%` }} 
              />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Total Pendiente</p>
            <p className="text-3xl font-bold text-orange-600">{formatCurrency(totalPendingAmount)}</p>
            <p className="text-xs text-gray-500 mt-1">Suma de todos los pendientes</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex px-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition font-medium ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
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
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Historial de Pagos ({clientPayments.length})
                </h3>
                {clientPayments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay pagos registrados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clientPayments
                      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
                      .map(payment => (
                        <div key={payment.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                  payment.paymentType === 'monthly' ? 'bg-green-100 text-green-800' :
                                  payment.paymentType === 'downpayment' ? 'bg-yellow-100 text-yellow-800' :
                                  payment.paymentType === 'plates' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {payment.paymentType === 'monthly' ? 'Pago Mensual' :
                                   payment.paymentType === 'downpayment' ? 'Enganche' :
                                   payment.paymentType === 'plates' ? 'Placas' : 'Otro'}
                                </span>
                                <span className="text-sm text-gray-600">{formatDate(payment.paymentDate)}</span>
                              </div>
                              <div className="flex items-center gap-4 mb-2">
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(payment.amount || 0)}</p>
                                <span className="text-sm text-gray-600">
                                  {payment.paymentMethod === 'cash' ? 'Efectivo' :
                                   payment.paymentMethod === 'check' ? 'Cheque' :
                                   payment.paymentMethod === 'card' ? 'Tarjeta' :
                                   'Transferencia'}
                                </span>
                              </div>
                              {payment.notes && (
                                <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                                  <p className="text-sm text-gray-700">
                                    <span className="font-medium">Notas:</span> {payment.notes}
                                  </p>
                                </div>
                              )}
                              {payment.appliedToScheduledPayment && (
                                <div className="mt-2">
                                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                    Aplicado a pago programado
                                  </span>
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
          </div>
        </div>
      </div>

      {/* Contract Generator Modal */}
      {showContractGenerator && (
        <ContractGenerator
          client={client}
          onClose={() => setShowContractGenerator(false)}
        />
      )}
    </div>
  );
}