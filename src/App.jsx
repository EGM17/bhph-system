import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async'; // 🆕 NUEVO
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { LanguageProvider } from './context/LanguageContext';

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
import TranslationsPage from './components/TranslationsPage';
import CategoryManager from './components/cms/CategoryManager';
import BlogManager from './components/cms/BlogManager';
import BlogEditor from './components/cms/BlogEditor'; // 🆕 NUEVO

// Public Components
import PublicLayout from './components/layouts/PublicLayout';
import HomePage from './pages/public/HomePage';
import InventoryPage from './pages/public/InventoryPage';
import VehicleDetailPage from './pages/public/VehicleDetailPage';
import FinancingPage from './pages/public/FinancingPage';
import ContactPage from './pages/public/ContactPage';
import BlogListPage from './pages/public/BlogListPage'; // 🆕 NUEVO
import BlogPostPage from './pages/public/BlogPostPage'; // 🆕 NUEVO

import { Home, Users, DollarSign, Car, MessageSquare, FileText } from 'lucide-react'; // 🔄 FileText agregado

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

// Admin Application Component
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
  const [showTranslations, setShowTranslations] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showBlogManager, setShowBlogManager] = useState(false);
  const [showBlogEditor, setShowBlogEditor] = useState(false); // 🆕 NUEVO
  const [editingPost, setEditingPost] = useState(null); // 🆕 NUEVO
  const [editingClient, setEditingClient] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedScheduledPayment, setSelectedScheduledPayment] = useState(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'payments', label: 'Pagos', icon: DollarSign },
    { id: 'inventory', label: 'Inventario', icon: Car },
    { id: 'leads', label: 'Leads', icon: MessageSquare },
    { id: 'blog', label: 'Blog', icon: FileText } // 🆕 NUEVO
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientsData, paymentsData] = await Promise.all([
        getAllClients(),
        getAllPayments()
      ]);
      setClients(clientsData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowClientForm(true);
  };

  const handleDeleteClient = async (clientId) => {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await deleteAllClientPayments(clientId);
        await deleteDoc(doc(db, 'clients', clientId));
        await loadData();
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Error al eliminar el cliente');
      }
    }
  };

  const handleViewDetail = (client) => {
    setSelectedClient(client);
    setShowClientDetail(true);
  };

  const handleAddPayment = (client, scheduledPayment = null) => {
    setSelectedClient(client);
    setSelectedScheduledPayment(scheduledPayment);
    setShowPaymentForm(true);
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setShowPaymentForm(true);
  };

  const handleDeletePayment = async (paymentId) => {
    if (confirm('¿Estás seguro de eliminar este pago?')) {
      try {
        await deleteDoc(doc(db, 'payments', paymentId));
        await loadData();
      } catch (error) {
        console.error('Error deleting payment:', error);
        alert('Error al eliminar el pago');
      }
    }
  };

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

  if (showTranslations) {
    return <TranslationsPage onClose={() => setShowTranslations(false)} />;
  }

  // 🆕 NUEVO - Gestión de categorías
  if (showCategoryManager) {
    return <CategoryManager onClose={() => setShowCategoryManager(false)} />;
  }

  // 🆕 NUEVO - Gestión de posts
  if (showBlogManager) {
    return (
      <BlogManager 
        onClose={() => setShowBlogManager(false)}
        onNew={() => {
          setEditingPost(null);
          setShowBlogManager(false);
          setShowBlogEditor(true);
        }}
        onEdit={(post) => {
          setEditingPost(post);
          setShowBlogManager(false);
          setShowBlogEditor(true);
        }}
        onView={(post) => {
          // Abrir vista previa en nueva pestaña
          const previewUrl = `/${post.language}/blog/${post.slug}`;
          window.open(previewUrl, '_blank');
        }}
      />
    );
  }

  // 🆕 NUEVO - Editor de posts
  if (showBlogEditor) {
    return (
      <BlogEditor 
        post={editingPost}
        onSave={() => {
          setShowBlogEditor(false);
          setEditingPost(null);
          setShowBlogManager(true);
        }}
        onCancel={() => {
          setShowBlogEditor(false);
          setEditingPost(null);
          setShowBlogManager(true);
        }}
      />
    );
  }

  if (showClientForm) {
    return (
      <ClientFormPage
        client={editingClient}
        onSave={async () => {
          await loadData();
          setShowClientForm(false);
          setEditingClient(null);
        }}
        onCancel={() => {
          setShowClientForm(false);
          setEditingClient(null);
        }}
      />
    );
  }

  if (showClientDetail && selectedClient) {
    return (
      <ClientDetailPage
        client={selectedClient}
        onClose={() => {
          setShowClientDetail(false);
          setSelectedClient(null);
        }}
        onEdit={handleEditClient}
        onAddPayment={handleAddPayment}
        onRefresh={loadData}
      />
    );
  }

  if (showPaymentForm) {
    return (
      <>
        {editingPayment ? (
          <PaymentForm
            payment={editingPayment}
            clients={clients}
            onSave={async () => {
              await loadData();
              setShowPaymentForm(false);
              setEditingPayment(null);
            }}
            onCancel={() => {
              setShowPaymentForm(false);
              setEditingPayment(null);
            }}
          />
        ) : (
          <PaymentForm
            client={selectedClient}
            scheduledPayment={selectedScheduledPayment}
            clients={clients}
            onSave={async () => {
              await loadData();
              setShowPaymentForm(false);
              setSelectedClient(null);
              setSelectedScheduledPayment(null);
            }}
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
      onTranslations={() => setShowTranslations(true)}
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

      {/* 🆕 NUEVO - Vista de Blog */}
      {currentView === 'blog' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Sistema de Blog
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona categorías y posts del blog
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setShowCategoryManager(true)}
              className="p-8 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition group"
            >
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto text-blue-600 mb-4 group-hover:scale-110 transition" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Categorías
                </h3>
                <p className="text-sm text-gray-600">
                  Gestiona las categorías del blog
                </p>
              </div>
            </button>

            <button
              onClick={() => setShowBlogManager(true)}
              className="p-8 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition group"
            >
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto text-green-600 mb-4 group-hover:scale-110 transition" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Posts del Blog
                </h3>
                <p className="text-sm text-gray-600">
                  Gestiona los posts del blog
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <SettingsProvider>
          <BrowserRouter>
            <LanguageProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/es" replace />} />
              
              <Route path="/es" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="inventario" element={<InventoryPage />} />
                <Route path="inventario/:id" element={<VehicleDetailPage />} />
                <Route path="financiamiento" element={<FinancingPage />} />
                <Route path="contacto" element={<ContactPage />} />
                <Route path="blog" element={<BlogListPage />} /> {/* 🆕 NUEVO */}
                <Route path="blog/:slug" element={<BlogPostPage />} /> {/* 🆕 NUEVO */}
              </Route>

              <Route path="/en" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="inventory/:id" element={<VehicleDetailPage />} />
                <Route path="financing" element={<FinancingPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="blog" element={<BlogListPage />} /> {/* 🆕 NUEVO */}
                <Route path="blog/:slug" element={<BlogPostPage />} /> {/* 🆕 NUEVO */}
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

              <Route path="*" element={<Navigate to="/es" replace />} />
            </Routes>
          </LanguageProvider>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
    </HelmetProvider>
  );
}

export default App;