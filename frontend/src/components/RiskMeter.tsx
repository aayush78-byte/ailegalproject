import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, AlertCircle, Skull } from 'lucide-react';

interface RiskMeterProps {
  score: number;
}

const RiskMeter: React.FC<RiskMeterProps> = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const getRiskLevel = (value: number) => {
    if (value <= 30) return { label: 'Mostly Safe', color: 'text-risk-safe', bgColor: 'bg-green-100', borderColor: 'border-green-200' };
    if (value <= 60) return { label: 'Caution Advised', color: 'text-risk-caution', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-200' };
    if (value <= 80) return { label: 'High Risk', color: 'text-risk-warning', bgColor: 'bg-orange-100', borderColor: 'border-orange-200' };
    return { label: 'Predatory Terms', color: 'text-risk-danger', bgColor: 'bg-red-100', borderColor: 'border-red-200' };
  };

  const getRiskIcon = (value: number) => {
    if (value <= 30) return <ShieldCheck className="w-6 h-6" />;
    if (value <= 60) return <AlertCircle className="w-6 h-6" />;
    if (value <= 80) return <AlertTriangle className="w-6 h-6" />;
    return <Skull className="w-6 h-6" />;
  };

  const riskInfo = getRiskLevel(score);
  const needleAngle = -90 + (animatedScore / 100) * 180;

  const generateArcPath = (startAngle: number, endAngle: number, radius: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = 100 + radius * Math.cos(startRad);
    const y1 = 100 + radius * Math.sin(startRad);
    const x2 = 100 + radius * Math.cos(endRad);
    const y2 = 100 + radius * Math.sin(endRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  return (
    <div className="legal-card animate-slide-up stagger-1">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${riskInfo.bgColor} ${riskInfo.borderColor} border`}>
          <span className={riskInfo.color}>{getRiskIcon(score)}</span>
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Risk Assessment
          </h2>
          <p className="text-sm text-muted-foreground">
            Overall contract risk score
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {/* Speedometer SVG */}
        <div className="relative w-64 h-36">
          <svg viewBox="0 0 200 120" className="w-full h-full">
            {/* Background arc segments */}
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(142, 71%, 45%)" />
                <stop offset="33%" stopColor="hsl(45, 93%, 47%)" />
                <stop offset="66%" stopColor="hsl(25, 95%, 53%)" />
                <stop offset="100%" stopColor="hsl(0, 84%, 60%)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Background track */}
            <path
              d={generateArcPath(-180, 0, 75)}
              fill="none"
              stroke="hsl(220, 14%, 96%)"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Colored arc */}
            <path
              d={generateArcPath(-180, 0, 75)}
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              className="opacity-90"
            />

            {/* Tick marks */}
            {[0, 30, 60, 80, 100].map((tick) => {
              const angle = -180 + (tick / 100) * 180;
              const rad = (angle * Math.PI) / 180;
              const x1 = 100 + 62 * Math.cos(rad);
              const y1 = 100 + 62 * Math.sin(rad);
              const x2 = 100 + 70 * Math.cos(rad);
              const y2 = 100 + 70 * Math.sin(rad);
              return (
                <g key={tick}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="hsl(222, 47%, 18%)"
                    strokeWidth="2"
                    opacity="0.3"
                  />
                  <text
                    x={100 + 52 * Math.cos(rad)}
                    y={100 + 52 * Math.sin(rad)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="8"
                    fill="hsl(220, 9%, 46%)"
                    fontWeight="500"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Needle */}
            <g 
              style={{ 
                transform: `rotate(${needleAngle}deg)`,
                transformOrigin: '100px 100px',
                transition: 'transform 1.5s ease-out'
              }}
            >
              <polygon
                points="100,25 96,100 104,100"
                fill="hsl(222, 47%, 18%)"
                filter="url(#glow)"
              />
              <circle
                cx="100"
                cy="100"
                r="8"
                fill="hsl(222, 47%, 18%)"
              />
              <circle
                cx="100"
                cy="100"
                r="4"
                fill="hsl(0, 0%, 100%)"
              />
            </g>
          </svg>

          {/* Score display */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
            <span className={`font-display text-4xl font-bold ${riskInfo.color}`}>
              {animatedScore}
            </span>
            <span className="text-muted-foreground text-lg">/100</span>
          </div>
        </div>

        {/* Risk label */}
        <div className={`mt-4 px-4 py-2 rounded-full ${riskInfo.bgColor} ${riskInfo.borderColor} border`}>
          <span className={`font-medium ${riskInfo.color}`}>
            {riskInfo.label}
          </span>
        </div>

        {/* Risk breakdown */}
        <div className="w-full mt-6 grid grid-cols-4 gap-2">
          {[
            { label: 'Safe', range: '0-30', color: 'bg-green-500' },
            { label: 'Caution', range: '31-60', color: 'bg-yellow-500' },
            { label: 'High', range: '61-80', color: 'bg-orange-500' },
            { label: 'Critical', range: '81-100', color: 'bg-red-500' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className={`h-2 rounded-full ${item.color} mb-1 opacity-80`} />
              <p className="text-xs font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.range}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiskMeter;
