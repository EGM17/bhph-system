import { Users, TrendingUp, CheckCircle, Clock, AlertCircle, DollarSign, Calendar, TrendingDown, Award } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function Dashboard({ clients, payments }) {
  const { formatCurrency, formatDate } = useSettings();
  
  // Calcular pagos atrasados por cliente
  const calculateOverduePayments = (client) => {
    if (!client.scheduledPayments) return { count: 0, amount: 0, days: 0 };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overduePayments = client.scheduledPayments.filter(sp => {
      if (sp.status === 'paid' || sp.remainingAmount <= 0) return false;
      const [year, month, day] = sp.dueDate.split('-').map(Number);
      const dueDate = new Date(year, month - 1, day);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    });
    
    const count = overduePayments.length;
    const amount = overduePayments.reduce((sum, p) => sum + p.remainingAmount, 0);
    
    // Calcular días del pago más antiguo
    const days = overduePayments.length > 0 
      ? Math.max(...overduePayments.map(p => {
          const [year, month, day] = p.dueDate.split('-').map(Number);
          const dueDate = new Date(year, month - 1, day);
          return Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
        }))
      : 0;
    
    return { count, amount, days };
  };

  // Métricas básicas
  const activeClients = clients.filter(c => c.status === 'active');
  const totalFinanced = clients.reduce((sum, c) => sum + (c.totalBalance || 0), 0);
  const totalPending = clients.reduce((sum, c) => sum + (c.remainingBalance || 0), 0);
  
  // Pagos del mes actual
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthPayments = payments.filter(p => {
    const paymentDate = new Date(p.paymentDate);
    return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
  });
  const totalCollected = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Métricas de morosidad
  const clientsWithOverdue = clients.map(client => ({
    ...client,
    overdue: calculateOverduePayments(client)
  })).filter(c => c.overdue.count > 0);

  const overdueStats = {
    totalClients: clientsWithOverdue.length,
    totalPayments: clientsWithOverdue.reduce((sum, c) => sum + c.overdue.count, 0),
    totalAmount: clientsWithOverdue.reduce((sum, c) => sum + c.overdue.amount, 0),
    avgDays: clientsWithOverdue.length > 0 
      ? Math.round(clientsWithOverdue.reduce((sum, c) => sum + c.overdue.days, 0) / clientsWithOverdue.length)
      : 0
  };

  // Clasificación por gravedad
  const severeOverdue = clientsWithOverdue.filter(c => c.overdue.count >= 3 || c.overdue.days >= 90);
  const moderateOverdue = clientsWithOverdue.filter(c => 
    (c.overdue.count === 2 || (c.overdue.days >= 30 && c.overdue.days < 90)) && 
    !severeOverdue.includes(c)
  );
  const mildOverdue = clientsWithOverdue.filter(c => 
    !severeOverdue.includes(c) && !moderateOverdue.includes(c)
  );

  // Métricas de enganche y placas
  const pendingDownPayments = clients.filter(c => 
    ((c.downPayment || 0) - (c.downPaymentPaid || 0)) > 0
  );
  const pendingPlates = clients.filter(c => 
    ((c.platesAmount || 0) - (c.platesPaid || 0)) > 0
  );

  const downPaymentStats = {
    count: pendingDownPayments.length,
    amount: pendingDownPayments.reduce((sum, c) => 
      sum + ((c.downPayment || 0) - (c.downPaymentPaid || 0)), 0
    )
  };

  const platesStats = {
    count: pendingPlates.length,
    amount: pendingPlates.reduce((sum, c) => 
      sum + ((c.platesAmount || 0) - (c.platesPaid || 0)), 0
    )
  };

  // Próximos vencimientos (7 días)
  const upcomingPayments = clients.flatMap(client => {
    if (!client.scheduledPayments) return [];
    
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return client.scheduledPayments
      .filter(sp => {
        if (sp.status === 'paid' || sp.remainingAmount <= 0) return false;
        const [year, month, day] = sp.dueDate.split('-').map(Number);
        const dueDate = new Date(year, month - 1, day);
        return dueDate >= today && dueDate <= nextWeek;
      })
      .map(sp => ({
        ...sp,
        clientName: client.customerName,
        clientId: client.id
      }));
  });

  const upcomingStats = {
    count: upcomingPayments.length,
    amount: upcomingPayments.reduce((sum, p) => sum + p.remainingAmount, 0)
  };

  // Tasa de pago mensual esperada vs real
  const expectedMonthly = clients
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + (c.monthlyPayment || 0), 0);
  
  const collectionRate = expectedMonthly > 0 
    ? ((totalCollected / expectedMonthly) * 100).toFixed(1)
    : 0;

  // Mejor cliente del mes
  const bestClientThisMonth = monthPayments.length > 0
    ? Object.entries(
        monthPayments.reduce((acc, p) => {
          acc[p.customerName] = (acc[p.customerName] || 0) + p.amount;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0]
    : null;

  const stats = [
    {
      title: 'Clientes Activos',
      value: activeClients.length,
      subtitle: `de ${clients.length} total`,
      icon: Users,
      color: 'bg-blue-500',
      trend: null
    },
    {
      title: 'Cobrado Este Mes',
      value: formatCurrency(totalCollected),
      subtitle: `${collectionRate}% del esperado`,
      icon: CheckCircle,
      color: collectionRate >= 80 ? 'bg-green-500' : collectionRate >= 60 ? 'bg-yellow-500' : 'bg-red-500',
      trend: collectionRate >= 80 ? 'up' : collectionRate >= 60 ? 'stable' : 'down'
    },
    {
      title: 'Cartera Total',
      value: formatCurrency(totalFinanced),
      subtitle: `${formatCurrency(totalPending)} pendiente`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      trend: null
    },
    {
      title: 'Próximos 7 Días',
      value: upcomingStats.count,
      subtitle: formatCurrency(upcomingStats.amount),
      icon: Calendar,
      color: 'bg-orange-500',
      trend: null
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
      
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                )}
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            {stat.trend && (
              <div className="mt-2 flex items-center gap-1">
                {stat.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                {stat.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
                <span className={`text-xs font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 
                  stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.trend === 'up' ? 'Buen desempeño' : 
                   stat.trend === 'down' ? 'Necesita atención' : 'Estable'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resumen de Morosidad */}
      {overdueStats.totalClients > 0 && (
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-lg p-6 border-2 border-red-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-900">Resumen de Morosidad</h3>
                <p className="text-sm text-red-700">Clientes con pagos atrasados</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-sm text-gray-600">Clientes Morosos</p>
              <p className="text-3xl font-bold text-red-600">{overdueStats.totalClients}</p>
              <p className="text-xs text-gray-500 mt-1">
                {((overdueStats.totalClients / clients.length) * 100).toFixed(1)}% del total
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-sm text-gray-600">Pagos Atrasados</p>
              <p className="text-3xl font-bold text-orange-600">{overdueStats.totalPayments}</p>
              <p className="text-xs text-gray-500 mt-1">En total</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-sm text-gray-600">Monto en Atraso</p>
              <p className="text-3xl font-bold text-purple-600">{formatCurrency(overdueStats.totalAmount)}</p>
              <p className="text-xs text-gray-500 mt-1">Total adeudado</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-sm text-gray-600">Días Promedio</p>
              <p className="text-3xl font-bold text-blue-600">{overdueStats.avgDays}</p>
              <p className="text-xs text-gray-500 mt-1">De atraso</p>
            </div>
          </div>

          {/* Clasificación por gravedad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-red-600 text-white rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Crítico</p>
                  <p className="text-2xl font-bold">{severeOverdue.length}</p>
                  <p className="text-xs opacity-75 mt-1">3+ pagos o 90+ días</p>
                </div>
                <AlertCircle className="w-8 h-8 opacity-75" />
              </div>
            </div>
            <div className="bg-orange-500 text-white rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Moderado</p>
                  <p className="text-2xl font-bold">{moderateOverdue.length}</p>
                  <p className="text-xs opacity-75 mt-1">2 pagos o 30-89 días</p>
                </div>
                <Clock className="w-8 h-8 opacity-75" />
              </div>
            </div>
            <div className="bg-yellow-500 text-white rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Leve</p>
                  <p className="text-2xl font-bold">{mildOverdue.length}</p>
                  <p className="text-xs opacity-75 mt-1">1 pago o &lt;30 días</p>
                </div>
                <AlertCircle className="w-8 h-8 opacity-75" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pendientes: Enganches y Placas */}
      {(downPaymentStats.count > 0 || platesStats.count > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {downPaymentStats.count > 0 && (
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow p-6 border-2 border-yellow-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-yellow-500 p-2 rounded-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-yellow-900">Enganches Pendientes</h3>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-yellow-700">{downPaymentStats.count}</p>
                  <p className="text-sm text-yellow-600 mt-1">clientes</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-800">{formatCurrency(downPaymentStats.amount)}</p>
                  <p className="text-sm text-yellow-600 mt-1">por cobrar</p>
                </div>
              </div>
            </div>
          )}

          {platesStats.count > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-900">Placas Pendientes</h3>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-blue-700">{platesStats.count}</p>
                  <p className="text-sm text-blue-600 mt-1">clientes</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-800">{formatCurrency(platesStats.amount)}</p>
                  <p className="text-sm text-blue-600 mt-1">por cobrar</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mejor cliente del mes */}
      {bestClientThisMonth && (
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-lg p-6 border-2 border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-500 p-3 rounded-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-900">Mejor Cliente del Mes</h3>
              <p className="text-sm text-green-700">Mayor monto pagado en {new Date().toLocaleDateString('es-ES', { month: 'long' })}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-800">{bestClientThisMonth[0]}</p>
              <p className="text-sm text-green-600 mt-1">Ha realizado {monthPayments.filter(p => p.customerName === bestClientThisMonth[0]).length} pagos</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-700">{formatCurrency(bestClientThisMonth[1])}</p>
              <p className="text-sm text-green-600 mt-1">pagado este mes</p>
            </div>
          </div>
        </div>
      )}

      {/* Sin problemas */}
      {overdueStats.totalClients === 0 && (
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-lg p-8 border-2 border-green-200 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-900 mb-2">¡Excelente!</h3>
          <p className="text-green-700">
            No hay clientes con pagos atrasados. Todos los clientes están al día con sus pagos.
          </p>
        </div>
      )}
    </div>
  );
}