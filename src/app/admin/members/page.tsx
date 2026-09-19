'use client';

import { useState, useEffect } from 'react';
import { Member } from '@/lib/types';
import MembershipCardModal from '@/components/MembershipCardModal';
import NotifyMembersModal from '@/components/admin/NotifyMembersModal';
import { Search, Download, ShieldCheck, QrCode, ChevronLeft, ChevronRight, Users, RefreshCw, Send } from 'lucide-react';

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState('');
  const [passModalMember, setPassModalMember] = useState<Member | null>(null);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/members', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setMembers(data.data);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Safe search filter
  const filteredMembers = members.filter((m) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;

    const nameStr = (m.fullName || m.name || '').toLowerCase();
    const emailStr = (m.email || '').toLowerCase();
    const idStr = (m.id || '').toLowerCase();
    const tierStr = (m.tier || '').toLowerCase();
    const phoneStr = (m.phone || '').toLowerCase();

    return (
      nameStr.includes(q) ||
      emailStr.includes(q) ||
      idStr.includes(q) ||
      tierStr.includes(q) ||
      phoneStr.includes(q)
    );
  });

  // Reset to page 1 on query change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, itemsPerPage]);

  // Pagination calculations
  const totalItems = filteredMembers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

  const exportMembersCSV = () => {
    let csv = 'Member ID,Full Name,Email,Phone,Tier,Status,Start Date,Expiry Date\n';
    filteredMembers.forEach((m) => {
      const memName = (m.fullName || m.name || 'Member').replace(/"/g, '""');
      const memEmail = (m.email || '').replace(/"/g, '""');
      const memPhone = (m.phone || '').replace(/"/g, '""');
      const memTier = (m.tier || 'Annual Member').replace(/"/g, '""');
      const memStatus = (m.status || 'Active').replace(/"/g, '""');
      const sDate = m.startDate || '';
      const eDate = m.expiryDate || 'Lifetime';

      csv += `"${m.id}","${memName}","${memEmail}","${memPhone}","${memTier}","${memStatus}","${sDate}","${eDate}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MITRA_Members_List_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-mitra-gold" />
            <h1 className="text-2xl font-black text-white">Membership Database Manager</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Search member records, verify digital passes, and export membership lists to CSV.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setNotifyModalOpen(true)}
            className="bg-gradient-to-r from-mitra-gold to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Notify Members ({members.length})</span>
          </button>

          <button
            onClick={fetchMembers}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            title="Refresh Members"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={exportMembersCSV}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV ({filteredMembers.length})</span>
          </button>
        </div>
      </div>

      {/* Controls Bar: Search & Items Per Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by ID, name, email, phone, or tier..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-mitra-gold focus:outline-none"
          />
        </div>

        {/* Rows per page selector */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-mitra-gold focus:outline-none font-semibold"
          >
            <option value={10}>10 rows</option>
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Member ID</th>
              <th className="p-4">Full Name &amp; Contact</th>
              <th className="p-4">Tier</th>
              <th className="p-4">Status</th>
              <th className="p-4">Start / Expiry Date</th>
              <th className="p-4 text-right">Digital Pass</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {paginatedMembers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                  {loading ? 'Loading members from database...' : 'No members found matching your search.'}
                </td>
              </tr>
            ) : (
              paginatedMembers.map((mem) => {
                const displayName = mem.fullName || mem.name || 'Member Devotee';
                const displayTier = mem.tier || 'Annual Member';
                const displayStatus = mem.status || 'Active';
                return (
                  <tr key={mem.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-mitra-gold">{mem.id}</td>
                    <td className="p-4 space-y-0.5">
                      <div className="font-bold text-white text-sm">{displayName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{mem.email}</div>
                      {mem.phone && (
                        <div className="text-[10px] text-slate-500">{mem.phone}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="bg-mitra-navy text-mitra-gold border border-mitra-gold/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {displayTier}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{displayStatus}</span>
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">
                      <span className="block text-[11px] font-medium">{mem.startDate || '2026-01-01'}</span>
                      <span className="block text-[10px] text-slate-500">Exp: {mem.expiryDate || 'Lifetime'}</span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setPassModalMember({ ...mem, name: displayName })}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5 text-mitra-gold" />
                        <span>Pass</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Controls */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{startIndex + 1}</strong> to{' '}
            <strong className="text-white">{endIndex}</strong> of{' '}
            <strong className="text-white">{totalItems}</strong> members
          </div>

          <div className="flex items-center gap-1.5">
            {/* Previous Page Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validCurrentPage === 1}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - validCurrentPage) <= 1)
                .map((pageNum, idx, arr) => {
                  const showEllipsis = idx > 0 && pageNum - arr[idx - 1] > 1;
                  return (
                    <div key={pageNum} className="flex items-center">
                      {showEllipsis && <span className="px-1 text-slate-600">...</span>}
                      <button
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-[32px] h-8 px-2.5 rounded-xl font-bold transition-all text-xs ${
                          validCurrentPage === pageNum
                            ? 'bg-mitra-gold text-slate-950 font-black shadow'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    </div>
                  );
                })}
            </div>

            {/* Next Page Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage === totalPages}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Digital Membership Pass Modal */}
      {passModalMember && (
        <MembershipCardModal member={passModalMember} onClose={() => setPassModalMember(null)} />
      )}

      {/* Notify Members Broadcast Modal */}
      <NotifyMembersModal
        isOpen={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
        totalMembersCount={members.length}
        onSuccess={fetchMembers}
      />

    </div>
  );
}
