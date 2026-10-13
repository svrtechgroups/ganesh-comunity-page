'use client';

import React from 'react';
import { FormAnalyticsReport } from '@/types/dynamic-form';
import {
  BarChart3,
  Users,
  Calendar,
  CheckCircle,
  TrendingUp,
  Clock,
  PieChart,
} from 'lucide-react';

interface Props {
  report: FormAnalyticsReport;
}

export default function FormAnalyticsView({ report }: Props) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl">
      {/* Header Overview */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Form Analytics & Response Distributions</span>
          </div>
          <h1 className="text-2xl font-black text-white">{report.formTitle}</h1>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              report.isPublished
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {report.isPublished ? '● Published' : '○ Draft'}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Submissions</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">{report.totalSubmissions}</div>
          <p className="text-[11px] text-slate-500">Immutable normalized answers recorded</p>
        </div>

        <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Last 7 Days</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {report.submissionsLast7Days}
          </div>
          <p className="text-[11px] text-slate-500">Recent response velocity</p>
        </div>

        <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active Form Questions</span>
            <CheckCircle className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">{report.fields.length}</div>
          <p className="text-[11px] text-slate-500">Configured in form schema</p>
        </div>
      </div>

      {/* Field Distribution Breakdowns */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <PieChart className="w-5 h-5 text-amber-400" />
          <span>Question Response Breakdowns</span>
        </h2>

        {report.fields.map((field) => (
          <div
            key={field.fieldId}
            className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">{field.fieldLabel}</h3>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded-full">
                  {field.fieldType}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                {field.totalAnswers} response{field.totalAnswers === 1 ? '' : 's'}
              </div>
            </div>

            {/* Choice distribution bars */}
            {field.choiceDistribution && field.choiceDistribution.length > 0 && (
              <div className="space-y-3 pt-2">
                {field.choiceDistribution.map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span className="font-medium">{item.choice}</span>
                      <span className="text-slate-400 font-mono">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Appointment utilization */}
            {field.appointmentStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Total Slots</span>
                  <span className="text-lg font-bold text-white">
                    {field.appointmentStats.totalSlots}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Total Capacity</span>
                  <span className="text-lg font-bold text-white">
                    {field.appointmentStats.totalCapacity}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Booked</span>
                  <span className="text-lg font-bold text-amber-400">
                    {field.appointmentStats.totalBooked}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Utilization</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {field.appointmentStats.utilizationPercentage}%
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
