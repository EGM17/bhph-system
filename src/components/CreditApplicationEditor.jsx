import { useState, useEffect } from 'react';
import { FileText, User, Briefcase, Home, AlertCircle } from 'lucide-react';

/**
 * Editor para capturar información de aplicación de crédito
 * Basado en el formulario del PDF DatosFinanciamiento.pdf
 */
export default function CreditApplicationEditor({ initialData, onChange }) {
  const [formData, setFormData] = useState(initialData || {
    // Current Employment & Residence
    name: '',
    phone: '',
    dlNumber: '',
    dateOfBirth: '',
    ssn: '',
    address: '',
    aptNumber: '',
    city: '',
    state: '',
    zip: '',
    residenceYears: '',
    residenceMonths: '',
    landlordName: '',
    landlordPhone: '',
    monthlyPayment: '',
    
    // Employment
    employer: '',
    role: '',
    supervisor: '',
    employerAddress: '',
    employerCity: '',
    employerState: '',
    employerZip: '',
    employmentYears: '',
    employmentMonths: '',
    employerPhone: '',
    monthlyIncome: '',
    
    // Previous Residence and Previous/Secondary Employment
    prevName: '',
    prevPhone: '',
    prevDlNumber: '',
    prevDateOfBirth: '',
    prevSsn: '',
    prevAddress: '',
    prevAptNumber: '',
    prevCity: '',
    prevState: '',
    prevZip: '',
    prevResidenceYears: '',
    prevResidenceMonths: '',
    prevLandlordName: '',
    prevLandlordPhone: '',
    prevMonthlyPayment: '',
    
    // Previous/Secondary Employment
    prevEmployer: '',
    prevRole: '',
    prevSupervisor: '',
    prevEmployerAddress: '',
    prevEmployerCity: '',
    prevEmployerState: '',
    prevEmployerZip: '',
    prevEmploymentYears: '',
    prevEmploymentMonths: '',
    prevEmployerPhone: '',
    prevMonthlyIncome: ''
  });

  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    // Validar campos mínimos requeridos
    const requiredFields = ['name', 'phone', 'dlNumber', 'dateOfBirth', 'ssn', 'address', 'city', 'state', 'zip'];
    const allFilled = requiredFields.every(field => formData[field] && formData[field].trim() !== '');
    
    setIsValid(allFilled);
    onChange(formData, allFilled);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Validación Visual */}
      <div className={`p-4 rounded-lg border-2 ${
        isValid 
          ? 'bg-green-50 border-green-300' 
          : 'bg-yellow-50 border-yellow-300'
      }`}>
        <div className="flex items-center gap-2">
          {isValid ? (
            <>
              <FileText className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">✓ Información completa</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">⚠ Completa los campos requeridos</span>
            </>
          )}
        </div>
      </div>

      {/* Current Employment & Residence */}
      <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Información Personal Actual
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="555-123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Licencia de Conducir # *
            </label>
            <input
              type="text"
              name="dlNumber"
              value={formData.dlNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="DL123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Nacimiento *
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SSN (últimos 4 dígitos) *
            </label>
            <input
              type="text"
              name="ssn"
              value={formData.ssn}
              onChange={handleChange}
              maxLength="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="1234"
            />
          </div>
        </div>
      </div>

      {/* Residence Information */}
      <div className="bg-white border-2 border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
          <Home className="w-5 h-5" />
          Información de Residencia Actual
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="123 Main St"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apt/Suite #
            </label>
            <input
              type="text"
              name="aptNumber"
              value={formData.aptNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Apt 5B"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ciudad *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Salem"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado *
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              maxLength="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="OR"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código Postal *
            </label>
            <input
              type="text"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="97302"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Años en esta dirección
            </label>
            <input
              type="number"
              name="residenceYears"
              value={formData.residenceYears}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meses
            </label>
            <input
              type="number"
              name="residenceMonths"
              value={formData.residenceMonths}
              onChange={handleChange}
              min="0"
              max="11"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Propietario/Arrendador
            </label>
            <input
              type="text"
              name="landlordName"
              value={formData.landlordName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono del Propietario
            </label>
            <input
              type="tel"
              name="landlordPhone"
              value={formData.landlordPhone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="555-987-6543"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pago Mensual de Renta/Hipoteca
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                name="monthlyPayment"
                value={formData.monthlyPayment}
                onChange={handleChange}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="1200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Current Employment */}
      <div className="bg-white border-2 border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Empleo Actual
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empleador
            </label>
            <input
              type="text"
              name="employer"
              value={formData.employer}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="ABC Company"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Puesto
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Gerente"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supervisor
            </label>
            <input
              type="text"
              name="supervisor"
              value={formData.supervisor}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="María García"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono del Empleador
            </label>
            <input
              type="tel"
              name="employerPhone"
              value={formData.employerPhone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="555-111-2222"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección del Empleador
            </label>
            <input
              type="text"
              name="employerAddress"
              value={formData.employerAddress}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="456 Business Ave"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ciudad
            </label>
            <input
              type="text"
              name="employerCity"
              value={formData.employerCity}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Salem"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <input
              type="text"
              name="employerState"
              value={formData.employerState}
              onChange={handleChange}
              maxLength="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="OR"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código Postal
            </label>
            <input
              type="text"
              name="employerZip"
              value={formData.employerZip}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="97302"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Años en este empleo
            </label>
            <input
              type="number"
              name="employmentYears"
              value={formData.employmentYears}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meses
            </label>
            <input
              type="number"
              name="employmentMonths"
              value={formData.employmentMonths}
              onChange={handleChange}
              min="0"
              max="11"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="8"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ingreso Mensual Bruto
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                name="monthlyIncome"
                value={formData.monthlyIncome}
                onChange={handleChange}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="3500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Previous/Secondary Employment (Colapsable) */}
      <details className="bg-white border-2 border-gray-200 rounded-lg">
        <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-700 hover:bg-gray-50">
          📋 Residencia y Empleo Previo/Secundario (Opcional)
        </summary>
        
        <div className="p-6 space-y-6 border-t border-gray-200">
          {/* Previous Residence */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">Residencia Anterior</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                <input
                  type="text"
                  name="prevAddress"
                  value={formData.prevAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                <input
                  type="text"
                  name="prevCity"
                  value={formData.prevCity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <input
                  type="text"
                  name="prevState"
                  value={formData.prevState}
                  onChange={handleChange}
                  maxLength="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Previous Employment */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">Empleo Anterior/Secundario</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Empleador</label>
                <input
                  type="text"
                  name="prevEmployer"
                  value={formData.prevEmployer}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Puesto</label>
                <input
                  type="text"
                  name="prevRole"
                  value={formData.prevRole}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ingreso Mensual</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="prevMonthlyIncome"
                    value={formData.prevMonthlyIncome}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </details>

      {/* Nota informativa */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <p className="text-sm text-blue-800">
          <strong>💡 Nota:</strong> Los campos marcados con * son obligatorios para poder generar 
          el documento de aplicación de crédito. La información de empleo y residencia previos es opcional.
        </p>
      </div>
    </div>
  );
}