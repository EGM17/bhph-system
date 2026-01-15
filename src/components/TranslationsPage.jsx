import { useState, useEffect } from 'react';
import { ArrowLeft, Save, RefreshCw, Globe, AlertCircle, CheckCircle } from 'lucide-react';
import { loadTranslations, saveTranslations, initializeTranslations } from '../services/translationService';

export default function TranslationsPage({ onClose }) {
  const [translations, setTranslations] = useState({ es: {}, en: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('es');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadTranslationsData();
  }, []);

  const loadTranslationsData = async () => {
    try {
      setLoading(true);
      const data = await loadTranslations();
      setTranslations(data);
    } catch (error) {
      console.error('Error cargando traducciones:', error);
      setMessage({ type: 'error', text: 'Error al cargar traducciones' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveTranslations('es', translations.es);
      await saveTranslations('en', translations.en);
      setMessage({ type: 'success', text: 'Traducciones guardadas exitosamente' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error guardando traducciones:', error);
      setMessage({ type: 'error', text: 'Error al guardar traducciones' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('¿Estás seguro de restablecer las traducciones por defecto? Esto sobrescribirá todos los cambios.')) {
      return;
    }
    try {
      setLoading(true);
      await initializeTranslations();
      await loadTranslationsData();
      setMessage({ type: 'success', text: 'Traducciones restablecidas' });
    } catch (error) {
      console.error('Error restableciendo traducciones:', error);
      setMessage({ type: 'error', text: 'Error al restablecer traducciones' });
    }
  };

  const updateTranslation = (lang, section, key, value) => {
    setTranslations(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [section]: {
          ...prev[lang][section],
          [key]: value
        }
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando traducciones...</p>
        </div>
      </div>
    );
  }

  const currentTranslations = translations[activeTab] || {};

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">Administrar Traducciones</h1>
              <p className="text-sm text-gray-600">Edita los textos que aparecen en el sitio web público</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Restablecer
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </p>
          </div>
        )}

        {/* Language Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('es')}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition ${
                activeTab === 'es'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Globe className="w-5 h-5" />
              Español
            </button>
            <button
              onClick={() => setActiveTab('en')}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition ${
                activeTab === 'en'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Globe className="w-5 h-5" />
              English
            </button>
          </div>

          {/* Translation Sections */}
          <div className="p-6 space-y-8">
            {Object.keys(currentTranslations).map(section => (
              <div key={section} className="border-b border-gray-200 pb-6 last:border-0">
                <h3 className="text-lg font-bold text-gray-900 mb-4 capitalize">
                  {section}
                </h3>
                <div className="space-y-4">
                  {typeof currentTranslations[section] === 'object' ? (
                    Object.entries(currentTranslations[section]).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {section}.{key}
                        </label>
                        {typeof value === 'string' && value.length > 100 ? (
                          <textarea
                            value={value}
                            onChange={(e) => updateTranslation(activeTab, section, key, e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => updateTranslation(activeTab, section, key, e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {section}
                      </label>
                      <input
                        type="text"
                        value={currentTranslations[section]}
                        onChange={(e) => {
                          setTranslations(prev => ({
                            ...prev,
                            [activeTab]: {
                              ...prev[activeTab],
                              [section]: e.target.value
                            }
                          }));
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 Información importante
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Los cambios se aplican inmediatamente después de guardar</li>
            <li>Las traducciones afectan todo el sitio web público</li>
            <li>Usa "Restablecer" para volver a las traducciones por defecto</li>
            <li>Los campos vacíos mostrarán la clave de traducción</li>
          </ul>
        </div>
      </div>
    </div>
  );
}