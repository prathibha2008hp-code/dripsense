import React, { useState } from 'react';
import { Compass, Maximize2, RotateCcw } from 'lucide-react';

interface OrientationCubeProps {
  roll: number;
  pitch: number;
}

export const OrientationCube: React.FC<OrientationCubeProps> = ({ roll, pitch }) => {
  const [viewAngle, setViewAngle] = useState<{ x: number; y: number }>({ x: 15, y: -25 });
  const [isManualOrbit, setIsManualOrbit] = useState(false);

  // Combine live sensor roll/pitch with base isometric perspective angle
  const transformStyle = {
    transform: `rotateX(${viewAngle.x - pitch}deg) rotateY(${viewAngle.y}deg) rotateZ(${-roll}deg)`,
  };

  const resetView = () => {
    setViewAngle({ x: 15, y: -25 });
    setIsManualOrbit(false);
  };

  return (
    <div className="bg-[#141b34] rounded-2xl p-5 border border-slate-800/80 shadow-lg shadow-black/20 flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
            <Compass className="w-4 h-4 text-[#4cc9f0]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#e8ecf8]">3D Attitude Orientation</h3>
            <p className="text-[11px] text-[#8a94b8]">Pure CSS 3D Euler Gimbal</p>
          </div>
        </div>

        <button
          onClick={resetView}
          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-[#8a94b8] hover:text-white transition text-xs flex items-center gap-1 border border-slate-700/40"
          title="Reset Camera Angle"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="text-[11px]">Reset View</span>
        </button>
      </div>

      {/* 3D Viewport Stage */}
      <div className="relative w-full h-[220px] flex items-center justify-center overflow-hidden rounded-xl bg-[#0b1020]/80 border border-slate-800/60 [perspective:700px]">
        {/* Subtle background coordinate grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

        {/* 3D Cube Container */}
        <div
          className="relative w-28 h-28 [transform-style:preserve-3d] transition-transform duration-75 ease-out"
          style={transformStyle}
        >
          {/* FRONT Face */}
          <div
            className="absolute inset-0 w-28 h-28 border border-[#4cc9f0]/80 bg-[#141b34]/90 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-2 text-center shadow-[inset_0_0_15px_rgba(76,201,240,0.25)] select-none"
            style={{ transform: 'translateZ(56px)' }}
          >
            <span className="text-[10px] font-bold tracking-widest text-[#4cc9f0]">FRONT</span>
            <span className="text-[9px] text-[#8a94b8] font-mono">+Y Axis</span>
            <div className="w-6 h-6 my-1 rounded bg-[#0b1020] border border-cyan-500/40 flex items-center justify-center">
              <span className="text-[8px] font-mono text-cyan-300">MPU</span>
            </div>
            <div className="w-4 h-0.5 bg-[#4cc9f0] rounded"></div>
          </div>

          {/* BACK Face */}
          <div
            className="absolute inset-0 w-28 h-28 border border-slate-700/80 bg-[#0f172a]/90 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-2 text-center shadow-[inset_0_0_15px_rgba(30,41,59,0.5)] select-none"
            style={{ transform: 'rotateY(180deg) translateZ(56px)' }}
          >
            <span className="text-[10px] font-bold tracking-widest text-slate-400">BACK</span>
            <span className="text-[9px] text-slate-500 font-mono">-Y Axis</span>
          </div>

          {/* RIGHT Face */}
          <div
            className="absolute inset-0 w-28 h-28 border border-[#f72585]/80 bg-[#1e132c]/90 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-2 text-center shadow-[inset_0_0_15px_rgba(247,37,133,0.25)] select-none"
            style={{ transform: 'rotateY(90deg) translateZ(56px)' }}
          >
            <span className="text-[10px] font-bold tracking-widest text-[#f72585]">RIGHT</span>
            <span className="text-[9px] text-[#f72585]/70 font-mono">+X Axis</span>
            <span className="text-[9px] text-slate-400 mt-1 font-mono">PITCH</span>
          </div>

          {/* LEFT Face */}
          <div
            className="absolute inset-0 w-28 h-28 border border-slate-700/80 bg-[#0f172a]/90 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-2 text-center select-none"
            style={{ transform: 'rotateY(-90deg) translateZ(56px)' }}
          >
            <span className="text-[10px] font-bold tracking-widest text-slate-400">LEFT</span>
            <span className="text-[9px] text-slate-500 font-mono">-X Axis</span>
          </div>

          {/* TOP Face */}
          <div
            className="absolute inset-0 w-28 h-28 border border-[#b8f34c]/80 bg-[#162722]/90 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-2 text-center shadow-[inset_0_0_15px_rgba(184,243,76,0.25)] select-none"
            style={{ transform: 'rotateX(90deg) translateZ(56px)' }}
          >
            <span className="text-[10px] font-bold tracking-widest text-[#b8f34c]">TOP</span>
            <span className="text-[9px] text-[#b8f34c]/80 font-mono">+Z Normal</span>
            <div className="w-5 h-5 mt-1 border-2 border-[#b8f34c] rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#b8f34c] rounded-full"></div>
            </div>
          </div>

          {/* BOTTOM Face */}
          <div
            className="absolute inset-0 w-28 h-28 border border-slate-700/80 bg-[#090d1a]/95 rounded-lg flex flex-col items-center justify-center p-2 text-center select-none"
            style={{ transform: 'rotateX(-90deg) translateZ(56px)' }}
          >
            <span className="text-[10px] font-bold tracking-widest text-slate-500">BOTTOM</span>
            <span className="text-[9px] text-slate-600 font-mono">-Z Plane</span>
          </div>
        </div>

        {/* Gimbal crosshair guides */}
        <div className="absolute bottom-2 left-3 flex items-center gap-3 text-[10px] font-mono text-[#8a94b8] bg-[#0b1020]/90 px-2 py-1 rounded-md border border-slate-800">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#4cc9f0]"></span>
            Roll: <strong className="text-white">{roll.toFixed(1)}°</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#f72585]"></span>
            Pitch: <strong className="text-white">{pitch.toFixed(1)}°</strong>
          </span>
        </div>

        {/* Orientation level status */}
        <div className="absolute top-2 right-3 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300">
          {Math.abs(roll) < 5 && Math.abs(pitch) < 5 ? (
            <span className="text-[#b8f34c] font-semibold">● Level</span>
          ) : (
            <span className="text-[#4cc9f0]">● Tilted</span>
          )}
        </div>
      </div>

      {/* Axis Reference Footer */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/60 text-center">
        <div className="bg-slate-900/40 p-1.5 rounded-lg border border-slate-800/40">
          <span className="text-[10px] text-[#4cc9f0] font-semibold block">X (Pitch)</span>
          <span className="text-xs font-mono font-bold text-slate-200">{pitch.toFixed(1)}°</span>
        </div>
        <div className="bg-slate-900/40 p-1.5 rounded-lg border border-slate-800/40">
          <span className="text-[10px] text-[#f72585] font-semibold block">Y (Roll)</span>
          <span className="text-xs font-mono font-bold text-slate-200">{roll.toFixed(1)}°</span>
        </div>
        <div className="bg-slate-900/40 p-1.5 rounded-lg border border-slate-800/40">
          <span className="text-[10px] text-[#b8f34c] font-semibold block">Z (Normal)</span>
          <span className="text-xs font-mono font-bold text-slate-200">9.8 m/s²</span>
        </div>
      </div>
    </div>
  );
};
