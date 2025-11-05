import { useState } from 'react';
import { X, DollarSign, Calendar, AlertCircle, CheckCircle, Clock, FileText, Plus } from 'lucide-react';

export default function ClientDetail({ client, payments, onClose, onAddPayment, onAddNote }) {
  const [activeTab, setActiveTab] = useState('payments');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteText, setNoteText] = useState('');

  // Filtrar pagos de este cliente
  const clientPayments = payments.filter(p => p.clientId === client.id);
  
  // Calcular pagos pendientes
  const expectedPayments = Math.floor(
    (new Date() - new Date(client.paymentStartDate)) / (1000 * 60 * 60 * 24 * 30)
  );
  const paymentsMade = clientPayments.filter(p => p.paymentType === 'monthly').length;
  const pendingPayments = Math.max(0, expectedPayments - paymentsMade);

  // Verificar enganches y placas pendientes
  const downPaymentPending = (client.downPayment || 0) - (client.downPaymentPaid || 0);
  const platesPending = (client.platesAmount || 0) - (client.platesPaid || 0);

  const handleAddNote = () => {
    if (noteText.trim()) {
      const note = {
        text: noteText,
        date: new Date().toISOString(),
        type: 'general'
      };
      onAddNote(client.id, note);
      setNoteText('');
      setShowNoteForm(false);
    }
  };

  const tabs = [
    { id: 'payments', label: 'Historial de Pagos', icon: DollarSign },
    { id: 'pending', label: 'Pagos Pendientes', icon: Clock },
    { id: 'notes', label: 'Notas', icon: FileText }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold">{client.customerName}</h2>
            <p className="text-blue-100 mt-1">
              {client.vehicleYear} {client.vehicleMake} {client.vehicleModel}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-blue-800 rounded-lg transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Info Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Balance Restante</p>
            <p className="text-2xl font-bold text-blue-600">
              ${(client.remainingBalance || 0).toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Pago Mensual</p>
            <p className="text-2xl font-bold text-green-600">
              ${(client.monthlyPayment || 0).toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Pagos Realizados</p>
            <p className="text-2xl font-bold text-purple-600">
              {paymentsMade} / {client.numberOfPayments}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Estado</p>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              client.status === 'active' ? 'bg-green-100 text-green-800' :
              client.status === 'paid' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {client.status === 'active' ? 'Activo' : 
               client.status === 'paid' ? 'Pagado' : 'Moroso'}
            </span>
          </div>
        </div>

        {/* Alertas de pendientes */}
        {(downPaymentPending > 0 || platesPending > 0 || pendingPayments > 0) && (
          <div className="px-6 py-4 space-y-2">
            {downPaymentPending > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-semibold text-yellow-800">Enganche Pendiente</p>
                    <p className="text-sm text-yellow-700">
                      Faltan ${downPaymentPending.toLocaleString()} 
                      {client.downPaymentDueDate && ` - Vence: ${new Date(client.downPaymentDueDate).toLocaleDateString('es-ES')}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {platesPending > 0 && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-semibold text-blue-800">Placas Pendientes</p>
                    <p className="text-sm text-blue-700">
                      Faltan ${platesPending.toLocaleString()}
                      {client.platesDueDate && ` - Vence: ${new Date(client.platesDueDate).toLocaleDateString('es-ES')}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {pendingPayments > 0 && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                  <div>
                    <p className="font-semibold text-red-800">Pagos Mensuales Atrasados</p>
                    <p className="text-sm text-red-700">
                      {pendingPayments} pago{pendingPayments > 1 ? 's' : ''} atrasado{pendingPayments > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex px-6 gap-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab: Historial de Pagos */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Historial de Pagos</h3>
                <button
                  onClick={() => onAddPayment(client)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  Registrar Pago
                </button>
              </div>

              {clientPayments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay pagos registrados aún</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientPayments
                    .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
                    .map(payment => (
                      <div key={payment.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                payment.paymentType === 'monthly' ? 'bg-blue-100 text-blue-800' :
                                payment.paymentType === 'downpayment' ? 'bg-yellow-100 text-yellow-800' :
                                payment.paymentType === 'plates' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {payment.paymentType === 'monthly' ? 'Pago Mensual' :
                                 payment.paymentType === 'downpayment' ? 'Enganche' :
                                 payment.paymentType === 'plates' ? 'Placas' : 'Otro'}
                              </span>
                              <span className="text-sm text-gray-600">
                                {new Date(payment.paymentDate).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <p className="text-2xl font-bold text-green-600">
                                ${(payment.amount || 0).toLocaleString()}
                              </p>
                              <span className="text-sm text-gray-600">
                                {payment.paymentMethod === 'cash' ? '💵 Efectivo' :
                                 payment.paymentMethod === 'check' ? '📝 Cheque' :
                                 payment.paymentMethod === 'card' ? '💳 Tarjeta' :
                                 '🏦 Transferencia'}
                              </span>
                            </div>

                            {payment.notes && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Notas:</span> {payment.notes}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Pagos Pendientes */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Pagos Pendientes</h3>
              
              <div className="space-y-3">
                {downPaymentPending > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Enganche Pendiente
                          </span>
                          {client.downPaymentDueDate && (
                            <span className="text-sm text-gray-600">
                              Vence: {new Date(client.downPaymentDueDate).toLocaleDateString('es-ES')}
                            </span>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-yellow-700">
                          ${downPaymentPending.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => onAddPayment(client, 'downpayment')}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm"
                      >
                        Registrar Pago
                      </button>
                    </div>
                  </div>
                )}

                {platesPending > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Placas Pendientes
                          </span>
                          {client.platesDueDate && (
                            <span className="text-sm text-gray-600">
                              Vence: {new Date(client.platesDueDate).toLocaleDateString('es-ES')}
                            </span>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-blue-700">
                          ${platesPending.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => onAddPayment(client, 'plates')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        Registrar Pago
                      </button>
                    </div>
                  </div>
                )}

                {pendingPayments > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Pagos Mensuales Atrasados
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-red-700">
                          {pendingPayments} pago{pendingPayments > 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Total aproximado: ${(pendingPayments * client.monthlyPayment).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => onAddPayment(client, 'monthly')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                      >
                        Registrar Pago
                      </button>
                    </div>
                  </div>
                )}

                {downPaymentPending === 0 && platesPending === 0 && pendingPayments === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p className="text-lg font-medium text-gray-700">¡Todo al corriente!</p>
                    <p className="text-sm text-gray-500 mt-1">No hay pagos pendientes</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Notas */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Notas de Cobranza</h3>
                <button
                  onClick={() => setShowNoteForm(!showNoteForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Nota
                </button>
              </div>

              {showNoteForm && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Escribe una nota sobre el cliente, arreglos de pago, razones de atraso, etc..."
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleAddNote}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      Guardar Nota
                    </button>
                    <button
                      onClick={() => {
                        setShowNoteForm(false);
                        setNoteText('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {client.notes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-800 mb-2">Notas Generales del Cliente</p>
                  <p className="text-gray-700">{client.notes}</p>
                </div>
              )}

              <div className="space-y-3">
                {clientPayments
                  .filter(p => p.notes)
                  .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
                  .map(payment => (
                    <div key={payment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              {new Date(payment.paymentDate).toLocaleDateString('es-ES')}
                            </span>
                            <span className="text-xs text-gray-500">
                              • {payment.paymentType === 'monthly' ? 'Pago Mensual' :
                                 payment.paymentType === 'downpayment' ? 'Enganche' :
                                 payment.paymentType === 'plates' ? 'Placas' : 'Otro'}
                            </span>
                          </div>
                          <p className="text-gray-600">{payment.notes}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {!client.notes && clientPayments.filter(p => p.notes).length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay notas registradas</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer con información de contacto */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600 font-medium">Teléfono</p>
              <p className="text-gray-800">{client.phone}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Dirección</p>
              <p className="text-gray-800">{client.address || 'No especificada'}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">VIN</p>
              <p className="text-gray-800 font-mono">{client.vinNumber}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
