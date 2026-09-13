'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NEWS_DATA } from '@/data/news';
import { EventItem, LeadershipMember, BlogPost } from '@/lib/types';
import { Search, Calendar, Users, FileText } from 'lucide-react';

export default function GlobalSearchPage() {
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [leadership, setLeadership] = useState<LeadershipMember[]>([]);
  const [news, setNews] = useState<BlogPost[]>(NEWS_DATA);

  useEffect(() => {
    fetch('/api/leadership')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setLeadership(data.data);
        }
      })
      .catch(() => {});

    fetch('/api/admin/events')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setEvents(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const matchedEvents = query
    ? events.filter(e => e.title.toLowerCase().includes(query.toLowerCase()) || e.venue.toLowerCase().includes(query.toLowerCase()) || e.description.toLowerCase().includes(query.toLowerCase()))
    : [];

  const matchedLeadership = query
    ? leadership.filter(l => l.name.toLowerCase().includes(query.toLowerCase()) || l.designation.toLowerCase().includes(query.toLowerCase()) || l.category.toLowerCase().includes(query.toLowerCase()))
    : [];

  const matchedNews = query
    ? news.filter(n => n.title.toLowerCase().includes(query.toLowerCase()) || n.excerpt.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Site-wide Global Search
        </h1>
        <p className="text-xs text-slate-500">
          Find events, committee members, press articles, and governing documents across MITRA.
        </p>
      </div>

      <div className="relative max-w-2xl mx-auto">
        <Search className="w-6 h-6 text-mitra-gold absolute left-4 top-4" />
        <input
          type="text"
          autoFocus
          placeholder="Search for Ugadi, Kuchipudi, Chairman, Counselling, Membership..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-mitra-gold/50 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white shadow-xl focus:outline-none focus:border-mitra-red"
        />
      </div>

      {query && (
        <div className="space-y-8 pt-4">
          
          {/* Matched Events */}
          {matchedEvents.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase text-mitra-red dark:text-mitra-gold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Events ({matchedEvents.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {matchedEvents.map((evt) => (
                  <Link key={evt.id} href={`/events/${evt.id}`} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-mitra-gold transition-colors block">
                    <span className="text-[10px] bg-mitra-red/10 text-mitra-red font-bold px-2 py-0.5 rounded">{evt.category}</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{evt.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{evt.date} &bull; {evt.venue}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matched Leadership */}
          {matchedLeadership.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase text-mitra-red dark:text-mitra-gold flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Leadership ({matchedLeadership.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {matchedLeadership.map((mem) => (
                  <Link key={mem.id} href="/leadership" className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-mitra-gold transition-colors block">
                    <span className="text-[10px] bg-mitra-gold/20 text-mitra-navy font-bold px-2 py-0.5 rounded">{mem.category}</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{mem.name}</h3>
                    <p className="text-xs text-mitra-red font-semibold">{mem.designation}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matched News */}
          {matchedNews.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase text-mitra-red dark:text-mitra-gold flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>News & Articles ({matchedNews.length})</span>
              </h2>
              <div className="space-y-2">
                {matchedNews.map((n) => (
                  <Link key={n.id} href={`/news/${n.slug}`} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-mitra-gold transition-colors block">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{n.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {matchedEvents.length === 0 && matchedLeadership.length === 0 && matchedNews.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs font-semibold">
              No results found for "{query}". Try searching for 'Ugadi', 'Counselling', 'Executive', or 'Patrika'.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
