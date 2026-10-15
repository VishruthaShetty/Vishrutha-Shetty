import React, { useState } from 'react';
import { RequiredSkill } from '../../types';

interface SkillRadarChartProps {
  requiredSkills: RequiredSkill[];
  teamBestLevels: Record<string, number>;
}

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({
  requiredSkills,
  teamBestLevels,
}) => {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  if (requiredSkills.length < 3) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-center text-xs text-slate-500">
        Radar chart requires at least 3 required skills. Please add more skills to view competency geometry.
      </div>
    );
  }

  const size = 320;
  const center = size / 2;
  const radius = 105;
  const maxLevel = 5;
  const angleStep = (2 * Math.PI) / requiredSkills.length;

  // Function to get (x, y) for a given index and level
  const getCoordinates = (index: number, level: number) => {
    // Start from top (- PI / 2)
    const angle = index * angleStep - Math.PI / 2;
    const r = (level / maxLevel) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Generate web background polygons for levels 1 through 5
  const gridLevels = [1, 2, 3, 4, 5];
  const gridPolygons = gridLevels.map(lvl => {
    const points = requiredSkills
      .map((_, idx) => {
        const { x, y } = getCoordinates(idx, lvl);
        return `${x},${y}`;
      })
      .join(' ');
    return { level: lvl, points };
  });

  // Required skill levels polygon
  const requiredPoints = requiredSkills
    .map((req, idx) => {
      const { x, y } = getCoordinates(idx, req.minLevel);
      return `${x},${y}`;
    })
    .join(' ');

  // Team best levels polygon
  const teamPoints = requiredSkills
    .map((req, idx) => {
      const best = teamBestLevels[req.skill] || 0;
      const { x, y } = getCoordinates(idx, best);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Competency Radar Geometry</h3>
          <p className="text-xs text-slate-500 mt-0.5">Required targets vs. Assembled team peak</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500/80"></span>
            <span className="text-slate-600">Team Best</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 border border-amber-600"></span>
            <span className="text-slate-600">Required Target</span>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center py-2">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[280px] sm:max-w-[310px] h-auto overflow-visible select-none"
        >
          {/* Background Concentric Grid Polygons */}
          {gridPolygons.map(({ level, points }) => (
            <polygon
              key={level}
              points={points}
              fill={level % 2 === 0 ? '#f8fafc' : 'transparent'}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}

          {/* Radial Spokes from Center */}
          {requiredSkills.map((req, idx) => {
            const { x, y } = getCoordinates(idx, maxLevel);
            return (
              <line
                key={req.skill}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#cbd5e1"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            );
          })}

          {/* Required Level Polygon (Amber dashed boundary) */}
          <polygon
            points={requiredPoints}
            fill="rgba(245, 158, 11, 0.12)"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="4 2"
          />

          {/* Team Best Level Polygon (Indigo solid) */}
          <polygon
            points={teamPoints}
            fill="rgba(79, 70, 229, 0.22)"
            stroke="#4f46e5"
            strokeWidth="2"
          />

          {/* Vertex Nodes for Required Levels */}
          {requiredSkills.map((req, idx) => {
            const { x, y } = getCoordinates(idx, req.minLevel);
            return (
              <circle
                key={`req-${req.skill}`}
                cx={x}
                cy={y}
                r="3.5"
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Vertex Nodes for Team Best Levels */}
          {requiredSkills.map((req, idx) => {
            const best = teamBestLevels[req.skill] || 0;
            const { x, y } = getCoordinates(idx, best);
            const isHovered = hoveredSkill === req.skill;
            const hasGap = best < req.minLevel;

            return (
              <circle
                key={`team-${req.skill}`}
                cx={x}
                cy={y}
                r={isHovered ? '6' : '4'}
                fill={hasGap ? '#ef4444' : '#4f46e5'}
                stroke="#ffffff"
                strokeWidth="1.5"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSkill(req.skill)}
                onMouseLeave={() => setHoveredSkill(null)}
              />
            );
          })}

          {/* Outer Skill Text Labels */}
          {requiredSkills.map((req, idx) => {
            const labelCoord = getCoordinates(idx, maxLevel + 0.85);
            const best = teamBestLevels[req.skill] || 0;
            const hasGap = best < req.minLevel;
            const isHovered = hoveredSkill === req.skill;

            let textAnchor: 'middle' | 'start' | 'end' = 'middle';
            if (labelCoord.x > center + 15) textAnchor = 'start';
            else if (labelCoord.x < center - 15) textAnchor = 'end';

            return (
              <text
                key={`label-${req.skill}`}
                x={labelCoord.x}
                y={labelCoord.y}
                textAnchor={textAnchor}
                dominantBaseline="central"
                onMouseEnter={() => setHoveredSkill(req.skill)}
                onMouseLeave={() => setHoveredSkill(null)}
                className={`text-[10px] font-semibold transition-colors cursor-pointer ${
                  isHovered
                    ? 'fill-indigo-700 font-bold'
                    : hasGap
                    ? 'fill-amber-600'
                    : 'fill-slate-700'
                }`}
              >
                {req.skill}
              </text>
            );
          })}
        </svg>

        {/* Hovered Skill Detail Tooltip */}
        {hoveredSkill && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg pointer-events-none flex items-center gap-2 whitespace-nowrap z-20">
            <span className="font-semibold">{hoveredSkill}:</span>
            <span>Target L{requiredSkills.find(r => r.skill === hoveredSkill)?.minLevel}</span>
            <span>·</span>
            <span className={(teamBestLevels[hoveredSkill] || 0) < (requiredSkills.find(r => r.skill === hoveredSkill)?.minLevel || 0) ? 'text-amber-300 font-bold' : 'text-emerald-300 font-bold'}>
              Team Best L{teamBestLevels[hoveredSkill] || 0}
            </span>
          </div>
        )}
      </div>

      <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
        <span>Concentric rings represent proficiency Levels 1 through 5</span>
        <span className="text-amber-600 font-medium">Red nodes denote unfilled skill gaps</span>
      </div>
    </div>
  );
};
