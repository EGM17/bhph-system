import { useState, useRef } from 'react';
import { FileText, Download, Eye, X } from 'lucide-react';
import RegistrationNotice from './RegistrationNotice';
import DocumentsPurchase from './DocumentsPurchase';
import { generatePDF, previewPDF } from '../../utils/pdfGenerator';

/**
 * Componente para generar contratos PDF desde el detalle del cliente
 */
export default function ContractGenerator({ client, onClose }) {
  const [selectedContract, setSelectedContract] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState([
    'residence',
    'income', 
    'references',
    'license',
    'insurance'
  ]); // Todos seleccionados por defecto
  const contractRef = useRef(null);

  // Lista de contratos disponibles
  const contracts = [
    {
      id: 'registration-notice',
      name: 'Registration Fee Notice',
      nameEs: 'Aviso de Costo de Registro',
      description: 'Notificación bilingüe sobre el costo del registro del vehículo',
      component: RegistrationNotice,
      hasOptions: false
    },
    {
      id: 'documents-purchase',
      name: 'Documents Required for Purchase',
      nameEs: 'Documentos Requeridos para Comprar',
      description: 'Lista de documentos requeridos con checkboxes personalizables',
      component: DocumentsPurchase,
      hasOptions: true
    }
  ];

  const toggleDoc = (docId) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleGeneratePDF = async (preview = false) => {
    if (!contractRef.current) return;

    setGenerating(true);

    try {
      const contractInfo = contracts.find(c => c.id === selectedContract);
      const filename = `${contractInfo.id}_${client.customerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

      if (preview) {
        await previewPDF(contractRef.current);
      } else {
        await generatePDF(contractRef.current, filename);
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor intenta de nuevo.');
    } finally {
      setGenerating(false);
    }
  };

  const ContractComponent = selectedContract 
    ? contracts.find(c => c.id === selectedContract)?.component 
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Generar Contratos
            </h3>
            <p className="text-purple-100 text-sm mt-1">{client.customerName}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-purple-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!selectedContract ? (
            // Lista de contratos disponibles
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Selecciona el contrato a generar:
              </h4>
              <div className="space-y-3">
                {contracts.map(contract => (
                  <button
                    key={contract.id}
                    onClick={() => setSelectedContract(contract.id)}
                    className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-800 group-hover:text-purple-700">
                          {contract.name}
                        </h5>
                        <p className="text-sm text-gray-600 mt-1">{contract.nameEs}</p>
                        <p className="text-xs text-gray-500 mt-2">{contract.description}</p>
                      </div>
                      <FileText className="w-8 h-8 text-gray-400 group-hover:text-purple-600 transition" />
                    </div>
                  </button>
                ))}
              </div>

              {contracts.length === 1 && (
                <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Tip:</strong> Se agregarán más contratos próximamente. 
                    Por ahora puedes generar el aviso de registro.
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Vista previa y controles
            <div>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setSelectedContract(null)}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                >
                  ← Volver a la lista
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGeneratePDF(true)}
                    disabled={generating}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    <Eye className="w-4 h-4" />
                    {generating ? 'Generando...' : 'Vista Previa'}
                  </button>
                  
                  <button
                    onClick={() => handleGeneratePDF(false)}
                    disabled={generating}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    {generating ? 'Descargando...' : 'Descargar PDF'}
                  </button>
                </div>
              </div>

              {/* Vista previa del contrato en miniatura */}
              <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 max-h-[500px] overflow-y-auto">
                <div className="transform scale-90 origin-top">
                  {ContractComponent && (
                    <ContractComponent 
                      ref={contractRef}
                      client={client}
                      date={new Date().toLocaleDateString('en-US')}
                      selectedDocs={selectedDocs}
                    />
                  )}
                </div>
              </div>

              {/* Selector de documentos para DocumentsPurchase */}
              {selectedContract === 'documents-purchase' && (
                <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    ✓ Selecciona los documentos requeridos:
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'residence', label: 'Proof of Residence / Comprobante de domicilio' },
                      { id: 'income', label: 'Proof of Income / Comprobante de Ingresos' },
                      { id: 'references', label: 'References / Referencias Solicitadas' },
                      { id: 'license', label: 'Driver License or ID / Licencia de Conducir o ID' },
                      { id: 'insurance', label: 'Proof of Full Coverage Insurance / Seguro de Cobertura Amplia' }
                    ].map(doc => (
                      <label key={doc.id} className="flex items-center gap-3 p-2 hover:bg-blue-100 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDocs.includes(doc.id)}
                          onChange={() => toggleDoc(doc.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-blue-900">{doc.label}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-blue-700 mt-3">
                    💡 Marca solo los documentos que el cliente necesita presentar
                  </p>
                </div>
              )}

              <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>📄 Nota:</strong> Las líneas de firma están en blanco para que puedan 
                  firmarse a mano después de imprimir el documento.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}