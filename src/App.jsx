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

  useEffect(() => {
    loadClients();
    loadPayments();
  }, []);

  const loadClients = async () => {
    try {
      const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const clientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClients(clientsData);
    } catch (error) {
      console.error('❌ Error cargando clientes:', error);
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
      console.error('❌ Error guardando cliente:', error);
      alert('Error al guardar el cliente');
    }
  };

  const handleDeleteClient = async (id) => {
    if (confirm('¿Estás seguro de eliminar este cliente? También se eliminarán todos sus pagos.')) {
      try {
        await deleteDoc(doc(db, 'clients', id));
        
        const clientPayments = payments.filter(p => p.clientId === id);
        for (const payment of clientPayments) {
          await deleteDoc(doc(db, 'payments', payment.id));
        }
        
        await loadClients();
        await loadPayments();
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

      // PASO 3: Recargar datos
      console.log('\n🔄 PASO 3: Recargando datos');
      await loadClients();
      await loadPayments();

      // PASO 4: Actualizar selectedClient con datos frescos
      const updatedClientSnap = await getDoc(clientRef);
      if (updatedClientSnap.exists()) {
        const updatedClient = { id: updatedClientSnap.id, ...updatedClientSnap.data() };
        setSelectedClient(updatedClient);
        console.log('✅ Cliente actualizado en memoria');
      }

      setShowPaymentForm(false);
      setEditingPayment(null);
      setSelectedScheduledPayment(null);
      
      console.log('🎉 ===== PAGO GUARDADO EXITOSAMENTE =====\n');
    } catch (error) {
      console.error('❌ Error guardando pago:', error);
      alert('Error al guardar el pago: ' + error.message);
    }
  };

  const revertPayment = async (client, payment) => {
    const updateData = {};

    // Revertir balances según tipo
    if (payment.paymentType === 'monthly') {
      updateData.remainingBalance = (client.remainingBalance || client.totalBalance || 0) + payment.amount;
      console.log(`💵 Revirtiendo balance mensual: +$${payment.amount}`);
    } else if (payment.paymentType === 'downpayment') {
      updateData.downPaymentPaid = Math.max(0, (client.downPaymentPaid || 0) - payment.amount);
      updateData.downPaymentPending = (client.downPayment || 0) - updateData.downPaymentPaid;
      console.log(`💰 Revirtiendo enganche: -$${payment.amount}`);
    } else if (payment.paymentType === 'plates') {
      updateData.platesPaid = Math.max(0, (client.platesPaid || 0) - payment.amount);
      updateData.platesPending = (client.platesAmount || 0) - updateData.platesPaid;
      console.log(`🚗 Revirtiendo placas: -$${payment.amount}`);
    }

    // Revertir en scheduled payments
    if (payment.appliedToScheduledPayment && client.scheduledPayments) {
      const updatedScheduledPayments = client.scheduledPayments.map(sp => {
        if (sp.id === payment.appliedToScheduledPayment || 
            (sp.payments && sp.payments.includes(payment.id))) {
          const newPaidAmount = Math.max(0, (sp.paidAmount || 0) - payment.amount);
          const newRemainingAmount = sp.amount - newPaidAmount;
          console.log(`📅 Revirtiendo scheduled payment ${sp.concept}: $${sp.paidAmount} -> $${newPaidAmount}`);
          return {
            ...sp,
            paidAmount: newPaidAmount,
            remainingAmount: newRemainingAmount,
            payments: (sp.payments || []).filter(pid => pid !== payment.id),
            status: calculatePaymentStatus({
              ...sp,
              paidAmount: newPaidAmount,
              remainingAmount: newRemainingAmount
            })
          };
        }
        return sp;
      });
      updateData.scheduledPayments = updatedScheduledPayments;
    }

    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date();
      await updateDoc(doc(db, 'clients', client.id), updateData);
      console.log('✅ Cliente actualizado después de revertir');
    }
  };

  const applyPaymentToClient = async (client, paymentData) => {
    const updateData = {};

    // PAGO RÁPIDO: Distribución automática
    if (paymentData.isQuickPayment && paymentData.paymentType === 'monthly') {
      console.log('⚡ Aplicando pago rápido con distribución automática');
      let remainingAmount = paymentData.amount;
      const updatedScheduledPayments = [...(client.scheduledPayments || [])];

      // 1. Enganche
      const downpaymentPayments = updatedScheduledPayments
        .map((sp, idx) => ({ ...sp, originalIndex: idx }))
        .filter(sp => sp.type === 'downpayment' && sp.remainingAmount > 0)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      for (const sp of downpaymentPayments) {
        if (remainingAmount <= 0) break;
        const amountToApply = Math.min(remainingAmount, sp.remainingAmount);
        const newPaidAmount = (sp.paidAmount || 0) + amountToApply;
        const newRemainingAmount = sp.remainingAmount - amountToApply;
        
        updatedScheduledPayments[sp.originalIndex] = {
          ...sp,
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          payments: [...(sp.payments || []), paymentData.id],
          status: calculatePaymentStatus({
            ...sp,
            paidAmount: newPaidAmount,
            remainingAmount: newRemainingAmount
          })
        };
        
        remainingAmount -= amountToApply;
        updateData.downPaymentPaid = (client.downPaymentPaid || 0) + amountToApply;
        updateData.downPaymentPending = Math.max(0, (client.downPayment || 0) - updateData.downPaymentPaid);
        console.log(`💰 Aplicado $${amountToApply} a enganche`);
      }

      // 2. Placas
      const platesPayments = updatedScheduledPayments
        .map((sp, idx) => ({ ...sp, originalIndex: idx }))
        .filter(sp => sp.type === 'plates' && sp.remainingAmount > 0)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      for (const sp of platesPayments) {
        if (remainingAmount <= 0) break;
        const amountToApply = Math.min(remainingAmount, sp.remainingAmount);
        const newPaidAmount = (sp.paidAmount || 0) + amountToApply;
        const newRemainingAmount = sp.remainingAmount - amountToApply;
        
        updatedScheduledPayments[sp.originalIndex] = {
          ...sp,
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          payments: [...(sp.payments || []), paymentData.id],
          status: calculatePaymentStatus({
            ...sp,
            paidAmount: newPaidAmount,
            remainingAmount: newRemainingAmount
          })
        };
        
        remainingAmount -= amountToApply;
        updateData.platesPaid = (client.platesPaid || 0) + amountToApply;
        updateData.platesPending = Math.max(0, (client.platesAmount || 0) - updateData.platesPaid);
        console.log(`🚗 Aplicado $${amountToApply} a placas`);
      }

      // 3. Mensualidades
      const monthlyPayments = updatedScheduledPayments
        .map((sp, idx) => ({ ...sp, originalIndex: idx }))
        .filter(sp => sp.type === 'monthly' && sp.remainingAmount > 0)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      for (const sp of monthlyPayments) {
        if (remainingAmount <= 0) break;
        const amountToApply = Math.min(remainingAmount, sp.remainingAmount);
        const newPaidAmount = (sp.paidAmount || 0) + amountToApply;
        const newRemainingAmount = sp.remainingAmount - amountToApply;
        
        updatedScheduledPayments[sp.originalIndex] = {
          ...sp,
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          payments: [...(sp.payments || []), paymentData.id],
          status: calculatePaymentStatus({
            ...sp,
            paidAmount: newPaidAmount,
            remainingAmount: newRemainingAmount
          })
        };
        
        remainingAmount -= amountToApply;
        console.log(`💵 Aplicado $${amountToApply} a ${sp.concept}`);
      }

      updateData.scheduledPayments = updatedScheduledPayments;
      updateData.remainingBalance = Math.max(0, (client.remainingBalance || client.totalBalance || 0) - (paymentData.amount - remainingAmount));
      
      const allPaid = updatedScheduledPayments.every(sp => sp.status === 'paid');
      if (allPaid || updateData.remainingBalance === 0) {
        updateData.status = 'paid';
      }
      
      console.log(`✅ Distribución completada. Sobrante: $${remainingAmount}`);
    }
    // PAGO NORMAL con scheduled payment específico
    else if (paymentData.appliedToScheduledPayment && client.scheduledPayments) {
      console.log(`📌 Aplicando a pago programado: ${paymentData.appliedToScheduledPayment}`);
      
      const updatedScheduledPayments = client.scheduledPayments.map(sp => {
        if (sp.id === paymentData.appliedToScheduledPayment) {
          const newPaidAmount = (sp.paidAmount || 0) + paymentData.amount;
          const newRemainingAmount = sp.amount - newPaidAmount;
          console.log(`📅 ${sp.concept}: $${sp.paidAmount || 0} -> $${newPaidAmount}`);
          
          return {
            ...sp,
            paidAmount: newPaidAmount,
            remainingAmount: newRemainingAmount,
            payments: [...(sp.payments || []), paymentData.id],
            status: calculatePaymentStatus({
              ...sp,
              paidAmount: newPaidAmount,
              remainingAmount: newRemainingAmount
            })
          };
        }
        return sp;
      });
      
      updateData.scheduledPayments = updatedScheduledPayments;

      // Actualizar balances según tipo
      if (paymentData.paymentType === 'monthly') {
        const newRemainingBalance = Math.max(0, (client.remainingBalance || client.totalBalance || 0) - paymentData.amount);
        updateData.remainingBalance = newRemainingBalance;
        updateData.status = newRemainingBalance <= 0 ? 'paid' : client.status;
        console.log(`💵 Balance actualizado: $${newRemainingBalance}`);
      } else if (paymentData.paymentType === 'downpayment') {
        const newDownPaymentPaid = (client.downPaymentPaid || 0) + paymentData.amount;
        updateData.downPaymentPaid = newDownPaymentPaid;
        updateData.downPaymentPending = Math.max(0, (client.downPayment || 0) - newDownPaymentPaid);
        console.log(`💰 Enganche pagado: $${newDownPaymentPaid}`);
      } else if (paymentData.paymentType === 'plates') {
        const newPlatesPaid = (client.platesPaid || 0) + paymentData.amount;
        updateData.platesPaid = newPlatesPaid;
        updateData.platesPending = Math.max(0, (client.platesAmount || 0) - newPlatesPaid);
        console.log(`🚗 Placas pagadas: $${newPlatesPaid}`);
      }
    }
    // PAGO SIN SCHEDULED PAYMENT (caso legacy)
    else {
      console.log('📋 Pago sin scheduled payment específico');
      
      if (paymentData.paymentType === 'monthly') {
        const newRemainingBalance = Math.max(0, (client.remainingBalance || client.totalBalance || 0) - paymentData.amount);
        updateData.remainingBalance = newRemainingBalance;
        updateData.status = newRemainingBalance <= 0 ? 'paid' : client.status;
      } else if (paymentData.paymentType === 'downpayment') {
        const newDownPaymentPaid = (client.downPaymentPaid || 0) + paymentData.amount;
        updateData.downPaymentPaid = newDownPaymentPaid;
        updateData.downPaymentPending = Math.max(0, (client.downPayment || 0) - newDownPaymentPaid);
      } else if (paymentData.paymentType === 'plates') {
        const newPlatesPaid = (client.platesPaid || 0) + paymentData.amount;
        updateData.platesPaid = newPlatesPaid;
        updateData.platesPending = Math.max(0, (client.platesAmount || 0) - newPlatesPaid);
      }
    }

    updateData.updatedAt = new Date();
    console.log('💾 Actualizando cliente en Firebase...');
    await updateDoc(doc(db, 'clients', client.id), updateData);
    console.log('✅ Cliente actualizado exitosamente');
  };

  const handleDeletePayment = async (paymentId) => {
    try {
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return;

      if (!confirm(`¿Estás seguro de eliminar este pago de $${payment.amount.toLocaleString()}?`)) {
        return;
      }

      console.log('\n🗑️ ===== ELIMINANDO PAGO =====');
      console.log('📋 Pago a eliminar:', payment);

      // Obtener cliente fresco
      const clientRef = doc(db, 'clients', payment.clientId);
      const clientSnap = await getDoc(clientRef);
      
      if (!clientSnap.exists()) {
        alert('Cliente no encontrado');
        return;
      }
      
      const client = { id: clientSnap.id, ...clientSnap.data() };

      // Revertir el pago
      await revertPayment(client, payment);

      // Eliminar documento de pago
      await deleteDoc(doc(db, 'payments', paymentId));
      console.log('✅ Pago eliminado de Firebase');

      // Recargar datos
      await loadClients();
      await loadPayments();

      // Actualizar selectedClient si está abierto
      if (selectedClient && selectedClient.id === client.id) {
        const updatedClientSnap = await getDoc(clientRef);
        if (updatedClientSnap.exists()) {
          setSelectedClient({ id: updatedClientSnap.id, ...updatedClientSnap.data() });
        }
      }

      console.log('🎉 ===== PAGO ELIMINADO EXITOSAMENTE =====\n');
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
      await loadClients();
      
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