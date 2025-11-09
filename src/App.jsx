import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import PaymentHistory from './components/PaymentHistory';
import ClientFormPage from './components/ClientFormPage';
import PaymentForm from './components/PaymentForm';
import ClientDetailPage from './components/ClientDetailPage';
import SettingsPage from './components/SettingsPage';
import Login from './components/Login';
import InventoryList from './components/inventory/InventoryList';  // 🆕 NUEVO
import { Home, Users, DollarSign, Plus, LogOut, Settings, Car } from 'lucide-react';  // 🆕 Agregado Car

import { db } from './config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  orderBy 
} from 'firebase/firestore';

import { generateScheduledPayments, applyPaymentToScheduled, calculatePaymentStatus } from './utils/paymentScheduler';

function AppContent() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showClientDetail, setShowClientDetail] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedScheduledPayment, setSelectedScheduledPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadClients();
      loadPayments();
    }
  }, [user]);

  const loadClients = async () => {
    try {
      const q = query(collection(db, 'clients'), orderBy('customerName', 'asc'));
      const querySnapshot = await getDocs(q);
      const clientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClients(clientsData);
    } catch (error) {
      console.error('Error cargando clientes:', error);
      alert('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      const q = query(collection(db, 'payments'), orderBy('paymentDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const paymentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error cargando pagos:', error);
    }
  };

  const handleSaveClient = async (clientData) => {
    try {
      if (editingClient) {
        // 🔧 FIX: Al editar, regenerar scheduledPayments si cambiaron valores importantes
        // O si cambió el modo de pagos (estándar <-> personalizado)
        const shouldRegenerateSchedule = 
          editingClient.downPayment !== clientData.downPayment ||
          editingClient.downPaymentPaid !== clientData.downPaymentPaid ||
          editingClient.platesAmount !== clientData.platesAmount ||
          editingClient.platesPaid !== clientData.platesPaid ||
          editingClient.monthlyPayment !== clientData.monthlyPayment ||
          editingClient.numberOfPayments !== clientData.numberOfPayments ||
          // 🆕 NUEVA CONDICIÓN: Detectar cambio en modo de pagos
          editingClient.useCustomSchedule !== clientData.useCustomSchedule ||
          // 🆕 O si cambió el schedule personalizado
          (clientData.useCustomSchedule && 
           JSON.stringify(editingClient.customPaymentSchedule) !== JSON.stringify(clientData.customPaymentSchedule));

        const updateData = {
          ...clientData,
          updatedAt: new Date()
        };

        if (shouldRegenerateSchedule) {
          // Regenerar los pagos programados con los nuevos valores
          const newScheduledPayments = generateScheduledPayments(clientData);
          
          // 🔧 IMPORTANTE: Preservar pagos ya aplicados
          // Si el cliente ya tenía scheduledPayments, intentar preservar los pagos aplicados
          if (editingClient.scheduledPayments && Array.isArray(editingClient.scheduledPayments)) {
            newScheduledPayments.forEach(newPayment => {
              // Buscar si este pago ya existía
              const oldPayment = editingClient.scheduledPayments.find(
                old => old.id === newPayment.id || 
                      (old.type === newPayment.type && old.paymentNumber === newPayment.paymentNumber)
              );
              
              if (oldPayment && oldPayment.paidAmount > 0) {
                // Preservar el monto pagado
                newPayment.paidAmount = oldPayment.paidAmount;
                newPayment.remainingAmount = newPayment.amount - oldPayment.paidAmount;
                newPayment.payments = oldPayment.payments || [];
                newPayment.status = calculatePaymentStatus(newPayment);
              }
            });
          }
          
          updateData.scheduledPayments = newScheduledPayments;
        }

        await updateDoc(doc(db, 'clients', editingClient.id), updateData);
      } else {
        const scheduledPayments = generateScheduledPayments(clientData);
        
        await addDoc(collection(db, 'clients'), {
          ...clientData,
          scheduledPayments,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      await loadClients();
      setShowClientForm(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Error guardando cliente:', error);
      alert('Error al guardar el cliente');
    }
  };

  const handleDeleteClient = async (id) => {
    if (confirm('¿Estás seguro de eliminar este cliente? También se eliminarán todos sus pagos.')) {
      try {
        await deleteDoc(doc(db, 'clients', id));
        await loadClients();
        
        const clientPayments = payments.filter(p => p.clientId === id);
        for (const payment of clientPayments) {
          await deleteDoc(doc(db, 'payments', payment.id));
        }
        await loadPayments();
      } catch (error) {
        console.error('Error eliminando cliente:', error);
        alert('Error al eliminar el cliente');
      }
    }
  };

  const handleSavePayment = async (paymentData) => {
    try {
      if (editingPayment) {
        // EDITAR PAGO EXISTENTE
        const oldPayment = payments.find(p => p.id === editingPayment.id);
        const client = clients.find(c => c.id === selectedClient.id);
        
        const updateData = {
          updatedAt: new Date()
        };

        // Revertir según tipo de pago
        if (oldPayment.paymentType === 'monthly') {
          updateData.remainingBalance = (client.remainingBalance || 0) + oldPayment.amount;
        } else if (oldPayment.paymentType === 'downpayment') {
          updateData.downPaymentPaid = Math.max(0, (client.downPaymentPaid || 0) - oldPayment.amount);
          updateData.downPaymentPending = (client.downPayment || 0) - updateData.downPaymentPaid;
        } else if (oldPayment.paymentType === 'plates') {
          updateData.platesPaid = Math.max(0, (client.platesPaid || 0) - oldPayment.amount);
          updateData.platesPending = (client.platesAmount || 0) - updateData.platesPaid;
        }

        // Revertir del pago programado
        if (oldPayment.appliedToScheduledPayment && client.scheduledPayments) {
          const updatedScheduledPayments = client.scheduledPayments.map(sp => {
            if (sp.id === oldPayment.appliedToScheduledPayment) {
              const newPaidAmount = Math.max(0, (sp.paidAmount || 0) - oldPayment.amount);
              return {
                ...sp,
                paidAmount: newPaidAmount,
                remainingAmount: sp.amount - newPaidAmount,
                payments: sp.payments.filter(pid => pid !== editingPayment.id)
              };
            }
            return sp;
          });
          updateData.scheduledPayments = updatedScheduledPayments;
        }

        // Actualizar el documento de pago
        await updateDoc(doc(db, 'payments', editingPayment.id), {
          ...paymentData,
          updatedAt: new Date()
        });

        // Aplicar el nuevo pago
        if (paymentData.paymentType === 'monthly') {
          updateData.remainingBalance = Math.max(0, updateData.remainingBalance - paymentData.amount);
          updateData.status = updateData.remainingBalance <= 0 ? 'paid' : client.status;
        } else if (paymentData.paymentType === 'downpayment') {
          updateData.downPaymentPaid = (updateData.downPaymentPaid || 0) + paymentData.amount;
          updateData.downPaymentPending = Math.max(0, (client.downPayment || 0) - updateData.downPaymentPaid);
        } else if (paymentData.paymentType === 'plates') {
          updateData.platesPaid = (updateData.platesPaid || 0) + paymentData.amount;
          updateData.platesPending = Math.max(0, (client.platesAmount || 0) - updateData.platesPaid);
        }

        // Aplicar al pago programado
        if (paymentData.appliedToScheduledPayment && updateData.scheduledPayments) {
          const finalScheduledPayments = updateData.scheduledPayments.map(sp => {
            if (sp.id === paymentData.appliedToScheduledPayment) {
              const newPaidAmount = (sp.paidAmount || 0) + paymentData.amount;
              return {
                ...sp,
                paidAmount: newPaidAmount,
                remainingAmount: Math.max(0, sp.amount - newPaidAmount),
                payments: [...(sp.payments || []), editingPayment.id]
              };
            }
            return sp;
          });
          
          finalScheduledPayments.forEach(sp => {
            sp.status = calculatePaymentStatus(sp);
          });
          
          updateData.scheduledPayments = finalScheduledPayments;
        }

        await updateDoc(doc(db, 'clients', selectedClient.id), updateData);
        
      } else {
        // CREAR NUEVO PAGO
        const paymentRef = await addDoc(collection(db, 'payments'), {
          ...paymentData,
          createdAt: new Date(),
          createdBy: user.uid
        });

        const client = clients.find(c => c.id === selectedClient.id);
        const updateData = {
          lastPaymentDate: paymentData.paymentDate,
          updatedAt: new Date()
        };

        if (paymentData.appliedToScheduledPayment) {
          const updatedScheduledPayments = applyPaymentToScheduled(
            client.scheduledPayments || [],
            { ...paymentData, id: paymentRef.id }
          );
          
          updatedScheduledPayments.forEach(sp => {
            sp.status = calculatePaymentStatus(sp);
          });
          
          updateData.scheduledPayments = updatedScheduledPayments;
        }

        if (paymentData.paymentType === 'monthly') {
          const newBalance = Math.max(0, client.remainingBalance - paymentData.amount);
          updateData.remainingBalance = newBalance;
          updateData.status = newBalance <= 0 ? 'paid' : client.status;
        } else if (paymentData.paymentType === 'downpayment') {
          const newDownPaymentPaid = (client.downPaymentPaid || 0) + paymentData.amount;
          updateData.downPaymentPaid = newDownPaymentPaid;
          updateData.downPaymentPending = Math.max(0, (client.downPayment || 0) - newDownPaymentPaid);
        } else if (paymentData.paymentType === 'plates') {
          const newPlatesPaid = (client.platesPaid || 0) + paymentData.amount;
          updateData.platesPaid = newPlatesPaid;
          updateData.platesPending = Math.max(0, (client.platesAmount || 0) - newPlatesPaid);
        }

        await updateDoc(doc(db, 'clients', selectedClient.id), updateData);
      }

      await loadClients();
      await loadPayments();
      
      setShowPaymentForm(false);
      setEditingPayment(null);
      setSelectedScheduledPayment(null);
      
    } catch (error) {
      console.error('Error guardando pago:', error);
      alert('Error al guardar el pago: ' + error.message);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    try {
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return;

      const client = clients.find(c => c.id === payment.clientId);
      if (!client) return;

      const updateData = {
        updatedAt: new Date()
      };

      if (payment.paymentType === 'monthly') {
        updateData.remainingBalance = (client.remainingBalance || 0) + payment.amount;
        updateData.status = 'active';
      } else if (payment.paymentType === 'downpayment') {
        updateData.downPaymentPaid = Math.max(0, (client.downPaymentPaid || 0) - payment.amount);
        updateData.downPaymentPending = (client.downPayment || 0) - updateData.downPaymentPaid;
      } else if (payment.paymentType === 'plates') {
        updateData.platesPaid = Math.max(0, (client.platesPaid || 0) - payment.amount);
        updateData.platesPending = (client.platesAmount || 0) - updateData.platesPaid;
      }

      // Revertir del pago programado
      if (payment.appliedToScheduledPayment && client.scheduledPayments) {
        const updatedScheduledPayments = client.scheduledPayments.map(sp => {
          if (sp.id === payment.appliedToScheduledPayment) {
            const newPaidAmount = Math.max(0, (sp.paidAmount || 0) - payment.amount);
            return {
              ...sp,
              paidAmount: newPaidAmount,
              remainingAmount: sp.amount - newPaidAmount,
              payments: (sp.payments || []).filter(pid => pid !== paymentId),
              status: calculatePaymentStatus({
                ...sp,
                paidAmount: newPaidAmount,
                remainingAmount: sp.amount - newPaidAmount
              })
            };
          }
          return sp;
        });
        updateData.scheduledPayments = updatedScheduledPayments;
      }

      await deleteDoc(doc(db, 'payments', paymentId));
      await updateDoc(doc(db, 'clients', client.id), updateData);

      await loadClients();
      await loadPayments();

    } catch (error) {
      console.error('Error eliminando pago:', error);
      alert('Error al eliminar el pago: ' + error.message);
    }
  };

  const handleAddPayment = (client, scheduledPayment = null) => {
    setSelectedClient(client);
    setSelectedScheduledPayment(scheduledPayment);
    setEditingPayment(null);
    setShowPaymentForm(true);
  };

  const handleEditPayment = (payment) => {
    const client = clients.find(c => c.id === payment.clientId);
    setSelectedClient(client);
    setEditingPayment(payment);
    
    if (payment.appliedToScheduledPayment && client.scheduledPayments) {
      const scheduledPay = client.scheduledPayments.find(sp => sp.id === payment.appliedToScheduledPayment);
      setSelectedScheduledPayment(scheduledPay);
    } else {
      setSelectedScheduledPayment(null);
    }
    
    setShowPaymentForm(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowClientForm(true);
  };

  const handleViewDetail = (client) => {
    setSelectedClient(client);
    setShowClientDetail(true);
  };

  const handleUpdateClient = async (clientId, updates) => {
    try {
      await updateDoc(doc(db, 'clients', clientId), {
        ...updates,
        updatedAt: new Date()
      });
      await loadClients();
    } catch (error) {
      console.error('Error actualizando cliente:', error);
      alert('Error al actualizar el cliente');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'payments', label: 'Pagos', icon: DollarSign },
    { id: 'inventory', label: 'Inventario', icon: Car }  // 🆕 NUEVO
  ];

  if (!user) {
    return <Login />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (showSettings) {
    return <SettingsPage onClose={() => setShowSettings(false)} />;
  }

  if (showClientForm) {
    return (
      <ClientFormPage
        client={editingClient}
        onSave={handleSaveClient}
        onCancel={() => {
          setShowClientForm(false);
          setEditingClient(null);
        }}
      />
    );
  }

  if (showClientDetail && selectedClient) {
    return (
      <>
        <ClientDetailPage
          client={selectedClient}
          payments={payments}
          onClose={() => {
            setShowClientDetail(false);
            setSelectedClient(null);
          }}
          onUpdateClient={handleUpdateClient}
          onAddPayment={handleAddPayment}
          onEditPayment={handleEditPayment}
          onDeletePayment={handleDeletePayment}
        />
        
        {showPaymentForm && selectedClient && (
          <PaymentForm
            client={selectedClient}
            scheduledPayment={selectedScheduledPayment}
            existingPayment={editingPayment}
            onSave={handleSavePayment}
            onCancel={() => {
              setShowPaymentForm(false);
              setEditingPayment(null);
              setSelectedScheduledPayment(null);
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">BHPH System</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      currentView === item.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
              
              {currentView === 'clients' && (
                <button
                  onClick={() => {
                    setEditingClient(null);
                    setShowClientForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Nuevo Cliente</span>
                </button>
              )}
              
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="Configuración"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="md:hidden bg-white border-t border-gray-200">
        <div className="flex justify-around py-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
                currentView === item.id
                  ? 'text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <Dashboard clients={clients} payments={payments} />
        )}
        
        {currentView === 'clients' && (
          <ClientList
            clients={clients}
            onEdit={handleEditClient}
            onDelete={handleDeleteClient}
            onViewDetail={handleViewDetail}
          />
        )}
        
        {currentView === 'payments' && (
          <PaymentHistory payments={payments} clients={clients} />
        )}

        {/* 🆕 NUEVO - Vista de Inventario */}
        {currentView === 'inventory' && (
          <InventoryList />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </AuthProvider>
  );
}