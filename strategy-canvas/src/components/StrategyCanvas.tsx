import { useState, useRef, useCallback, useContext, useEffect } from 'react';
import { Plus, Trash2, Edit3, Save, X, Sun, Moon, Languages, ChartCandlestickIcon } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';
import { translations } from '../i18n/translations';
import StrategyCanvasChart from './ChartStrategyCanvas';

interface Factor {
  id: string;
  name: string;
  value: number;
}

const StrategyCanvas: React.FC = () => {
  const { language, toggleLanguage } = useContext(LanguageContext);
  const t = translations[language];

  const [factors, setFactors] = useState<Factor[]>([
    { id: '1', name: language === 'ar' ? 'السعر' : 'Price', value: 30 },
    { id: '2', name: language === 'ar' ? 'الجودة' : 'Quality', value: 70 },
    { id: '3', name: language === 'ar' ? 'الخدمة' : 'Service', value: 50 },
    { id: '4', name: language === 'ar' ? 'التسويق' : 'Marketing', value: 80 },
  ]);


  const [editingFactor, setEditingFactor] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newFactorName, setNewFactorName] = useState('');
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);

  // Update factor names when language changes
  useEffect(() => {
    setFactors((prev) =>
      prev.map((factor) => ({
        ...factor,
        name:
          factor.id === '1'
            ? language === 'ar'
              ? 'السعر'
              : 'Price'
            : factor.id === '2'
              ? language === 'ar'
                ? 'الجودة'
                : 'Quality'
              : factor.id === '3'
                ? language === 'ar'
                  ? 'الخدمة'
                  : 'Service'
                : factor.id === '4'
                  ? language === 'ar'
                    ? 'التسويق'
                    : 'Marketing'
                  : factor.name,
      }))
    );
  }, [language]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const addFactor = () => {
    if (newFactorName.trim()) {
      const newFactor: Factor = {
        id: Date.now().toString(),
        name: newFactorName.trim(),
        value: 50,
      };
      setFactors([...factors, newFactor]);
      setNewFactorName('');
    }
  };

  const deleteFactor = (id: string) => {
    setFactors(factors.filter((f) => f.id !== id));
  };

  const startEdit = (factor: Factor) => {
    setEditingFactor(factor.id);
    setEditingName(factor.name);
  };

  const saveEdit = () => {
    if (editingFactor && editingName.trim()) {
      setFactors(
        factors.map((f) =>
          f.id === editingFactor ? { ...f, name: editingName.trim() } : f
        )
      );
    }
    setEditingFactor(null);
    setEditingName('');
  };

  const cancelEdit = () => {
    setEditingFactor(null);
    setEditingName('');
  };

  const updateFactorValue = (id: string, value: number) => {
    setFactors(
      factors.map((f) =>
        f.id === id ? { ...f, value: Math.max(0, Math.min(100, value)) } : f
      )
    );
  };

  const handleMouseDown = (factorId: string) => {
    setIsDragging(factorId);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isDragging || !svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const chartHeight = 300;
      const margin = 60;

      const relativeY = y - margin;
      const percentage = Math.max(
        0,
        Math.min(100, 100 - (relativeY / chartHeight) * 100)
      );

      updateFactorValue(isDragging, percentage);
    },
    [isDragging]
  );

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  // Chart dimensions
  const width = 800;
  const height = 400;
  const margin = 60;
  const chartWidth = width - 2 * margin;
  const chartHeight = height - 2 * margin;

  // Calculate positions
  const getX = (index: number) =>
    margin + (index * chartWidth) / Math.max(1, factors.length - 1);
  const getY = (value: number) =>
    margin + chartHeight - (value / 100) * chartHeight;

  // Create path for the line
  const linePath =
    factors.length > 1
      ? factors
        .map((factor, index) => {
          const x = getX(index);
          const y = getY(factor.value);
          return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ')
      : '';

  function updateFactor(id: string, value: number): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-300 ${isDarkMode
        ? 'bg-gradient-to-br from-gray-900 to-gray-800'
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
        }`}
    >
      <div className="max-w-6xl mx-auto">
        <div
          className={`rounded-2xl shadow-2xl p-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
        >
          {/* Theme and Language Toggle Buttons */}
          <div className="flex justify-end mb-4 gap-2">
            <button
              onClick={toggleLanguage}
              className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${isDarkMode
                ? 'bg-gray-700 text-blue-400 hover:bg-gray-600'
                : 'bg-gray-200 text-blue-700 hover:bg-gray-300'
                }`}
              title={`Switch to ${language === 'en' ? 'Arabic' : 'English'}`}
            >
              <Languages size={24} />
            </button>
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${isDarkMode
                ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>

          <div className="text-center mb-8">
            <h1
              className={`text-4xl font-bold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'
                }`}
            >
              {t.title}
            </h1>
            <h2
              className={`text-2xl font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}
            >
              {t.title}
            </h2>
            <p
              className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
            >
              {t.subtitle}
            </p>
          </div>

          {/* Add Factor Section */}
          <div
            className={`mb-8 p-6 rounded-xl transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}
            >
              {t.addFactorTitle}
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newFactorName}
                onChange={(e) => setNewFactorName(e.target.value)}
                placeholder={t.addFactorPlaceholder}
                className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${isDarkMode
                  ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                onKeyPress={(e) => e.key === 'Enter' && addFactor()}
              />
              <button
                onClick={addFactor}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                {t.addButton}
              </button>
            </div>
          </div>

          {/* Factors List */}
          <div className="mb-8">
            <h3
              className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}
            >
              {t.currentFactorsTitle}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {factors.map((factor) => (
                <div
                  key={factor.id}
                  className={`rounded-lg p-4 transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    {editingFactor === factor.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className={`flex-1 px-2 py-1 border rounded text-sm transition-colors duration-300 ${isDarkMode
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                        />
                        <button
                          onClick={saveEdit}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span
                          className={`font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                            }`}
                        >
                          {factor.name}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(factor)}
                            className={`transition-colors duration-300 ${isDarkMode
                              ? 'text-blue-400 hover:text-blue-300'
                              : 'text-blue-600 hover:text-blue-700'
                              }`}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => deleteFactor(factor.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={factor.value}
                      onChange={(e) =>
                        updateFactorValue(factor.id, parseInt(e.target.value))
                      }
                      className="flex-1"
                    />
                    <span
                      className={`text-sm font-medium w-12 transition-colors duration-300 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}
                    >
                      {Math.round(factor.value)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Strategy Canvas Chart */}
          <StrategyCanvasChart
            factors={factors}
            onFactorChange={(id, value) => updateFactorValue(id, value)}
            title={t.chartTitle}
            performanceLabel={t.performanceLevel}
            competitiveFactorsLabel={t.competitiveFactors}
            isDarkMode={isDarkMode}
            width={900}
            height={500}
            language={language}
          />

          {/* Instructions */}
          <div
            className={`mt-8 p-6 rounded-xl transition-colors duration-300 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
              }`}
          >
            <h4
              className={`font-semibold mb-3 transition-colors duration-300 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'
                }`}
            >
              {t.instructionsTitle}
            </h4>
            <ul
              className={`space-y-2 transition-colors duration-300 ${isDarkMode ? 'text-blue-200' : 'text-blue-700'
                }`}
            >
              {t.instructions.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyCanvas;