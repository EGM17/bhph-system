import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';

// Admin Components
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import PaymentHistory from './components/PaymentHistory';
import ClientFormPage from './components/ClientFormPage';
import PaymentForm from './components/PaymentForm';
import ClientDetailPage from './components/ClientDetailPage';
import SettingsPage from './components/SettingsPage';
import Login from './components/Login';
import InventoryList from './components/inventory/InventoryList';
import LeadsPage from './components/LeadsPage';
import AdminLayout from './components/layouts/AdminLayout';

// Public Components
import PublicLayout from './components/layouts/PublicLayout';
import HomePage from './pages/public/HomePage';
import InventoryPage from './pages/public/InventoryPage';
import VehicleDetailPage from './pages/public/VehicleDetailPage';
import FinancingPage from './pages/public/FinancingPage';
import ContactPage from './pages/public/ContactPage';

import { Home, Users, DollarSign, Car, MessageSquare } from 'lucide-react';

import { db } from './config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  getDoc,
  query,
  orderBy 
} from 'firebase/firestore';

import { generateScheduledPayments, calculatePaymentStatus } from './utils/paymentScheduler';

// ⬅️ NUEVO: Importar servicios con caché
import { cacheService } from './services/cacheService';
import { getAllClients } from './services/clientService';
import { getAllPayments, deleteAllClientPayments } from './services/paymentService';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AdminApp() {
  const { logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showClientDetail, setShowClientDetail] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedScheduledPayment, setSelectedScheduledPayment] = useState(null);

  // ⬅️ NUEVO: Cargar datos inicial con caché
  useEffect(() => {
    loadClients();
    loadPayments();

    // ⬅️ NUEVO: Suscribirse a invalidaciones de caché
    const unsubscribe = cacheService.subscribe((type) => {
      console.log(`🔄 Caché invalidada (${type}), recargando datos...`);
      loadClients(true); // forceRefresh
      loadPayments(true); // forceRefresh
    }, 'payment');

    return () => unsubscribe();
  }, []);

  // ⬅️ MODIFICADO: Función para cargar clientes con caché
  const loadClients = async (forceRefresh = false) => {
    try {
      console.log(forceRefresh ? '🔄 Forzando recarga de clientes...' : '📖 Cargando clientes...');
      const clientsData = await getAllClients(forceRefresh);
      setClients(clientsData);
    } catch (error) {
      console.error('❌ Error cargando clientes:', error);
      alert('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  // ⬅️ MODIFICADO: Función para cargar pagos con caché
  const loadPayments = async (forceRefresh = false) => {
    try {
      console.log(forceRefresh ? '🔄 Forzando recarga de pagos...' : '📖 Cargando pagos...');
      const paymentsData = await getAllPayments(forceRefresh);
      setPayments(paymentsData);
    } catch (error) {
      console.error('❌ Error cargando pagos:', error);
    }
  };

  const handleSaveClient = async (clientData) => {
    try {
      if (editingClient) {
        const shouldRegenerateSchedule = 
          editingClient.downPayment !== clientData.downPayment ||
          editingClient.downPaymentPaid !== clientData.downPaymentPaid ||
          editingClient.platesAmount !== clientData.platesAmount ||
          editingClient.platesPaid !== clientData.platesPaid ||
          editingClient.monthlyPayment !== clientData.monthlyPayment ||
          editingClient.numberOfPayments !== clientData.numberOfPayments ||
          editingClient.useCustomSchedule !== clientData.useCustomSchedule ||
          (clientData.useCustomSchedule && 
           JSON.stringify(editingClient.customPaymentSchedule) !== JSON.stringify(clientData.customPaymentSchedule));

        const updateData = {
          ...clientData,
          updatedAt: new Date()
        };

        if (shouldRegenerateSchedule) {
          const newScheduledPayments = generateScheduledPayments(clientData);
          
          if (editingClient.scheduledPayments && Array.isArray(editingClient.scheduledPayments)) {
            newScheduledPayments.forEach(newPayment => {
              const oldPayment = editingClient.scheduledPayments.find(
                old => old.id === newPayment.id || 
                      (old.type === newPayment.type && old.paymentNumber === newPayment.paymentNumber)
              );
              
              if (oldPayment && oldPayment.paidAmount > 0) {
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
        
        // ⬅️ NUEVO: Invalidar caché manualmente (por si acaso)
        cacheService.invalidatePaymentCache();
      } else {
        const scheduledPayments = generateScheduledPayments(clientData);
        
        await addDoc(collection(db, 'clients'), {
          ...clientData,
          scheduledPayments,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        // ⬅️ NUEVO: Invalidar caché manualmente
        cacheService.invalidatePaymentCache();
      }
      
      // ⬅️ MODIFICADO: Recargar con forceRefresh
      await loadClients(true);
      setShowClientForm(false);
      setEditingClient(null);
    } catch (error) {
      console.error('❌ Error guardando cliente:', error);
      alert('Error al guardar el cliente');
    }
  };

  const handleDeleteClient = async (id) => {
    if (confirm('¿Estás seguro de eliminar este cliente? También se eliminarán todos sus pagos.')) {
      try {
        // Eliminar cliente
        await deleteDoc(doc(db, 'clients', id));
        
        // Eliminar todos sus pagos
        await deleteAllClientPayments(id);
        
        // ⬅️ NUEVO: Invalidar caché
        cacheService.invalidatePaymentCache();
        
        // ⬅️ MODIFICADO: Recargar con forceRefresh
        await loadClients(true);
        await loadPayments(true);
      } catch (error) {
        console.error('❌ Error eliminando cliente:', error);
        alert('Error al eliminar el cliente');
      }
    }
  };

  const handleSavePayment = async (paymentData) => {
    try {
      console.log('\n🔵 ===== INICIANDO GUARDADO DE PAGO =====');
      console.log('📝 Datos del pago:', paymentData);
      
      // Obtener cliente fresco de Firebase
      const clientRef = doc(db, 'clients', selectedClient.id);
      const clientSnap = await getDoc(clientRef);
      
      if (!clientSnap.exists()) {
        alert('Cliente no encontrado');
        return;
      }
      
      const client = { id: clientSnap.id, ...clientSnap.data() };
      console.log('👤 Cliente obtenido:', client.customerName);

      let paymentId = editingPayment?.id;

      // PASO 1: Si es edición, revertir el pago viejo
      if (editingPayment) {
        console.log('\n🔄 PASO 1: Revirtiendo pago anterior');
        const oldPayment = payments.find(p => p.id === editingPayment.id);
        console.log('📋 Pago anterior:', oldPayment);
        
        await revertPayment(client, oldPayment);
        
        // Actualizar el documento del pago
        await updateDoc(doc(db, 'payments', editingPayment.id), {
          ...paymentData,
          updatedAt: new Date()
        });
        console.log('✅ Pago actualizado en Firebase');
      } else {
        // PASO 1: Crear nuevo pago
        console.log('\n🆕 PASO 1: Creando nuevo pago');
        const paymentDoc = await addDoc(collection(db, 'payments'), {
          ...paymentData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        paymentId = paymentDoc.id;
        console.log('✅ Pago creado con ID:', paymentId);
      }

      // PASO 2: Aplicar el pago
      console.log('\n💰 PASO 2: Aplicando pago al cliente');
      await applyPaymentToClient(client, { ...paymentData, id: paymentId });

      // ⬅️ NUEVO: Invalidar caché
      cacheService.invalidatePaymentCache();

      // PASO 3: Recargar datos con forceRefresh
      console.log('\n🔄 PASO 3: Recargando datos');
      await loadClients(true);
      await loadPayments(true);

      // PASO 4: Actualizar selectedClient con datos frescos
      const updatedClientSnap = await getDoc(clientRef);
      if (updatedClientSnap.exists()) {
        setSelectedClient({ id: updatedClientSnap.id, ...updatedClientSnap.data() });
      }

      setShowPaymentForm(false);
      setEditingPayment(null);
      setSelectedScheduledPayment(null);
    } catch (error) {
      console.error('❌ Error guardando pago:', error);
      alert('Error al guardar el pago: ' + error.message);
    }
  };

  const revertPayment = async (client, payment) => {
    console.log('\n🔄 ===== REVIRTIENDO PAGO =====');
    
    const updateData = {};
    
    if (payment.distribution) {
      const { appliedToDownPayment, appliedToPlates, appliedToMonthly } = payment.distribution;
      
      if (appliedToDownPayment > 0) {
        updateData.downPaymentPaid = Math.max(0, (client.downPaymentPaid || 0) - appliedToDownPayment);
        updateData.downPaymentPending = Math.max(0, (client.downPayment || 0) - updateData.downPaymentPaid);
        console.log(`   📤 Enganche: -${appliedToDownPayment}`);
      }
      
      if (appliedToPlates > 0) {
        updateData.platesPaid = Math.max(0, (client.platesPaid || 0) - appliedToPlates);
        updateData.platesPending = Math.max(0, (client.platesAmount || 0) - updateData.platesPaid);
        console.log(`   📤 Placas: -${appliedToPlates}`);
      }
      
      if (appliedToMonthly > 0) {
        updateData.remainingBalance = Math.min(
          client.totalBalance || client.remainingBalance || 0,
          (client.remainingBalance || 0) + appliedToMonthly
        );
        console.log(`   📤 Balance: +${appliedToMonthly}`);
      }
    }
    
    if (client.scheduledPayments && payment.appliedToScheduledPayment) {
      updateData.scheduledPayments = client.scheduledPayments.map(sp => {
        if (sp.id === payment.appliedToScheduledPayment) {
          const newPaidAmount = Math.max(0, (sp.paidAmount || 0) - payment.amount);
          return {
            ...sp,
            paidAmount: newPaidAmount,
            remainingAmount: sp.amount - newPaidAmount,
            payments: (sp.payments || []).filter(p => p.paymentId !== payment.id),
            status: calculatePaymentStatus({ ...sp, paidAmount: newPaidAmount, remainingAmount: sp.amount - newPaidAmount })
          };
        }
        return sp;
      });
    }

    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date();
      await updateDoc(doc(db, 'clients', client.id), updateData);
      console.log('✅ Cliente actualizado después de revertir\n');
    }
  };

  const applyPaymentToClient = async (freshClient, paymentData) => {
    console.log('💰 ===== APLICANDO PAGO AL CLIENTE =====');
    
    const updateData = {};
    let remainingAmount = paymentData.amount;
    const paymentDistribution = { appliedToDownPayment: 0, appliedToPlates: 0, appliedToMonthly: 0 };

    // 1. Enganche pendiente
    if (freshClient.downPaymentPending > 0 && remainingAmount > 0) {
      const appliedToDownPayment = Math.min(remainingAmount, freshClient.downPaymentPending);
      updateData.downPaymentPaid = (freshClient.downPaymentPaid || 0) + appliedToDownPayment;
      updateData.downPaymentPending = Math.max(0, freshClient.downPaymentPending - appliedToDownPayment);
      remainingAmount -= appliedToDownPayment;
      paymentDistribution.appliedToDownPayment = appliedToDownPayment;
      console.log(`   ✅ Aplicado a enganche: ${appliedToDownPayment}`);
    }

    // 2. Placas pendientes
    if (freshClient.platesPending > 0 && remainingAmount > 0) {
      const appliedToPlates = Math.min(remainingAmount, freshClient.platesPending);
      updateData.platesPaid = (freshClient.platesPaid || 0) + appliedToPlates;
      updateData.platesPending = Math.max(0, freshClient.platesPending - appliedToPlates);
      remainingAmount -= appliedToPlates;
      paymentDistribution.appliedToPlates = appliedToPlates;
      console.log(`   ✅ Aplicado a placas: ${appliedToPlates}`);
    }

    // 3. Mensualidades
    const appliedToMonthly = remainingAmount;
    paymentDistribution.appliedToMonthly = appliedToMonthly;

    if (paymentData.appliedToScheduledPayment && freshClient.scheduledPayments) {
      updateData.scheduledPayments = freshClient.scheduledPayments.map(sp => {
        if (sp.id === paymentData.appliedToScheduledPayment) {
          const newPaidAmount = (sp.paidAmount || 0) + appliedToMonthly;
          const newRemainingAmount = Math.max(0, sp.amount - newPaidAmount);
          return {
            ...sp,
            paidAmount: newPaidAmount,
            remainingAmount: newRemainingAmount,
            payments: [...(sp.payments || []), {
              paymentId: paymentData.id,
              amount: appliedToMonthly,
              date: paymentData.paymentDate
            }],
            status: calculatePaymentStatus({ ...sp, paidAmount: newPaidAmount, remainingAmount: newRemainingAmount })
          };
        }
        return sp;
      });
      console.log(`   ✅ Aplicado a mensualidad: ${appliedToMonthly}`);
    }

    if (updateData.downPaymentPaid) {
      updateData.downPaymentPending = Math.max(0, (freshClient.downPayment || 0) - updateData.downPaymentPaid);
    }
    
    if (updateData.platesPaid) {
      updateData.platesPending = Math.max(0, (freshClient.platesAmount || 0) - updateData.platesPaid);
    }
    
    if (appliedToMonthly > 0) {
      updateData.remainingBalance = Math.max(0, (freshClient.remainingBalance || freshClient.totalBalance || 0) - appliedToMonthly);
    }

    if (updateData.scheduledPayments) {
      const allPaid = updateData.scheduledPayments.every(sp => sp.remainingAmount <= 0);
      if (allPaid) updateData.status = 'paid';
    }

    await updateDoc(doc(db, 'payments', paymentData.id), { distribution: paymentDistribution });
    console.log('✅ Distribución guardada');

    updateData.updatedAt = new Date();
    await updateDoc(doc(db, 'clients', freshClient.id), updateData);
    console.log('✅ Cliente actualizado\n');
  };

  const handleDeletePayment = async (paymentId) => {
    try {
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return;

      if (!confirm(`¿Estás seguro de eliminar este pago de $${payment.amount.toLocaleString()}?`)) return;

      const clientRef = doc(db, 'clients', payment.clientId);
      const clientSnap = await getDoc(clientRef);
      if (!clientSnap.exists()) { alert('Cliente no encontrado'); return; }
      
      const client = { id: clientSnap.id, ...clientSnap.data() };
      await revertPayment(client, payment);
      await deleteDoc(doc(db, 'payments', paymentId));
      
      // ⬅️ NUEVO: Invalidar caché
      cacheService.invalidatePaymentCache();
      
      // ⬅️ MODIFICADO: Recargar con forceRefresh
      await loadClients(true);
      await loadPayments(true);

      if (selectedClient && selectedClient.id === client.id) {
        const updatedClientSnap = await getDoc(clientRef);
        if (updatedClientSnap.exists()) {
          setSelectedClient({ id: updatedClientSnap.id, ...updatedClientSnap.data() });
        }
      }
    } catch (error) {
      console.error('❌ Error eliminando pago:', error);
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
      
      // ⬅️ NUEVO: Invalidar caché
      cacheService.invalidatePaymentCache();
      
      // ⬅️ MODIFICADO: Recargar con forceRefresh
      await loadClients(true);
      
      if (selectedClient && selectedClient.id === clientId) {
        const clientRef = doc(db, 'clients', clientId);
        const clientSnap = await getDoc(clientRef);
        if (clientSnap.exists()) {
          setSelectedClient({ id: clientSnap.id, ...clientSnap.data() });
        }
      }
    } catch (error) {
      console.error('❌ Error actualizando cliente:', error);
      alert('Error al actualizar el cliente');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'payments', label: 'Pagos', icon: DollarSign },
    { id: 'inventory', label: 'Inventario', icon: Car },
    { id: 'leads', label: 'Leads', icon: MessageSquare }
  ];

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
    <AdminLayout
      currentView={currentView}
      setCurrentView={setCurrentView}
      navItems={navItems}
      onNewClient={() => {
        setEditingClient(null);
        setShowClientForm(true);
      }}
      onSettings={() => setShowSettings(true)}
      onLogout={logout}
    >
      {currentView === 'dashboard' && (
        <Dashboard clients={clients} payments={payments} />
      )}
      
      {currentView === 'clients' && (
        <ClientList
          clients={clients}
          onAdd={() => setShowClientForm(true)}
          onEdit={handleEditClient}
          onDelete={handleDeleteClient}
          onViewDetail={handleViewDetail}
          onAddPayment={handleAddPayment}
        />
      )}
      
      {currentView === 'payments' && (
        <PaymentHistory payments={payments} onEdit={handleEditPayment} onDelete={handleDeletePayment} />
      )}

      {currentView === 'inventory' && (
        <InventoryList />
      )}

      {currentView === 'leads' && (
        <LeadsPage />
      )}
    </AdminLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="inventory/:id" element={<VehicleDetailPage />} />
              <Route path="financing" element={<FinancingPage />} />
              <Route path="contact" element={<ContactPage />} />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminApp />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;