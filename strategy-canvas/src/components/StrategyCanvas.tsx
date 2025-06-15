import React, { useState, useRef, useCallback } from 'react';
import { Plus, Trash2, Edit3, Save, X } from 'lucide-react';

interface Factor {
  id: string;
  name: string;
  value: number;
}

const StrategyCanvas: React.FC = () => {
  const [factors, setFactors] = useState<Factor[]>([
    { id: '1', name: 'السعر', value: 30 },
    { id: '2', name: 'الجودة', value: 70 },
    { id: '3', name: 'الخدمة', value: 50 },
    { id: '4', name: 'التسويق', value: 80 },
  ]);
  
  const [editingFactor, setEditingFactor] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newFactorName, setNewFactorName] = useState('');
  const [isDragging, setIsDragging] = useState<string | null>(null);
  
  const svgRef = useRef<SVGSVGElement>(null);
  
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
    setFactors(factors.filter(f => f.id !== id));
  };
  
  const startEdit = (factor: Factor) => {
    setEditingFactor(factor.id);
    setEditingName(factor.name);
  };
  
  const saveEdit = () => {
    if (editingFactor && editingName.trim()) {
      setFactors(factors.map(f => 
        f.id === editingFactor ? { ...f, name: editingName.trim() } : f
      ));
    }
    setEditingFactor(null);
    setEditingName('');
  };
  
  const cancelEdit = () => {
    setEditingFactor(null);
    setEditingName('');
  };
  
  const updateFactorValue = (id: string, value: number) => {
    setFactors(factors.map(f => 
      f.id === id ? { ...f, value: Math.max(0, Math.min(100, value)) } : f
    ));
  };
  
  const handleMouseDown = (factorId: string) => {
    setIsDragging(factorId);
  };
  
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const chartHeight = 300;
    const margin = 60;
    
    const relativeY = y - margin;
    const percentage = Math.max(0, Math.min(100, 100 - (relativeY / chartHeight) * 100));
    
    updateFactorValue(isDragging, percentage);
  }, [isDragging]);
  
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
  const getX = (index: number) => margin + (index * chartWidth) / Math.max(1, factors.length - 1);
  const getY = (value: number) => margin + chartHeight - (value / 100) * chartHeight;
  
  // Create path for the line
  const linePath = factors.length > 1 
    ? factors.map((factor, index) => {
        const x = getX(index);
        const y = getY(factor.value);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ')
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              شراع استراتيجية
            </h1>
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">
              Strategy Canvas
            </h2>
            <p className="text-gray-600">
              أداة لتحليل العوامل التنافسية وتطوير استراتيجية المحيط الأزرق
            </p>
          </div>
          
          {/* Add Factor Section */}
          <div className="mb-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">إضافة عامل جديد</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newFactorName}
                onChange={(e) => setNewFactorName(e.target.value)}
                placeholder="اسم العامل..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addFactor()}
              />
              <button
                onClick={addFactor}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                إضافة
              </button>
            </div>
          </div>
          
          {/* Factors List */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">العوامل الحالية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {factors.map((factor) => (
                <div key={factor.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    {editingFactor === factor.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                        />
                        <button onClick={saveEdit} className="text-green-600 hover:text-green-700">
                          <Save size={16} />
                        </button>
                        <button onClick={cancelEdit} className="text-red-600 hover:text-red-700">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium text-gray-800">{factor.name}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(factor)}
                            className="text-blue-600 hover:text-blue-700"
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
                      onChange={(e) => updateFactorValue(factor.id, parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-blue-600 w-12">
                      {Math.round(factor.value)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Strategy Canvas Chart */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              مخطط الاستراتيجية
            </h3>
            
            <div className="overflow-x-auto">
              <svg
                ref={svgRef}
                width={width}
                height={height}
                className="border border-gray-200 rounded-lg bg-white cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width={width} height={height} fill="url(#grid)" />
                
                {/* Y-axis */}
                <line
                  x1={margin}
                  y1={margin}
                  x2={margin}
                  y2={height - margin}
                  stroke="#374151"
                  strokeWidth="2"
                />
                
                {/* X-axis */}
                <line
                  x1={margin}
                  y1={height - margin}
                  x2={width - margin}
                  y2={height - margin}
                  stroke="#374151"
                  strokeWidth="2"
                />
                
                {/* Y-axis labels */}
                {[0, 25, 50, 75, 100].map((value) => (
                  <g key={value}>
                    <line
                      x1={margin - 5}
                      y1={getY(value)}
                      x2={margin + 5}
                      y2={getY(value)}
                      stroke="#374151"
                      strokeWidth="1"
                    />
                    <text
                      x={margin - 15}
                      y={getY(value) + 5}
                      textAnchor="end"
                      className="text-sm fill-gray-600"
                    >
                      {value}%
                    </text>
                  </g>
                ))}
                
                {/* Y-axis title */}
                <text
                  x={20}
                  y={height / 2}
                  textAnchor="middle"
                  className="text-sm fill-gray-700 font-medium"
                  transform={`rotate(-90 20 ${height / 2})`}
                >
                  مستوى الأداء
                </text>
                
                {/* Strategy line */}
                {factors.length > 1 && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                )}
                
                {/* Factor points and labels */}
                {factors.map((factor, index) => {
                  const x = getX(index);
                  const y = getY(factor.value);
                  
                  return (
                    <g key={factor.id}>
                      {/* Factor point */}
                      <circle
                        cx={x}
                        cy={y}
                        r="8"
                        fill="#2563eb"
                        stroke="#ffffff"
                        strokeWidth="3"
                        className={`cursor-grab ${isDragging === factor.id ? 'cursor-grabbing' : ''} hover:fill-blue-700 transition-colors`}
                        onMouseDown={() => handleMouseDown(factor.id)}
                      />
                      
                      {/* Factor name */}
                      <text
                        x={x}
                        y={height - margin + 20}
                        textAnchor="middle"
                        className="text-sm fill-gray-700 font-medium"
                      >
                        {factor.name}
                      </text>
                      
                      {/* Value label */}
                      <text
                        x={x}
                        y={y - 15}
                        textAnchor="middle"
                        className="text-xs fill-blue-700 font-semibold"
                      >
                        {Math.round(factor.value)}%
                      </text>
                    </g>
                  );
                })}
                
                {/* Legend */}
                <text
                  x={width / 2}
                  y={height - 15}
                  textAnchor="middle"
                  className="text-sm fill-gray-700 font-medium"
                >
                  العوامل التنافسية
                </text>
              </svg>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="mt-8 p-6 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-3">كيفية الاستخدام:</h4>
            <ul className="text-blue-700 space-y-2">
              <li>• أضف العوامل التنافسية المهمة لصناعتك</li>
              <li>• اسحب النقاط على المخطط لتعديل مستوى الأداء لكل عامل</li>
              <li>• استخدم أشرطة التمرير لضبط القيم بدقة</li>
              <li>• قم بتحرير أو حذف العوامل حسب الحاجة</li>
              <li>• المخطط يساعدك في تحديد الفرص للابتكار والتميز</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyCanvas;