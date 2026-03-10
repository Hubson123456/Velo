/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Settings2, 
  Wind, 
  Mountain, 
  Weight, 
  Zap, 
  Info,
  ChevronRight,
  BarChart3,
  Users,
  Bike,
  MapPin,
  Trophy,
  Search,
  X,
  ShieldCheck
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { calculateSpeed, PhysicsParams } from './lib/physics';
import { FAMOUS_CLIMBS, Climb } from './data/climbs';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RiderSetup {
  id: string;
  name: string;
  riderWeight: number;
  bikeWeight: number;
  power: number;
  cda: number;
  crr: number;
  color: string;
}

const COLORS = [
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#14b8a6', // teal-500
  '#6366f1', // indigo-500
  '#a855f7', // purple-500
  '#d946ef', // fuchsia-500
];

const DEFAULT_RIDER: Omit<RiderSetup, 'id' | 'color' | 'name'> = {
  riderWeight: 75,
  bikeWeight: 8,
  power: 250,
  cda: 0.32,
  crr: 0.005,
};

const CDA_PRESETS = [
  { name: 'Time Trial (TT)', value: 0.22 },
  { name: 'Aero Road', value: 0.28 },
  { name: 'Endurance Road', value: 0.32 },
  { name: 'Gravel', value: 0.40 },
  { name: 'MTB (XC)', value: 0.48 },
];

export default function App() {
  const [riders, setRiders] = useState<RiderSetup[]>(() => {
    const saved = localStorage.getItem('velocalc_riders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved riders', e);
      }
    }
    return [
      { ...DEFAULT_RIDER, id: '1', name: 'Rider 1', color: COLORS[0] },
      { ...DEFAULT_RIDER, id: '2', name: 'Rider 2', riderWeight: 85, color: COLORS[1] },
    ];
  });

  const [environment, setEnvironment] = useState(() => {
    const saved = localStorage.getItem('velocalc_env');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved environment', e);
      }
    }
    return {
      gradient: 5,
      windSpeed: 0,
      airDensity: 1.225,
      distance: 10, // km for time calculation
    };
  });

  useEffect(() => {
    localStorage.setItem('velocalc_riders', JSON.stringify(riders));
  }, [riders]);

  useEffect(() => {
    localStorage.setItem('velocalc_env', JSON.stringify(environment));
  }, [environment]);

  const [selectedClimb, setSelectedClimb] = useState<Climb | null>(null);
  const [isClimbSelectorOpen, setIsClimbSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClimbs = FAMOUS_CLIMBS.filter(climb => 
    climb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    climb.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectClimb = (climb: Climb) => {
    setSelectedClimb(climb);
    setEnvironment(prev => ({
      ...prev,
      gradient: climb.avgGradient,
      distance: climb.distance
    }));
    setIsClimbSelectorOpen(false);
  };

  const clearClimb = () => {
    setSelectedClimb(null);
  };

  const addRider = () => {
    if (riders.length >= 20) return;
    const newId = Math.random().toString(36).substr(2, 9);
    const color = COLORS[riders.length % COLORS.length];
    setRiders([...riders, { ...DEFAULT_RIDER, id: newId, name: `Rider ${riders.length + 1}`, color }]);
  };

  const removeRider = (id: string) => {
    if (riders.length <= 1) return;
    setRiders(riders.filter(r => r.id !== id));
  };

  const updateRider = (id: string, updates: Partial<RiderSetup>) => {
    setRiders(riders.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const results = useMemo(() => {
    return riders.map(rider => {
      const speed = calculateSpeed({
        ...rider,
        gradient: environment.gradient,
        windSpeed: environment.windSpeed,
        airDensity: environment.airDensity,
      });
      const timeSeconds = (environment.distance / speed) * 3600;
      const timeMinutes = Math.floor(timeSeconds / 60);
      const timeRemainingSeconds = Math.floor(timeSeconds % 60);

      return {
        ...rider,
        speed,
        timeSeconds,
        timeStr: `${timeMinutes}m ${timeRemainingSeconds}s`,
        wkg: (rider.power / rider.riderWeight).toFixed(2),
      };
    });
  }, [riders, environment]);

  const chartData = useMemo(() => {
    const data = [];
    for (let g = 0; g <= 15; g += 1) {
      const entry: any = { gradient: g };
      riders.forEach(rider => {
        entry[rider.name] = calculateSpeed({
          ...rider,
          gradient: g,
          windSpeed: environment.windSpeed,
          airDensity: environment.airDensity,
        });
      });
      data.push(entry);
    }
    return data;
  }, [riders, environment.windSpeed, environment.airDensity]);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[70%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 blur-lg opacity-50 animate-pulse" />
              <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg">
                <Bike className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-display font-black tracking-tight text-white">VELOCALC</h1>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Performance Engine v2.0</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={addRider}
            disabled={riders.length >= 20}
            className="group relative flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:bg-blue-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Add Athlete</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Virtual Challenge Card - Mobile: 1, Desktop: 1 */}
          <section className="lg:col-span-4 order-1 lg:order-1 relative overflow-hidden rounded-[32px] p-8 bg-gradient-to-br from-slate-900 to-black border border-white/10 shadow-2xl group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
              <Trophy className="w-32 h-32" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="font-display font-bold text-lg text-white">Virtual Challenge</h2>
              </div>

              {selectedClimb ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-display font-black text-white leading-tight">{selectedClimb.name}</h3>
                      <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mt-1">{selectedClimb.location}</p>
                    </div>
                    <button 
                      onClick={clearClimb}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-500 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Distance', value: `${selectedClimb.distance}km` },
                      { label: 'Gradient', value: `${selectedClimb.avgGradient}%` },
                      { label: 'Gain', value: `${selectedClimb.elevationGain}m` }
                    ].map((stat, i) => (
                      <div key={i} className="bg-white/5 p-3 rounded-2xl border border-white/5">
                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</div>
                        <div className="text-sm font-bold text-white">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                  Race against the legends. Select a world-class climb to calculate your split times.
                </p>
              )}

              <button 
                onClick={() => setIsClimbSelectorOpen(true)}
                className="w-full mt-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 group/btn"
              >
                <Search className="w-4 h-4 text-blue-400 group-hover/btn:scale-110 transition-transform" />
                {selectedClimb ? 'Change Route' : 'Select Route'}
              </button>
            </div>
          </section>

          {/* Environment Settings - Mobile: 2, Desktop: 3 */}
          <section className="lg:col-span-4 order-2 lg:order-3 neo-card rounded-[32px] p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <Settings2 className="w-5 h-5 text-indigo-400" />
                </div>
                <h2 className="font-display font-bold text-lg text-white">Environment</h2>
              </div>
              <button 
                onClick={() => setEnvironment({ gradient: 5, windSpeed: 0, airDensity: 1.225, distance: 10 })}
                className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-[0.2em]"
              >
                Reset
              </button>
            </div>

            <div className="space-y-8">
              {!selectedClimb && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Mountain className="w-4 h-4" /> Gradient
                    </label>
                    <span className="text-sm font-mono text-blue-400 font-black">
                      {environment.gradient}%
                    </span>
                  </div>
                  <input 
                    type="range" min="-10" max="25" step="0.5"
                    value={environment.gradient}
                    onChange={(e) => setEnvironment({ ...environment, gradient: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Wind className="w-4 h-4" /> Wind Speed
                  </label>
                  <span className="text-sm font-mono text-indigo-400 font-black">
                    {environment.windSpeed} m/s
                  </span>
                </div>
                <input 
                  type="range" min="-15" max="15" step="0.5"
                  value={environment.windSpeed}
                  onChange={(e) => setEnvironment({ ...environment, windSpeed: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {!selectedClimb && (
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" /> Distance (km)
                  </label>
                  <input 
                    type="number"
                    value={environment.distance}
                    onChange={(e) => setEnvironment({ ...environment, distance: Math.max(0.1, parseFloat(e.target.value) || 0) })}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Athlete Config Grid - Mobile: 3, Desktop: 2 */}
          <div className="lg:col-span-8 order-3 lg:order-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {riders.map((rider) => (
                <motion.div 
                  key={rider.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="neo-card rounded-[32px] p-8 relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-full h-1.5 opacity-50" style={{ backgroundColor: rider.color }} />
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                  
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg"
                        style={{ backgroundColor: rider.color }}
                      >
                        {rider.name.charAt(0)}
                      </div>
                      <input 
                        type="text"
                        value={rider.name}
                        onChange={(e) => updateRider(rider.id, { name: e.target.value })}
                        className="bg-transparent font-display font-black text-xl text-white focus:outline-none focus:ring-b-2 focus:ring-blue-500 w-full"
                      />
                    </div>
                    <button 
                      onClick={() => removeRider(rider.id)}
                      className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6 relative z-10">
                    {[
                      { label: 'Power', icon: Zap, value: rider.power, key: 'power', unit: 'W' },
                      { label: 'Rider', icon: Weight, value: rider.riderWeight, key: 'riderWeight', unit: 'kg' },
                      { label: 'Bike', icon: Bike, iconColor: 'text-indigo-400', value: rider.bikeWeight, key: 'bikeWeight', unit: 'kg' },
                    ].map((field) => (
                      <div key={field.key} className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                          <field.icon className={cn("w-3 h-3", field.iconColor || "text-blue-400")} /> {field.label}
                        </label>
                        <div className="relative">
                          <input 
                            type="number"
                            value={field.value}
                            onChange={(e) => updateRider(rider.id, { [field.key]: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-sm font-black text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600 uppercase">{field.unit}</span>
                        </div>
                      </div>
                    ))}
                    
                    {/* CdA Dropdown */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Wind className="w-3 h-3 text-blue-400" /> Aerodynamics
                      </label>
                      <div className="relative">
                        <select 
                          value={rider.cda}
                          onChange={(e) => updateRider(rider.id, { cda: parseFloat(e.target.value) })}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-sm font-black text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                        >
                          {CDA_PRESETS.map(preset => (
                            <option key={preset.value} value={preset.value} className="bg-[#121214] text-white">
                              {preset.name}
                            </option>
                          ))}
                          {!CDA_PRESETS.some(p => p.value === rider.cda) && (
                            <option value={rider.cda} className="bg-[#121214] text-white">
                              Custom ({rider.cda})
                            </option>
                          )}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronRight className="w-4 h-4 text-slate-600 rotate-90" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Leaderboard - Mobile: 4, Desktop: 4 */}
          <section className="lg:col-span-8 order-4 lg:order-4 space-y-6">
            <div className="flex items-center gap-3 px-4">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="font-display font-bold text-lg text-white">Leaderboard</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {results.sort((a, b) => b.speed - a.speed).map((rider, idx) => (
                  <motion.div 
                    key={rider.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="neo-card rounded-2xl p-5 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-xs font-black text-slate-600 w-4">#{idx + 1}</div>
                      <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: rider.color }} />
                      <div>
                        <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">{rider.name}</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{rider.wkg} W/kg</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-display font-black text-white tracking-tighter">
                        {rider.speed.toFixed(1)}
                        <span className="text-[10px] text-blue-500 ml-1">KM/H</span>
                      </div>
                      <div className="text-xs font-black text-blue-400 uppercase tracking-widest mt-0.5">
                        {rider.timeStr}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* Analytics Section - Mobile: 5, Desktop: 5 */}
          <section className="lg:col-span-12 order-5 lg:order-5 neo-card rounded-[40px] p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="font-display font-black text-2xl text-white tracking-tight">Performance Curve</h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Velocity vs Gradient Analysis</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-full border border-white/5">
                <div className="px-4 py-1.5 rounded-full bg-blue-600 text-[10px] font-black text-white uppercase tracking-widest">Speed (KM/H)</div>
              </div>
            </div>
            
            <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    {riders.map((rider) => (
                      <linearGradient key={`grad-${rider.id}`} id={`color-${rider.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={rider.color} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={rider.color} stopOpacity={0}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis 
                    dataKey="gradient" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                    dy={15}
                    label={{ value: 'GRADIENT %', position: 'insideBottom', offset: -5, fill: '#475569', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                    dx={-15}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [`${value.toFixed(2)} km/h`, name]}
                    labelFormatter={(label: number) => `Gradient ${label}%`}
                    contentStyle={{ 
                      backgroundColor: '#121214', 
                      borderRadius: '24px', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
                      padding: '16px'
                    }}
                    itemStyle={{ fontSize: '12px', fontWeight: 800, padding: '4px 0' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}
                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                  />
                  <Legend 
                    iconType="circle" 
                    wrapperStyle={{ paddingTop: '40px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }} 
                  />
                  {riders.map((rider) => (
                    <Area 
                      key={rider.id}
                      type="monotone" 
                      dataKey={rider.name} 
                      stroke={rider.color} 
                      fillOpacity={1}
                      fill={`url(#color-${rider.id})`}
                      strokeWidth={4}
                      animationDuration={1500}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* About & Terms - Order 6 */}
          <section className="lg:col-span-12 order-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="neo-card rounded-[32px] p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-lg font-display font-black text-white">About Us</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                We are a team of cycling enthusiasts and physics geeks dedicated to bringing professional-grade 
                performance modeling to every rider. Our mission is to help you understand the science 
                behind your speed and optimize your performance for any challenge.
              </p>
            </div>
            <div className="neo-card rounded-[32px] p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-slate-500/10 border border-slate-500/20">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                </div>
                <h3 className="text-lg font-display font-black text-white">Terms & Conditions</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                This application is for informational and simulation purposes only. Calculated results are 
                theoretical estimates based on mathematical models. Always follow local traffic laws and 
                safety guidelines when cycling. We are not responsible for any decisions made based on these simulations.
              </p>
            </div>
          </section>

          {/* Pro Footer - Order 7 */}
          <footer className="lg:col-span-12 order-7 relative overflow-hidden rounded-[40px] p-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-20 -mt-20" />
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-display font-black tracking-tight">Physics Engine</h3>
                </div>
                <p className="text-blue-100 text-sm leading-relaxed font-medium opacity-80">
                  Our computational model solves the cubic power equation using the Newton-Raphson method, 
                  accounting for air density, rolling resistance, and gravitational forces with professional-grade precision.
                </p>
              </div>
              <div className="flex flex-col justify-between items-end text-right">
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-md p-5 rounded-[24px] border border-white/10 inline-block max-w-[280px] text-left">
                    <h4 className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">Pro Insight</h4>
                    <p className="text-xs text-white font-bold leading-snug">
                      Aerodynamics dominate above 30km/h. Below 15km/h on climbs, weight becomes your primary adversary.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-blue-200/40 text-[10px] font-black tracking-[0.2em] mt-8">
                  <span>ρ: 1.225 KG/M³</span>
                  <span>G: 9.80665 M/S²</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </main>

      {/* Climb Selector Modal */}
      <AnimatePresence>
        {isClimbSelectorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsClimbSelectorOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative bg-[#121214] w-full max-w-2xl rounded-[48px] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-10 border-b border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-display font-black text-white tracking-tight">Legendary Routes</h2>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Select your next challenge</p>
                  </div>
                  <button 
                    onClick={() => setIsClimbSelectorOpen(false)}
                    className="p-3 hover:bg-white/5 rounded-full transition-colors group"
                  >
                    <X className="w-6 h-6 text-slate-500 group-hover:text-white" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="text"
                    placeholder="Search routes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-[24px] py-4 pl-14 pr-6 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-white placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                {filteredClimbs.map((climb) => (
                  <button 
                    key={climb.id}
                    onClick={() => selectClimb(climb)}
                    className="w-full group flex items-center gap-6 p-5 rounded-[32px] hover:bg-white/5 border border-transparent hover:border-white/5 transition-all text-left"
                  >
                    <div className="w-32 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-800 relative">
                      <img 
                        src={climb.image} 
                        alt={climb.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-display font-black text-white group-hover:text-blue-400 transition-colors">{climb.name}</h3>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{climb.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-display font-black text-white">{climb.distance}km</div>
                      <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{climb.avgGradient}% AVG</div>
                    </div>
                  </button>
                ))}
                {filteredClimbs.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-slate-500 font-black uppercase tracking-widest">No routes found</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
