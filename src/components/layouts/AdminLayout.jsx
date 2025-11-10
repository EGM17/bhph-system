import { LogOut, Settings, Plus } from 'lucide-react';

export default function AdminLayout({ 
  currentView, 
  setCurrentView, 
  navItems, 
  onNewClient, 
  onSettings, 
  onLogout,
  children 
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-blue-600">BHPH System</h1>
            
            <div className="flex items-center gap-4">
              <button
                onClick={onNewClient}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Plus className="w-4 h-4" />
                Nuevo Cliente
              </button>
              
              <button
                onClick={onSettings}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <button
                onClick={onLogout}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                  currentView === item.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}