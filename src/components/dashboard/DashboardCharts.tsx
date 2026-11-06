'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowUpRight, Laptop, Server, Network, Shield, Cpu, Layers } from 'lucide-react';

export interface CategoryMetric {
  id: string;
  name: string;
  count: number;
}

export interface DepartmentMetric {
  id: string;
  name: string;
  count: number;
}

export interface StatusMetric {
  name: string;
  label: string;
  count: number;
  color: string;
  statusCode: string;
}

interface DashboardChartsProps {
  totalAssets: number;
  categoryData: CategoryMetric[];
  departmentData: DepartmentMetric[];
  statusData: StatusMetric[];
}

const CATEGORY_COLORS = [
  '#4f46e5', // Indigo (Laptops)
  '#06b6d4', // Cyan (Workstations)
  '#10b981', // Emerald (Switches)
  '#f59e0b', // Amber (Access Points)
  '#8b5cf6', // Violet (Servers)
  '#ec4899', // Pink (Displays)
  '#0ea5e9', // Sky (Security/Firewalls)
];

export function DashboardCharts({
  totalAssets,
  categoryData,
  departmentData,
  statusData,
}: DashboardChartsProps) {
  const [activeTab, setActiveTab] = useState<'category' | 'status' | 'department'>('category');

  // Format data for currently selected tab
  let currentChartData: { name: string; count: number; color?: string; url?: string }[] = [];

  if (activeTab === 'category') {
    currentChartData = categoryData.map((c, i) => ({
      name: c.name,
      count: c.count,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      url: `/assets?category=${c.id}`,
    }));
  } else if (activeTab === 'status') {
    currentChartData = statusData.map((s) => ({
      name: s.label,
      count: s.count,
      color: s.color,
      url: `/assets?status=${s.statusCode}`,
    }));
  } else {
    currentChartData = departmentData.map((d, i) => ({
      name: d.name,
      count: d.count,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      url: `/assets?department=${d.id}`,
    }));
  }

  // Calculate Fleet Utilization Rate
  const assignedCount = statusData.find((s) => s.statusCode === 'ASSIGNED')?.count || 0;
  const availableCount = statusData.find((s) => s.statusCode === 'AVAILABLE')?.count || 0;
  const utilizationRate = totalAssets > 0 ? Math.round((assignedCount / totalAssets) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Main Interactive Analytics Chart (7 Columns) */}
      <Card className="lg:col-span-7 flex flex-col justify-between border-slate-200/90 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600" />
                <CardTitle className="text-base font-bold text-slate-900">
                  Distribusi & Alokasi Perangkat IT
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Statistik penyebaran perangkat keras IT enterprise secara berkala
              </CardDescription>
            </div>

            {/* Interactive Segment Switcher Tabs */}
            <div className="flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200/80 text-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('category')}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  activeTab === 'category'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kategori IT
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('status')}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  activeTab === 'status'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Status
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('department')}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  activeTab === 'department'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Divisi
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3 flex-1">
          <div className="h-72 w-full pt-2">
            {currentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={currentChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    allowDecimals={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={155}
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const percent = totalAssets > 0 ? ((data.count / totalAssets) * 100).toFixed(1) : 0;
                        return (
                          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs space-y-1">
                            <div className="font-semibold text-slate-800">{data.name}</div>
                            <div className="flex items-center justify-between gap-4 text-slate-600">
                              <span>Jumlah Unit:</span>
                              <span className="font-bold text-indigo-600">{data.count} unit</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-slate-500 text-[11px]">
                              <span>Porsi Armada:</span>
                              <span className="font-medium text-slate-700">{percent}%</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[0, 6, 6, 0]}
                    barSize={20}
                  >
                    {currentChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                Belum ada data inventaris
              </div>
            )}
          </div>
        </CardContent>

        <div className="border-t border-slate-100 px-6 py-3 bg-slate-50/50 rounded-b-xl flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-indigo-500" />
            <span>Tingkat Utilisasi Aset: <strong className="text-slate-800">{utilizationRate}%</strong> ({assignedCount} unit aktif)</span>
          </div>
          <Link
            href="/assets"
            className="font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
          >
            Buka Inventaris
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Card>

      {/* 2. IT Fleet Lifecycle & Health Status (5 Columns) */}
      <Card className="lg:col-span-5 flex flex-col justify-between border-slate-200/90 shadow-xs">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900">
              Siklus Hidup & Kesiapan Stok
            </CardTitle>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
              {availableCount} Unit Ready
            </span>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Ketersediaan perangkat untuk kebutuhan operasional
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-2">
          {/* Donut Chart with Centered Total Metric */}
          <div className="relative h-48 w-full flex items-center justify-center">
            {totalAssets > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number, name: string) => [`${val} unit`, name]}
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Badge in the Donut */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold tracking-tight text-slate-900 leading-none">
                    {totalAssets}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
                    Total Unit IT
                  </span>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                Belum ada data status
              </div>
            )}
          </div>

          {/* Clean Interactive Status Breakdown List (NO ugly clipped legends) */}
          <div className="mt-3 space-y-2">
            {statusData.map((s) => {
              const pct = totalAssets > 0 ? Math.round((s.count / totalAssets) * 100) : 0;
              return (
                <Link
                  key={s.statusCode}
                  href={`/assets?status=${s.statusCode}`}
                  className="group flex items-center justify-between rounded-lg p-2 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full ring-2 ring-white shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-xs font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                      {s.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden hidden sm:block">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: s.color }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 min-w-[48px] text-right">
                      {s.count} <span className="text-[10px] font-normal text-slate-400">({pct}%)</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>

        <div className="border-t border-slate-100 px-6 py-3 bg-slate-50/50 rounded-b-xl flex items-center justify-between text-xs">
          <span className="text-slate-500">Stok Buffer IT: <strong>{availableCount} unit</strong></span>
          <Link
            href="/transactions/checkout"
            className="font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
          >
            Checkout Sekarang
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Card>
    </div>
  );
}
