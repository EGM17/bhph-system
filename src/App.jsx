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
    console.log('\n🔙 ===== INICIANDO REVERSIÓN DE PAGO =====');
    console.log('Tipo de pago:', payment.paymentType);
    console.log('Monto:', payment.amount);
    console.log('ID del pago:', payment.id);
    console.log('Distribución guardada:', payment.distribution);
    
    const updateData = {};
    
    let revertedFromDownpayment = 0;
    let revertedFromPlates = 0;
    let revertedFromMonthly = 0;

    if (client.scheduledPayments) {
      const updatedScheduledPayments = client.scheduledPayments.map(sp => {
        const hasPaymentInArray = sp.payments && sp.payments.includes(payment.id);
        const matchesId = sp.id === payment.appliedToScheduledPayment;
        
        if (hasPaymentInArray || matchesId) {
          let amountToRevert = 0;
          
          // 🆕 USAR LA DISTRIBUCIÓN SI EXISTE
          if (payment.distribution && Array.isArray(payment.distribution)) {
            const distributionItem = payment.distribution.find(d => d.scheduledPaymentId === sp.id);
            if (distributionItem) {
              amountToRevert = distributionItem.amount;
              console.log(`📊 Usando distribución guardada: $${amountToRevert} para ${sp.concept}`);
            }
          }
          
          // Fallback si no hay distribución
          if (amountToRevert === 0) {
            if (hasPaymentInArray) {
              if (sp.payments.length === 1 && sp.payments[0] === payment.id) {
                amountToRevert = Math.min(payment.amount, sp.paidAmount || 0);
              } else {
                amountToRevert = Math.min(payment.amount, sp.paidAmount || 0);
              }
            } else if (matchesId) {
              amountToRevert = Math.min(payment.amount, sp.paidAmount || 0);
            }
          }
          
          const newPaidAmount = Math.max(0, (sp.paidAmount || 0) - amountToRevert);
          const newRemainingAmount = sp.amount - newPaidAmount;
          
          console.log(`📅 Revirtiendo ${sp.concept}: $${sp.paidAmount} -> $${newPaidAmount}`);
          
          if (sp.type === 'downpayment') revertedFromDownpayment += amountToRevert;
          else if (sp.type === 'plates') revertedFromPlates += amountToRevert;
          else if (sp.type === 'monthly') revertedFromMonthly += amountToRevert;
          
          return {
            ...sp,
            paidAmount: newPaidAmount,
            remainingAmount: newRemainingAmount,
            payments: (sp.payments || []).filter(pid => pid !== payment.id),
            status: calculatePaymentStatus({ ...sp, paidAmount: newPaidAmount, remainingAmount: newRemainingAmount })
          };
        }
        return sp;
      });
      
      updateData.scheduledPayments = updatedScheduledPayments;
    }

    console.log(`\n💰 Revertidos: Enganche $${revertedFromDownpayment}, Placas $${revertedFromPlates}, Mensual $${revertedFromMonthly}`);

    if (revertedFromDownpayment > 0) {
      updateData.downPaymentPaid = Math.max(0, (client.downPaymentPaid || 0) - revertedFromDownpayment);
      updateData.downPaymentPending = (client.downPayment || 0) - updateData.downPaymentPaid;
    }
    
    if (revertedFromPlates > 0) {
      updateData.platesPaid = Math.max(0, (client.platesPaid || 0) - revertedFromPlates);
      updateData.platesPending = (client.platesAmount || 0) - updateData.platesPaid;
    }
    
    if (revertedFromMonthly > 0) {
      updateData.remainingBalance = (client.remainingBalance || client.totalBalance || 0) + revertedFromMonthly;
    }

    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date();
      await updateDoc(doc(db, 'clients', client.id), updateData);
      console.log('✅ Cliente actualizado');
    }
    
    console.log('🎉 REVERSIÓN COMPLETADA\n');
  };

  const applyPaymentToClient = async (client, paymentData) => {
    console.log('\n💰 ===== APLICANDO PAGO =====');
    console.log(`Tipo: ${paymentData.paymentType}, Monto: $${paymentData.amount}`);
    
    const updateData = {};
    const clientRef = doc(db, 'clients', client.id);
    const clientSnap = await getDoc(clientRef);
    const freshClient = { id: clientSnap.id, ...clientSnap.data() };
    
    let appliedToDownpayment = 0;
    let appliedToPlates = 0;
    let appliedToMonthly = 0;
    const paymentDistribution = [];

    if (paymentData.appliedToScheduledPayment) {
      const updatedScheduledPayments = [...(freshClient.scheduledPayments || [])];
      const targetPayment = updatedScheduledPayments.find(sp => sp.id === paymentData.appliedToScheduledPayment);
      
      if (targetPayment) {
        const newPaidAmount = (targetPayment.paidAmount || 0) + paymentData.amount;
        const newRemainingAmount = Math.max(0, targetPayment.amount - newPaidAmount);
        
        targetPayment.paidAmount = newPaidAmount;
        targetPayment.remainingAmount = newRemainingAmount;
        
        if (!targetPayment.payments) targetPayment.payments = [];
        if (!targetPayment.payments.includes(paymentData.id)) {
          targetPayment.payments.push(paymentData.id);
        }
        
        targetPayment.status = calculatePaymentStatus(targetPayment);
        
        if (targetPayment.type === 'downpayment') appliedToDownpayment = paymentData.amount;
        else if (targetPayment.type === 'plates') appliedToPlates = paymentData.amount;
        else if (targetPayment.type === 'monthly') appliedToMonthly = paymentData.amount;
        
        paymentDistribution.push({
          scheduledPaymentId: targetPayment.id,
          type: targetPayment.type,
          amount: paymentData.amount
        });
        
        updateData.scheduledPayments = updatedScheduledPayments;
      }
    } else {
      const updatedScheduledPayments = [...(freshClient.scheduledPayments || [])];
      let remainingAmount = paymentData.amount;
      
      let targetPayments = [];
      if (paymentData.paymentType === 'downpayment') {
        targetPayments = updatedScheduledPayments
          .filter(sp => sp.type === 'downpayment' && sp.remainingAmount > 0)
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      } else if (paymentData.paymentType === 'plates') {
        targetPayments = updatedScheduledPayments
          .filter(sp => sp.type === 'plates' && sp.remainingAmount > 0)
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      } else if (paymentData.paymentType === 'monthly') {
        targetPayments = updatedScheduledPayments
          .filter(sp => sp.type === 'monthly' && sp.remainingAmount > 0)
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      }
      
      for (const sp of targetPayments) {
        if (remainingAmount <= 0) break;
        
        const amountToApply = Math.min(remainingAmount, sp.remainingAmount);
        sp.paidAmount = (sp.paidAmount || 0) + amountToApply;
        sp.remainingAmount = sp.amount - sp.paidAmount;
        
        if (!sp.payments) sp.payments = [];
        if (!sp.payments.includes(paymentData.id)) sp.payments.push(paymentData.id);
        
        sp.status = calculatePaymentStatus(sp);
        
        if (sp.type === 'downpayment') appliedToDownpayment += amountToApply;
        else if (sp.type === 'plates') appliedToPlates += amountToApply;
        else if (sp.type === 'monthly') appliedToMonthly += amountToApply;
        
        paymentDistribution.push({
          scheduledPaymentId: sp.id,
          type: sp.type,
          amount: amountToApply
        });
        
        remainingAmount -= amountToApply;
      }
      
      if (remainingAmount > 0) {
        const nextPayments = updatedScheduledPayments
          .filter(sp => sp.remainingAmount > 0 && !targetPayments.includes(sp))
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        
        for (const sp of nextPayments) {
          if (remainingAmount <= 0) break;
          
          const toApply = Math.min(remainingAmount, sp.remainingAmount);
          sp.paidAmount = (sp.paidAmount || 0) + toApply;
          sp.remainingAmount = sp.amount - sp.paidAmount;
          
          if (!sp.payments) sp.payments = [];
          if (!sp.payments.includes(paymentData.id)) sp.payments.push(paymentData.id);
          
          sp.status = calculatePaymentStatus(sp);
          
          if (sp.type === 'downpayment') appliedToDownpayment += toApply;
          else if (sp.type === 'plates') appliedToPlates += toApply;
          else if (sp.type === 'monthly') appliedToMonthly += toApply;
          
          paymentDistribution.push({
            scheduledPaymentId: sp.id,
            type: sp.type,
            amount: toApply
          });
          
          remainingAmount -= toApply;
        }
      }
      
      updateData.scheduledPayments = updatedScheduledPayments;
    }

    console.log(`💰 Aplicados: Enganche $${appliedToDownpayment}, Placas $${appliedToPlates}, Mensual $${appliedToMonthly}`);

    if (appliedToDownpayment > 0) {
      updateData.downPaymentPaid = (freshClient.downPaymentPaid || 0) + appliedToDownpayment;
      updateData.downPaymentPending = Math.max(0, (freshClient.downPayment || 0) - updateData.downPaymentPaid);
    }
    
    if (appliedToPlates > 0) {
      updateData.platesPaid = (freshClient.platesPaid || 0) + appliedToPlates;
      updateData.platesPending = Math.max(0, (freshClient.platesAmount || 0) - updateData.platesPaid);
    }
    
    if (appliedToMonthly > 0) {
      updateData.remainingBalance = Math.max(0, (freshClient.remainingBalance || freshClient.totalBalance || 0) - appliedToMonthly);
    }

    if (updateData.scheduledPayments) {
      const allPaid = updateData.scheduledPayments.every(sp => sp.remainingAmount <= 0);
      if (allPaid) updateData.status = 'paid';
    }

    // 🆕 GUARDAR DISTRIBUCIÓN
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
      await loadClients();
      await loadPayments();

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