import { useState } from 'react';
import { Search } from 'lucide-react';

export default function PaymentHistory({ payments, clients }) {
  const [search, setSearch] = useState('');

  const filteredPayments = payments.filter(payment => 
    payment.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    payment.vinNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const methodLabels = {
    cash: 'Efectivo',
    check: 'Cheque',
    card: 'Tarjeta',
    transfer: 'Transferencia'
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Historial de Pagos</h2>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente o VIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">VIN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No hay pagos registrados aún
                  </td>
                </tr>
              ) : (
                filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {new Date(payment.paymentDate).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {payment.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.vinNumber}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">
                      ${(payment.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {methodLabels[payment.paymentMethod] || payment.paymentMethod}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
