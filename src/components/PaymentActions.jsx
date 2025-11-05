import { Trash2, Edit2 } from 'lucide-react';

export default function PaymentActions({ payment, onEdit, onDelete }) {
  const handleDelete = () => {
    if (confirm(`¿Estás seguro de eliminar este pago de $${payment.amount.toLocaleString()}?`)) {
      onDelete(payment.id);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onEdit(payment)}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
        title="Editar pago"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      <button
        onClick={handleDelete}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
        title="Eliminar pago"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
