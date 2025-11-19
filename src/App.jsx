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
  query,
  orderBy 
} from 'firebase/firestore';

import { generateScheduledPayments, applyPaymentToScheduled, calculatePaymentStatus } from './utils/paymentScheduler';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
}

function AdminApp() {
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
        const oldPayment = payments.find(p => p.id === editingPayment.id);
        const client = clients.find(c => c.id === selectedClient.id);
        
        const updateData = {
          updatedAt: new Date()
        };

        if (oldPayment.paymentType === 'monthly') {
          updateData.remainingBalance = (client.remainingBalance || 0) + oldPayment.amount;
        } else if (oldPayment.paymentType === 'downpayment') {
          updateData.downPaymentPaid = Math.max(0, (client.downPaymentPaid || 0) - oldPayment.amount);
          updateData.downPaymentPending = (client.downPayment || 0) - updateData.downPaymentPaid;
        } else if (oldPayment.paymentType === 'plates') {
          updateData.platesPaid = Math.max(0, (client.platesPaid || 0) - oldPayment.amount);
          updateData.platesPending = (client.platesAmount || 0) - updateData.platesPaid;
        }

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

        await updateDoc(doc(db, 'payments', editingPayment.id), {
          ...paymentData,
          updatedAt: new Date()
        });

        if (paymentData.paymentType === 'monthly') {
          updateData.remainingBalance = Math.max(0, updateData.remainingBalance - paymentData.amount);
          updateData.status = updateData.remainingBalance <= 0 ? 'paid' : client.status;
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
          onEdit={handleEditClient}
          onDelete={handleDeleteClient}
          onViewDetail={handleViewDetail}
        />
      )}
      
      {currentView === 'payments' && (
        <PaymentHistory payments={payments} clients={clients} />
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

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="vehicle/:id" element={<VehicleDetailPage />} />
              <Route path="financing" element={<FinancingPage />} />
              <Route path="contact" element={<ContactPage />} />
            </Route>

            {/* Rutas de Admin */}
            <Route path="/admin/login" element={<Login />} />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute>
                  <AdminApp />
                </ProtectedRoute>
              } 
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  );
}