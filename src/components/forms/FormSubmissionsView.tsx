'use client';

import React, { useState, useTransition } from 'react';
import { deleteSubmissionAction } from '@/actions/form-actions';
import {
  Users,
  Calendar,
  Clock,
  Download,
  Search,
  Trash2,
  CheckCircle,
  ExternalLink,
  Inbox,
  RefreshCw,
  X,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';

export interface SubmissionItem {
  id: string;
  formId: string;
  submittedAt: string;
  clientTimezone: string;
  answers: {
    id: string;
    fieldId?: string | null;
    label: string;
    type: string;
    answerValue: string;
    jsonValue?: any;
    slotId?: string | null;
  }[];
  appointment?: {
    bookingId: string;
    slotId: string;
    status: string;
    startTime: string;
    endTime: string;
  } | null;
}

interface Props {
  formId: string;
  formTitle: string;
  submissions: SubmissionItem[];
  onRefresh: () => void;
}

export default function FormSubmissionsView({
  formId,
  formTitle,
  submissions: initialSubmissions,
  onRefresh,
}: Props) {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>(initialSubmissions);
  const [search, setSearch] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);
  const [isPending, startTransition] = useTransition();

  // Extract all distinct question columns in the order they appear
  const questionColumns = Array.from(
    new Set(submissions.flatMap((s) => s.answers.map((a) => a.label)))
  );

  // Filter submissions by search term across any answer, id, or date
  const filteredSubmissions = submissions.filter((sub) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    if (sub.id.toLowerCase().includes(q)) return true;
    return sub.answers.some(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.answerValue.toLowerCase().includes(q)
    );
  });

  const handleDeleteSubmission = (subId: string) => {
    if (!confirm('Are you sure you want to delete this submission? If an appointment was booked, its capacity spot will be automatically restored.')) {
      return;
    }

    startTransition(async () => {
      const res = await deleteSubmissionAction(subId);
      if (res.success) {
        setSubmissions((prev) => prev.filter((s) => s.id !== subId));
        if (selectedSubmission?.id === subId) {
          setSelectedSubmission(null);
        }
        onRefresh();
      } else {
        alert(res.error || 'Failed to delete submission');
      }
    });
  };

  const exportToCsv = () => {
    if (submissions.length === 0) return;

    const headers = ['#', 'Submission ID', 'Submitted At (Local)', 'Client Timezone', 'Appointment Slot', ...questionColumns];

    const rows = submissions.map((sub, idx) => {
      const appSlot = sub.appointment
        ? `${new Date(sub.appointment.startTime).toLocaleDateString()} ${new Date(sub.appointment.startTime).toLocaleTimeString()} - ${new Date(sub.appointment.endTime).toLocaleTimeString()}`
        : 'None';

      const answerMap = new Map(sub.answers.map((a) => [a.label, a.answerValue]));

      const values = [
        `"${submissions.length - idx}"`,
        `"${sub.id}"`,
        `"${new Date(sub.submittedAt).toLocaleString()}"`,
        `"${sub.clientTimezone}"`,
        `"${appSlot}"`,
        ...questionColumns.map((col) => `"${(answerMap.get(col) || '').replace(/"/g, '""')}"`),
      ];

      return values.join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${formTitle.replace(/[^a-z0-9]/gi, '_')}_submissions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatSlotTime = (startIso: string, endIso: string) => {
    try {
      const start = new Date(startIso);
      const end = new Date(endIso);
      return `${start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} • ${start.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })} – ${end.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })}`;
    } catch {
      return 'Slot Time';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Form Submissions Table</span>
          </div>
          <h1 className="text-2xl font-black text-white">{formTitle}</h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="p-2.5 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Refresh submissions"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportToCsv}
            disabled={submissions.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-95 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search answers, names, emails, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
          <span>
            Total Submissions: <strong className="text-white">{submissions.length}</strong>
          </span>
          {search && (
            <span>
              Matching: <strong className="text-amber-400">{filteredSubmissions.length}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Submissions Table */}
      {filteredSubmissions.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20 space-y-3">
          <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-300">No submissions found</h3>
            <p className="text-xs text-slate-500">
              {search
                ? 'No responses match your search filter.'
                : 'Responses will appear in this table as soon as users submit the form.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40 shadow-inner">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3.5 text-center w-12">#</th>
                <th className="py-3 px-4 min-w-[150px]">Submitted At</th>
                {questionColumns.map((col) => (
                  <th key={col} className="py-3 px-4 min-w-[160px] max-w-[240px]">
                    {col}
                  </th>
                ))}
                <th className="py-3 px-4 min-w-[180px]">Appointment Slot</th>
                <th className="py-3 px-3 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredSubmissions.map((sub, index) => {
                const answerMap = new Map(sub.answers.map((a) => [a.label, a.answerValue]));

                return (
                  <tr
                    key={sub.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Index */}
                    <td className="py-3.5 px-3.5 text-center font-bold text-slate-400">
                      {filteredSubmissions.length - index}
                    </td>

                    {/* Submitted Date */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                      <div>{new Date(sub.submittedAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        {new Date(sub.submittedAt).toLocaleTimeString()}
                      </div>
                    </td>

                    {/* Dynamic Question Columns */}
                    {questionColumns.map((col) => {
                      const val = answerMap.get(col);
                      return (
                        <td
                          key={col}
                          className="py-3.5 px-4 text-slate-200 font-medium max-w-[240px] truncate"
                          title={val || ''}
                        >
                          {val || <span className="text-slate-600 italic">—</span>}
                        </td>
                      );
                    })}

                    {/* Appointment Slot */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {sub.appointment ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                          <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{formatSlotTime(sub.appointment.startTime, sub.appointment.endTime)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 font-mono">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedSubmission(sub)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="View Full Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubmission(sub.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Delete Submission"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-white">Submission Details</h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  ID: {selectedSubmission.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Submission Time & Client Zone */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Submitted At</span>
                <span className="font-semibold text-white">
                  {new Date(selectedSubmission.submittedAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Client Timezone</span>
                <span className="font-semibold text-amber-400">
                  {selectedSubmission.clientTimezone}
                </span>
              </div>
            </div>

            {/* Appointment Details */}
            {selectedSubmission.appointment && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Reserved Consultation Slot</span>
                </span>
                <div className="text-xs font-bold text-white">
                  {formatSlotTime(
                    selectedSubmission.appointment.startTime,
                    selectedSubmission.appointment.endTime
                  )}
                </div>
                <div className="text-[10px] text-emerald-400 font-medium">
                  Status: {selectedSubmission.appointment.status}
                </div>
              </div>
            )}

            {/* All Answers */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Respondent Answers
              </span>
              <div className="space-y-2">
                {selectedSubmission.answers.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-0.5"
                  >
                    <span className="text-[11px] font-bold text-slate-400 block">
                      {a.label}
                    </span>
                    <div className="text-xs text-white font-medium break-words">
                      {a.answerValue || <em className="text-slate-600">(Unanswered)</em>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
