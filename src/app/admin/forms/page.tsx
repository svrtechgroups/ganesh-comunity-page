'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  listAdminFormsAction,
  getFormDetailsAction,
  deleteFormAction,
  toggleFormPublishAction,
  getFormAnalyticsAction,
  getFormSubmissionsAction,
} from '@/actions/form-actions';
import DynamicFormBuilder from '@/components/forms/DynamicFormBuilder';
import DynamicFormRenderer from '@/components/forms/DynamicFormRenderer';
import FormAnalyticsView from '@/components/forms/FormAnalyticsView';
import FormSubmissionsView, { SubmissionItem } from '@/components/forms/FormSubmissionsView';
import { FormConfigInput, FormAnalyticsReport } from '@/types/dynamic-form';
import {
  ClipboardList,
  Plus,
  Eye,
  Edit,
  Trash2,
  BarChart2,
  Share2,
  Check,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  Calendar,
  Layers,
  Inbox,
} from 'lucide-react';

interface FormSummary {
  id: string;
  title: string;
  description?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  submissionCount: number;
  fieldCount: number;
  hasAppointments: boolean;
}

export default function AdminFormsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'builder' | 'preview' | 'analytics' | 'submissions'>('list');
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<FormConfigInput | null>(null);
  const [analyticsReport, setAnalyticsReport] = useState<FormAnalyticsReport | null>(null);
  const [submissionsList, setSubmissionsList] = useState<SubmissionItem[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>('');
  const [selectedFormTitle, setSelectedFormTitle] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadForms = async () => {
    setLoading(true);
    const res = await listAdminFormsAction();
    if (res.success && res.forms) {
      setForms(res.forms);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadForms();
  }, []);

  const handleCreateNew = () => {
    setSelectedForm(null);
    setActiveTab('builder');
  };

  const handleEdit = async (formId: string) => {
    setLoading(true);
    const res = await getFormDetailsAction(formId);
    if (res.success && res.form) {
      setSelectedForm(res.form);
      setActiveTab('builder');
    }
    setLoading(false);
  };

  const handlePreview = async (formId: string) => {
    setLoading(true);
    const res = await getFormDetailsAction(formId);
    if (res.success && res.form) {
      setSelectedForm(res.form);
      setActiveTab('preview');
    }
    setLoading(false);
  };

  const handleViewAnalytics = async (formId: string) => {
    setLoading(true);
    const res = await getFormAnalyticsAction(formId);
    if (res.success && res.data) {
      setAnalyticsReport(res.data);
      setActiveTab('analytics');
    }
    setLoading(false);
  };

  const handleViewSubmissions = async (formId: string, formTitle: string) => {
    setLoading(true);
    setSelectedFormId(formId);
    setSelectedFormTitle(formTitle);
    const res = await getFormSubmissionsAction(formId);
    if (res.success && res.submissions) {
      setSubmissionsList(res.submissions);
      setActiveTab('submissions');
    }
    setLoading(false);
  };

  const handleDelete = (formId: string) => {
    if (!confirm('Are you sure you want to delete this form? All submissions and slots will be permanently removed.')) {
      return;
    }
    startTransition(async () => {
      await deleteFormAction(formId);
      await loadForms();
    });
  };

  const handleTogglePublish = (formId: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleFormPublishAction(formId, !currentStatus);
      await loadForms();
    });
  };

  const copyShareLink = (formId: string) => {
    const url = `${window.location.origin}/forms/${formId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(formId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E65C00]/20 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E65C00] to-[#FF7A00] text-white flex items-center justify-center shadow-md">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#3D1A00] font-cinzel">
              Appointment Studio
            </h1>
            <p className="text-xs text-[#6B3A2A]">
              Create custom registration forms, configure atomic appointment booking, and monitor choice analytics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab !== 'list' && (
            <button
              onClick={() => {
                setActiveTab('list');
                loadForms();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to All Forms</span>
            </button>
          )}

          {activeTab === 'list' && (
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 bg-gradient-to-r from-[#E65C00] to-[#FF7A00] text-white font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm hover:brightness-105 transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Form</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#6B3A2A]">
              Managed Forms ({forms.length})
            </span>
            <button
              onClick={loadForms}
              disabled={loading}
              className="flex items-center gap-1 text-xs text-[#E65C00] font-bold hover:underline"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-[#E65C00]/10">
              Loading dynamic forms...
            </div>
          ) : forms.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-[#E65C00]/30 space-y-4">
              <ClipboardList className="w-10 h-10 text-amber-500 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#3D1A00]">No forms found</h3>
                <p className="text-xs text-[#6B3A2A]">
                  Get started by creating your first dynamic form with custom questions and appointment slots.
                </p>
              </div>
              <button
                onClick={handleCreateNew}
                className="bg-[#E65C00] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm"
              >
                + Create Form Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {forms.map((f) => (
                <div
                  key={f.id}
                  className="bg-white rounded-3xl p-5 border border-[#E65C00]/20 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                          f.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {f.isPublished ? '● Published' : '○ Draft'}
                      </span>

                      {f.hasAppointments && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Appointments</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-[#3D1A00] leading-snug line-clamp-2">
                      {f.title}
                    </h3>

                    {f.description && (
                      <p className="text-xs text-[#6B3A2A] line-clamp-2 leading-relaxed">
                        {f.description}
                      </p>
                    )}
                  </div>

                  {/* Metadata Counters */}
                  <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Questions</span>
                      <span className="text-base font-extrabold text-[#3D1A00]">{f.fieldCount}</span>
                    </div>
                    <div
                      onClick={() => handleViewSubmissions(f.id, f.title)}
                      className="cursor-pointer hover:bg-emerald-50 rounded-xl transition-colors"
                      title="Click to view responses"
                    >
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Submissions</span>
                      <span className="text-base font-extrabold text-emerald-600 underline decoration-dotted">{f.submissionCount}</span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-4 gap-1.5 text-xs">
                      <button
                        onClick={() => handleEdit(f.id)}
                        className="flex items-center justify-center gap-1 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                        title="Edit Schema"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handlePreview(f.id)}
                        className="flex items-center justify-center gap-1 p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#E65C00] font-bold transition-colors"
                        title="Preview Form"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Test</span>
                      </button>

                      <button
                        onClick={() => handleViewAnalytics(f.id)}
                        className="flex items-center justify-center gap-1 p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold transition-colors"
                        title="Analytics Report"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>Stats</span>
                      </button>

                      <button
                        onClick={() => handleViewSubmissions(f.id, f.title)}
                        className="flex items-center justify-center gap-1 p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold transition-colors"
                        title="View Submissions Data"
                      >
                        <Inbox className="w-3.5 h-3.5" />
                        <span>Data ({f.submissionCount})</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                      <button
                        onClick={() => copyShareLink(f.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E65C00] hover:underline"
                      >
                        {copiedId === f.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Share2 className="w-3 h-3" />}
                        <span>{copiedId === f.id ? 'Copied link!' : 'Copy Respondent URL'}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTogglePublish(f.id, f.isPublished)}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
                        >
                          {f.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={() => handleDelete(f.id)}
                          className="text-[11px] font-bold text-rose-500 hover:text-rose-700 p-1"
                          title="Delete Form"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Builder Tab */}
      {activeTab === 'builder' && (
        <DynamicFormBuilder
          initialForm={selectedForm || undefined}
          onSaved={() => {
            loadForms();
          }}
        />
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && selectedForm && (
        <div className="space-y-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-[#E65C00] font-semibold flex items-center justify-between">
            <span>Live Interactive Preview Mode: You can test validations, timezone slot pickers, and submissions.</span>
            <button
              onClick={() => copyShareLink(selectedForm.id || '')}
              className="font-bold underline"
            >
              Open Standalone URL
            </button>
          </div>
          <DynamicFormRenderer
            formId={selectedForm.id || ''}
            title={selectedForm.title}
            description={selectedForm.description}
            fields={selectedForm.fields}
          />
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analyticsReport && (
        <FormAnalyticsView report={analyticsReport} />
      )}

      {/* Submissions Tab */}
      {activeTab === 'submissions' && (
        <FormSubmissionsView
          formId={selectedFormId}
          formTitle={selectedFormTitle}
          submissions={submissionsList}
          onRefresh={() => handleViewSubmissions(selectedFormId, selectedFormTitle)}
        />
      )}
    </div>
  );
}
