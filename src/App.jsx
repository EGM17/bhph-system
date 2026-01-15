import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { LanguageProvider } from './context/LanguageContext'; // 🆕 NUEVO

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
import TranslationsPage from './components/TranslationsPage'; // 🆕 NUEVO

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

// Importar servicios con caché
import { cacheService } from './services/cacheService';
import { getAllClients } from './services/clientService';
import { getAllPayments, deleteAllClientPayments } from './services/paymentService';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

// Admin App Component (sin cambios en lógica)
function AdminApp() {
  const { logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showClientForm, setShowClientForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTranslations, setShowTranslations] = useState(false); // 🆕 NUEVO
  const [editingClient, setEditingClient] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedScheduledPayment, setSelectedScheduledPayment] = useState(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'payments', label: 'Pagos', icon: DollarSign },
    { id: 'inventory', label: 'Inventario', icon: Car },
    { id: 'leads', label: 'Leads', icon: MessageSquare }
  ];

  // 🆕 NUEVO: Agregar botón de traducciones en AdminLayout
  const handleTranslations = () => setShowTranslations(true);

  useEffect(() => {
    loadClients();
    loadPayments();
  }, []);

  const loadClients = async () => {
    try {
      const cachedClients = cacheService.getClientsList();
      if (cachedClients) {
        setClients(cachedClients);
        setLoading(false);
        return;
      }

      const clientsData = await getAllClients();
      setClients(clientsData);
      cacheService.setClientsList(clientsData);
    } catch (error) {
      console.error('Error cargando clientes:', error);
      alert('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      const cachedPayments = cacheService.getPaymentsList();
      if (cachedPayments) {
        setPayments(cachedPayments);
        return;
      }

      const paymentsData = await getAllPayments();
      setPayments(paymentsData);
      cacheService.setPaymentsList(paymentsData);
    } catch (error) {
      console.error('Error cargando pagos:', error);
    }
  };

  const handleSaveClient = async (clientData) => {
    try {
      if (editingClient) {
        await updateDoc(doc(db, 'clients', editingClient.id), clientData);
      } else {
        await addDoc(collection(db, 'clients'), {
          ...clientData,
          createdAt: new Date()
        });
      }

      cacheService.clearClientsList();
      await loadClients();
      setShowClientForm(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Error guardando cliente:', error);
      alert('Error al guardar el cliente');
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente y todos sus pagos?')) {
      return;
    }

    try {
      await deleteAllClientPayments(clientId);
      await deleteDoc(doc(db, 'clients', clientId));

      cacheService.clearClientsList();
      cacheService.clearPaymentsList();
      
      await loadClients();
      await loadPayments();
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      alert('Error al eliminar el cliente');
    }
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowClientForm(true);
  };

  const handleViewDetail = (client) => {
    setSelectedClient(client);
  };

  const handleAddPayment = (client, scheduledPayment = null) => {
    setSelectedClient(client);
    setSelectedScheduledPayment(scheduledPayment);
    setShowPaymentForm(true);
  };

  const handleSavePayment = async (paymentData) => {
    try {
      const clientRef = doc(db, 'clients', paymentData.clientId);
      const clientSnap = await getDoc(clientRef);
      
      if (!clientSnap.exists()) {
        throw new Error('Cliente no encontrado');
      }

      const client = { id: clientSnap.id, ...clientSnap.data() };

      if (editingPayment) {
        await updateDoc(doc(db, 'payments', editingPayment.id), paymentData);
      } else {
        await addDoc(collection(db, 'payments'), {
          ...paymentData,
          createdAt: new Date()
        });
      }

      await applyPaymentToClient(client, paymentData);

      cacheService.clearPaymentsList();
      cacheService.clearClientsList();
      
      await loadClients();
      await loadPayments();

      const updatedClientSnap = await getDoc(clientRef);
      const updatedClient = { id: updatedClientSnap.id, ...updatedClientSnap.data() };

      setShowPaymentForm(false);
      setEditingPayment(null);
      setSelectedScheduledPayment(null);

      if (selectedClient && selectedClient.id === updatedClient.id) {
        setSelectedClient(updatedClient);
      }
    } catch (error) {
      console.error('Error guardando pago:', error);
      alert('Error al guardar el pago: ' + error.message);
    }
  };

  const applyPaymentToClient = async (client, payment) => {
    const clientRef = doc(db, 'clients', client.id);
    let remainingAmount = payment.amount;
    const updatedScheduledPayments = [...(client.scheduledPayments || [])];

    for (let i = 0; i < updatedScheduledPayments.length; i++) {
      if (remainingAmount <= 0) break;
      
      const sp = updatedScheduledPayments[i];
      if (sp.status === 'paid' || sp.remainingAmount <= 0) continue;

      if (remainingAmount >= sp.remainingAmount) {
        remainingAmount -= sp.remainingAmount;
        updatedScheduledPayments[i] = {
          ...sp,
          status: 'paid',
          remainingAmount: 0,
          paidAmount: sp.amount,
          paidDate: payment.paymentDate
        };
      } else {
        updatedScheduledPayments[i] = {
          ...sp,
          remainingAmount: sp.remainingAmount - remainingAmount,
          paidAmount: (sp.paidAmount || 0) + remainingAmount
        };
        remainingAmount = 0;
      }
    }

    const totalPaid = updatedScheduledPayments.reduce(
      (sum, sp) => sum + (sp.paidAmount || 0), 0
    );
    const newBalance = (client.totalBalance || 0) - totalPaid;

    await updateDoc(clientRef, {
      scheduledPayments: updatedScheduledPayments,
      remainingBalance: newBalance > 0 ? newBalance : 0,
      status: newBalance <= 0 ? 'paid' : client.status
    });
  };

  const revertPayment = async (client, payment) => {
    const clientRef = doc(db, 'clients', client.id);
    const paymentAmount = payment.amount;
    let remainingToRevert = paymentAmount;

    const updatedScheduledPayments = [...(client.scheduledPayments || [])];

    for (let i = updatedScheduledPayments.length - 1; i >= 0; i--) {
      if (remainingToRevert <= 0) break;

      const sp = updatedScheduledPayments[i];
      const amountPaidInThisSP = sp.paidAmount || 0;

      if (amountPaidInThisSP > 0) {
        const amountToRevert = Math.min(remainingToRevert, amountPaidInThisSP);
        
        updatedScheduledPayments[i] = {
          ...sp,
          paidAmount: sp.paidAmount - amountToRevert,
          remainingAmount: sp.remainingAmount + amountToRevert,
          status: (sp.remainingAmount + amountToRevert >= sp.amount) ? 'pending' : sp.status,
          paidDate: (sp.paidAmount - amountToRevert <= 0) ? null : sp.paidDate
        };

        remainingToRevert -= amountToRevert;
      }
    }

    const totalPaid = updatedScheduledPayments.reduce(
      (sum, sp) => sum + (sp.paidAmount || 0), 0
    );
    const newBalance = (client.totalBalance || 0) - totalPaid;

    await updateDoc(clientRef, {
      scheduledPayments: updatedScheduledPayments,
      remainingBalance: newBalance,
      status: newBalance > 0 ? 'active' : client.status
    });
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('¿Estás seguro de eliminar este pago?')) {
      return;
    }

    try {
      const paymentDoc = await getDoc(doc(db, 'payments', paymentId));
      if (!paymentDoc.exists()) {
        throw new Error('Pago no encontrado');
      }

      const payment = { id: paymentDoc.id, ...paymentDoc.data() };
      
      const clientDoc = await getDoc(doc(db, 'clients', payment.clientId));
      if (!clientDoc.exists()) {
        throw new Error('Cliente no encontrado');
      }

      const client = { id: clientDoc.id, ...clientDoc.data() };

      await revertPayment(client, payment);
      await deleteDoc(doc(db, 'payments', paymentId));
      await loadClients();
      await loadPayments();

      if (selectedClient && selectedClient.id === client.id) {
        const updatedClient = await getDoc(doc(db, 'clients', client.id));
        setSelectedClient({ id: updatedClient.id, ...updatedClient.data() });
      }
    } catch (error) {
      console.error('Error eliminando pago:', error);
      alert('Error al eliminar el pago: ' + error.message);
    }
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setShowPaymentForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  if (showTranslations) {
    return <TranslationsPage onClose={() => setShowTranslations(false)} />; // 🆕 NUEVO
  }

  if (selectedClient) {
    return (
      <ClientDetailPage
        client={selectedClient}
        payments={payments.filter(p => p.clientId === selectedClient.id)}
        onBack={() => setSelectedClient(null)}
        onEdit={handleEditClient}
        onAddPayment={handleAddPayment}
        onEditPayment={handleEditPayment}
        onDeletePayment={handleDeletePayment}
      />
    );
  }

  if (showClientForm) {
    return (
      <>
        <ClientFormPage
          client={editingClient}
          onSave={handleSaveClient}
          onCancel={() => {
            setShowClientForm(false);
            setEditingClient(null);
          }}
        />
      </>
    );
  }

  if (showPaymentForm) {
    return (
      <>
        <PaymentForm
          client={selectedClient}
          scheduledPayment={selectedScheduledPayment}
          payment={editingPayment}
          onSave={handleSavePayment}
          onCancel={() => {
            setShowPaymentForm(false);
            setEditingPayment(null);
            setSelectedScheduledPayment(null);
          }}
        />
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
      onTranslations={handleTranslations} // 🆕 NUEVO
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
          <LanguageProvider> {/* 🆕 NUEVO: Wrapeamos con LanguageProvider */}
            <Routes>
              {/* 🆕 NUEVO: Redirect / a /es */}
              <Route path="/" element={<Navigate to="/es" replace />} />
              
              {/* 🆕 NUEVO: Rutas públicas en español */}
              <Route path="/es" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="inventario" element={<InventoryPage />} />
                <Route path="inventario/:id" element={<VehicleDetailPage />} />
                <Route path="financiamiento" element={<FinancingPage />} />
                <Route path="contacto" element={<ContactPage />} />
              </Route>

              {/* 🆕 NUEVO: Rutas públicas en inglés */}
              <Route path="/en" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="inventory/:id" element={<VehicleDetailPage />} />
                <Route path="financing" element={<FinancingPage />} />
                <Route path="contact" element={<ContactPage />} />
              </Route>

              {/* Admin routes (sin cambios) */}
              <Route path="/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminApp />
                  </ProtectedRoute>
                }
              />

              {/* Redirect cualquier otra ruta a /es */}
              <Route path="*" element={<Navigate to="/es" replace />} />
            </Routes>
          </LanguageProvider>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;