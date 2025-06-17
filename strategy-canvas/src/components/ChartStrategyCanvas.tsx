import { useState, useRef, useCallback } from 'react';
import { TrendingUp, Maximize2, Download, RefreshCw } from 'lucide-react';

interface Factor {
    id: string;
    name: string;
    value: number;
}

interface StrategyCanvasChartProps {
    factors: Factor[];
    onFactorChange?: (id: string, value: number) => void;
    title?: string;
    performanceLabel?: string;
    competitiveFactorsLabel?: string;
    isDarkMode?: boolean;
    width?: number;
    height?: number;
    showGrid?: boolean;
    animated?: boolean;
    language?: 'en' | 'ar';
}

const StrategyCanvasChart: React.FC<StrategyCanvasChartProps> = ({
    factors = [],
    onFactorChange,
    title = "Strategy Canvas",
    performanceLabel = "Performance Level",
    competitiveFactorsLabel = "Competitive Factors",
    isDarkMode = false,
    width = 900,
    height = 500,
    showGrid = true,
    animated = true,
    language = 'en'
}) => {
    const [isDragging, setIsDragging] = useState<string | null>(null);
    const [hoveredFactor, setHoveredFactor] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Chart dimensions
    const margin = 80;
    const chartWidth = width - 2 * margin;
    const chartHeight = height - 2 * margin;

    // Calculate positions
    const getX = (index: number) =>
        margin + (index * chartWidth) / Math.max(1, factors.length - 1);
    const getY = (value: number) =>
        margin + chartHeight - (value / 100) * chartHeight;

    // Create smooth path for the line
    const createSmoothPath = () => {
        if (factors.length < 2) return '';

        let path = `M ${getX(0)} ${getY(factors[0].value)}`;

        for (let i = 1; i < factors.length; i++) {
            const x = getX(i);
            const y = getY(factors[i].value);
            const prevX = getX(i - 1);
            const prevY = getY(factors[i - 1].value);

            const controlX1 = prevX + (x - prevX) * 0.4;
            const controlX2 = x - (x - prevX) * 0.4;

            path += ` C ${controlX1} ${prevY}, ${controlX2} ${y}, ${x} ${y}`;
        }

        return path;
    };

    const handleMouseDown = (factorId: string) => {
        setIsDragging(factorId);
    };

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<SVGSVGElement>) => {
            if (!isDragging || !svgRef.current) return;

            const rect = svgRef.current.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const relativeY = y - margin;
            const percentage = Math.max(
                0,
                Math.min(100, 100 - (relativeY / chartHeight) * 100)
            );

            if (onFactorChange) {
                onFactorChange(isDragging, percentage);
            }
        },
        [isDragging, onFactorChange, margin, chartHeight]
    );

    const handleMouseUp = () => {
        setIsDragging(null);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const downloadChart = () => {
    if (!svgRef.current) return;

    try {
        const svgData = new XMLSerializer().serializeToString(svgRef.current);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        canvas.width = width;
        canvas.height = height;

        // Set white background
        if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
        }

        img.onload = () => {
            if (ctx) {
                ctx.drawImage(img, 0, 0);
            }
            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = 'strategy-canvas.png';
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        // Ensure proper encoding by converting to UTF-8 and then base64
        const utf8Svg = unescape(encodeURIComponent(svgData));
        img.src = 'data:image/svg+xml;base64,' + btoa(utf8Svg);
    } catch (error) {
        console.error('Error downloading chart:', error);
        alert('Failed to download the chart. Please try again.');
    }
};

    // Calculate statistics
    const averageValue = factors.length > 0
        ? factors.reduce((sum, f) => sum + f.value, 0) / factors.length
        : 0;

    const maxFactor = factors.reduce((max, f) => f.value > max.value ? f : max, factors[0]);
    const minFactor = factors.reduce((min, f) => f.value < min.value ? f : min, factors[0]);

    const containerClass = isFullscreen
        ? 'fixed inset-0 z-50 p-4'
        : 'relative';

    return (
        <div ref={containerRef} className={containerClass}>
            <div className={`
        rounded-2xl shadow-2xl border transition-all duration-300 h-full
        ${isDarkMode
                    ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700'
                    : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'
                }
        ${isFullscreen ? 'h-full' : ''}
      `}>

                {/* Header */}
                <div className={`
          p-6 border-b flex items-center justify-between
          ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}
        `}>
                    <div className="flex items-center gap-4">
                        <div className={`
              p-3 rounded-xl 
              ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}
            `}>
                            <TrendingUp className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'
                                }`} />
                        </div>
                        <div>
                            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'
                                }`}>
                                {title}
                            </h2>
                            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'
                                }`}>
                                {language === 'ar' ? 'تصور استراتيجي تفاعلي' : 'Interactive strategy visualization'}
                            </p>
                        </div>
                    </div>

                    {/* Stats and Controls */}
                    <div className="flex items-center gap-4">
                        {/* Quick Stats */}
                        <div className="flex gap-4 text-sm">
                            <div className={`text-center px-3 py-2 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'
                                }`}>
                                <div className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'
                                    }`}>
                                    {Math.round(averageValue)}%
                                </div>
                                <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'
                                    }`}>
                                    {language === 'ar' ? 'متوسط' : 'Average'}
                                </div>
                            </div>
                            {maxFactor && (
                                <div className={`text-center px-3 py-2 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'
                                    }`}>
                                    <div className="font-semibold text-green-600">
                                        {Math.round(maxFactor.value)}%
                                    </div>
                                    <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'
                                        }`}>
                                        {language === 'ar' ? 'الأعلى' : 'Highest'}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={downloadChart}
                                className={`
                  p-2 rounded-lg transition-colors
                  ${isDarkMode
                                        ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-300'
                                        : 'hover:bg-slate-100 text-slate-600 hover:text-slate-700'
                                    }
                `}
                                title="Download Chart"
                            >
                                <Download size={18} />
                            </button>
                            <button
                                onClick={toggleFullscreen}
                                className={`
                  p-2 rounded-lg transition-colors
                  ${isDarkMode
                                        ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-300'
                                        : 'hover:bg-slate-100 text-slate-600 hover:text-slate-700'
                                    }
                `}
                                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                            >
                                <Maximize2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chart Container */}
                <div className="p-6 ">
                    <div className="overflow-x-auto">
                        <svg
                            ref={svgRef}
                            width={width}
                            height={height}
                            className={`
                border rounded-xl transition-all duration-300
                ${isDarkMode
                                    ? 'border-slate-600 bg-gradient-to-br from-slate-800 to-slate-900'
                                    : 'border-slate-200 bg-gradient-to-br from-white to-slate-50'
                                }
                ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'}
              `}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            {/* Definitions */}
                            <defs>
                                {showGrid && (
                                    <pattern
                                        id="grid"
                                        width="50"
                                        height="40"
                                        patternUnits="userSpaceOnUse"
                                    >
                                        <path
                                            d="M 50 0 L 0 0 0 40"
                                            fill="none"
                                            stroke={isDarkMode ? '#334155' : '#f1f5f9'}
                                            strokeWidth="1"
                                        />
                                    </pattern>
                                )}

                                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.2 }} />
                                    <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.05 }} />
                                </linearGradient>

                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* Grid Background */}
                            {showGrid && <rect width={width} height={height} fill="url(#grid)" />}

                            {/* Performance Zones */}
                            <g opacity="0.3">
                                <rect
                                    x={margin}
                                    y={margin}
                                    width={chartWidth}
                                    height={chartHeight * 0.25}
                                    fill="#ef4444"
                                    opacity="0.1"
                                />
                                <rect
                                    x={margin}
                                    y={margin + chartHeight * 0.25}
                                    width={chartWidth}
                                    height={chartHeight * 0.5}
                                    fill="#f59e0b"
                                    opacity="0.1"
                                />
                                <rect
                                    x={margin}
                                    y={margin + chartHeight * 0.75}
                                    width={chartWidth}
                                    height={chartHeight * 0.25}
                                    fill="#10b981"
                                    opacity="0.1"
                                />
                            </g>

                            {/* Axes */}
                            <line
                                x1={margin}
                                y1={margin}
                                x2={margin}
                                y2={height - margin}
                                stroke={isDarkMode ? '#64748b' : '#475569'}
                                strokeWidth="2"
                            />
                            <line
                                x1={margin}
                                y1={height - margin}
                                x2={width - margin}
                                y2={height - margin}
                                stroke={isDarkMode ? '#64748b' : '#475569'}
                                strokeWidth="2"
                            />

                            {/* Y-axis labels and grid lines */}
                            {[0, 25, 50, 75, 100].map((value) => (
                                <g key={value}>
                                    <line
                                        x1={margin}
                                        y1={getY(value)}
                                        x2={width - margin}
                                        y2={getY(value)}
                                        stroke={isDarkMode ? '#334155' : '#e2e8f0'}
                                        strokeWidth="1"
                                        strokeDasharray="2,4"
                                        opacity="0.5"
                                    />
                                    <line
                                        x1={margin - 8}
                                        y1={getY(value)}
                                        x2={margin + 8}
                                        y2={getY(value)}
                                        stroke={isDarkMode ? '#64748b' : '#475569'}
                                        strokeWidth="2"
                                    />
                                    <text
                                        x={margin - 15}
                                        y={getY(value)}
                                        textAnchor={language === 'ar' ? 'start' : 'end'}
                                        className={`text-sm font-medium ${isDarkMode ? 'fill-slate-400' : 'fill-slate-600'
                                            }`}
                                        dy=".35em"
                                    >
                                        {value}%
                                    </text>
                                </g>
                            ))}

                            {/* Y-axis title */}
                            <text
                                x={25}
                                y={height / 2}
                                textAnchor="middle"
                                className={`text-sm font-semibold ${isDarkMode ? 'fill-slate-300' : 'fill-slate-700'
                                    }`}
                                transform={`rotate(-90 25 ${height / 2})`}
                            >
                                {performanceLabel}
                            </text>

                            {/* Area under curve */}
                            {factors.length > 1 && (
                                <path
                                    d={`${createSmoothPath()} L ${getX(factors.length - 1)} ${height - margin} L ${getX(0)} ${height - margin} Z`}
                                    fill="url(#areaGradient)"
                                    className={animated ? 'animate-pulse' : ''}
                                />
                            )}

                            {/* Strategy line */}
                            {factors.length > 1 && (
                                <path
                                    d={createSmoothPath()}
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="4"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    filter="url(#glow)"
                                    className={`transition-all duration-300 ${animated ? 'drop-shadow-lg' : ''
                                        }`}
                                />
                            )}

                            {/* Factor points and labels */}
                            {factors.map((factor, index) => {
                                const x = getX(index);
                                const y = getY(factor.value);
                                const isHovered = hoveredFactor === factor.id;
                                const isDraggingThis = isDragging === factor.id;

                                return (
                                    <g key={factor.id}>
                                        {/* Hover area */}
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r="25"
                                            fill="transparent"
                                            onMouseEnter={() => setHoveredFactor(factor.id)}
                                            onMouseLeave={() => setHoveredFactor(null)}
                                            onMouseDown={() => handleMouseDown(factor.id)}
                                        />

                                        {/* Glow effect for hovered/dragged points */}
                                        {(isHovered || isDraggingThis) && (
                                            <circle
                                                cx={x}
                                                cy={y}
                                                r="15"
                                                fill="#3b82f6"
                                                opacity="0.2"
                                                className="animate-ping"
                                            />
                                        )}

                                        {/* Factor point */}
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r={isHovered || isDraggingThis ? "10" : "8"}
                                            fill="#3b82f6"
                                            stroke={isDarkMode ? '#1e293b' : '#ffffff'}
                                            strokeWidth="3"
                                            className={`
                        transition-all duration-200 cursor-grab
                        ${isDraggingThis ? 'cursor-grabbing scale-110' : ''}
                        ${isHovered ? 'drop-shadow-lg' : ''}
                      `}
                                            onMouseDown={() => handleMouseDown(factor.id)}
                                        />

                                        {/* Factor name */}
                                        <text
                                            x={x}
                                            y={height - margin + 25}
                                            textAnchor="middle"
                                            className={`text-sm font-semibold transition-all duration-200 ${isDarkMode ? 'fill-slate-300' : 'fill-slate-700'
                                                } ${isHovered ? 'fill-blue-600 text-base' : ''}`}
                                        >
                                            {factor.name}
                                        </text>

                                        {/* Value label */}
                                        <text
                                            x={x}
                                            y={y - 18}
                                            textAnchor="middle"
                                            className={`text-sm font-bold transition-all duration-200 ${isDarkMode ? 'fill-blue-400' : 'fill-blue-700'
                                                } ${isHovered ? 'text-lg' : ''}`}
                                        >
                                            {Math.round(factor.value)}%
                                        </text>

                                        {/* Tooltip on hover */}
                                        {isHovered && (
                                            <g>
                                                <rect
                                                    x={x - 50}
                                                    y={y - 60}
                                                    width="100"
                                                    height="30"
                                                    rx="6"
                                                    fill={isDarkMode ? '#1e293b' : '#ffffff'}
                                                    stroke={isDarkMode ? '#475569' : '#e2e8f0'}
                                                    strokeWidth="1"
                                                    filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))"
                                                />
                                                <text
                                                    x={x}
                                                    y={y - 40}
                                                    textAnchor="middle"
                                                    className={`text-xs font-medium ${isDarkMode ? 'fill-slate-300' : 'fill-slate-700'
                                                        }`}
                                                >
                                                    Click and drag to adjust
                                                </text>
                                            </g>
                                        )}
                                    </g>
                                );
                            })}

                            {/* X-axis title */}
                            <text
                                x={width / 2}
                                y={height - 20}
                                textAnchor="middle"
                                className={`text-sm font-semibold ${isDarkMode ? 'fill-slate-300' : 'fill-slate-700'
                                    }`}
                            >
                                {competitiveFactorsLabel}
                            </text>
                        </svg>
                    </div>

                    {/* Chart Legend/Instructions */}
                    <div className={`
            mt-6 p-4 rounded-xl 
            ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}
          `}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full opacity-60"></div>
                                    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                                        {language === 'ar' ? 'قوي (75-100%)' : 'Strong (75-100%)'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full opacity-60"></div>
                                    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                                        {language === 'ar' ? 'متوسط (25-75%)' : 'Moderate (25-75%)'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full opacity-60"></div>
                                    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                                        {language === 'ar' ? 'ضعيف (0-25%)' : 'Weak (0-25%)'}
                                    </span>
                                </div>
                            </div>
                            <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                💡 {language === 'ar' ? 'اسحب النقاط لتعديل القيم' : 'Drag points to adjust values'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StrategyCanvasChart;