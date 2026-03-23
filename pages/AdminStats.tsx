import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface AdminStatsProps {
  user: User;
}

interface Stats {
  totals: {
    members: number;
    publications: number;
    blogs: number;
    forums: number;
    testimonials: number;
    services: number;
    requests: number;
    messages: number;
    connections: number;
    transactions: number;
    creditsCirculation: number;
    activeThisWeek: number;
  };
  membersPerDay: { date: string; count: string }[];
  topMembers: { uid: string; name: string; avatar: string; department: string; score: number }[];
  recentMembers: { uid: string; name: string; avatar: string; department: string; createdAt: string }[];
  blogCategories: { category: string; count: string }[];
}

const StatCard: React.FC<{ label: string; value: number | string; icon: string; color: string; sub?: string }> = ({ label, value, icon, color, sub }) => (
  <div className={`bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition`}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-2xl">{icon}</span>
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${color}`}>{sub || '↑'}</span>
    </div>
    <p className="text-3xl font-bold text-slate-900">{value}</p>
    <p className="text-sm text-slate-500 mt-1 font-medium">{label}</p>
  </div>
);

const MiniBar: React.FC<{ value: number; max: number; color: string }> = ({ value, max, color }) => (
  <div className="w-full bg-slate-100 rounded-full h-2">
    <div className={`h-2 rounded-full ${color}`} style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
  </div>
);

const AdminStats: React.FC<AdminStatsProps> = ({ user }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: 'Bearer ' + token }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          setError('Accès refusé ou erreur serveur');
        }
      } catch(e) {
        setError('Erreur de connexion');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-spin">⚙️</div>
        <p className="text-slate-500 font-medium">Chargement des statistiques...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    </div>
  );

  if (!stats) return null;

  const maxScore = Math.max(...stats.topMembers.map(m => m.score), 1);
  const maxDay = Math.max(...stats.membersPerDay.map(d => parseInt(d.count)), 1);
  const maxCat = Math.max(...stats.blogCategories.map(c => parseInt(c.count)), 1);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold text-slate-900">Tableau de Bord Admin</h1>
        <p className="text-slate-500 mt-2">Vue d'ensemble de la communauté Bourse du Temps</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Membres inscrits" value={stats.totals.members} icon="👥" color="bg-blue-50 text-blue-600" sub="Total" />
        <StatCard label="Actifs cette semaine" value={stats.totals.activeThisWeek} icon="🔥" color="bg-orange-50 text-orange-600" sub="7j" />
        <StatCard label="Publications" value={stats.totals.publications} icon="📝" color="bg-green-50 text-green-600" sub="Total" />
        <StatCard label="Messages envoyés" value={stats.totals.messages} icon="💬" color="bg-purple-50 text-purple-600" sub="Total" />
        <StatCard label="Services proposés" value={stats.totals.services} icon="🛠️" color="bg-yellow-50 text-yellow-600" sub="Total" />
        <StatCard label="Demandes publiées" value={stats.totals.requests} icon="📋" color="bg-pink-50 text-pink-600" sub="Total" />
        <StatCard label="Connexions établies" value={stats.totals.connections} icon="🔗" color="bg-teal-50 text-teal-600" sub="Total" />
        <StatCard label="Crédits en circulation" value={stats.totals.creditsCirculation} icon="⏰" color="bg-indigo-50 text-indigo-600" sub="Total" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Publications breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-5 text-lg">Publications par type</h2>
          <div className="space-y-4">
            {[
              { label: 'Blog', value: stats.totals.blogs, color: 'bg-blue-500', total: stats.totals.publications },
              { label: 'Forum', value: stats.totals.forums, color: 'bg-green-500', total: stats.totals.publications },
              { label: 'Témoignages', value: stats.totals.testimonials, color: 'bg-purple-500', total: stats.totals.publications },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-slate-600">{item.label}</span>
                  <span className="text-sm font-bold text-slate-800">{item.value}</span>
                </div>
                <MiniBar value={item.value} max={item.total} color={item.color} />
              </div>
            ))}
          </div>
        </div>

        {/* Blog categories */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-5 text-lg">Catégories Blog</h2>
          {stats.blogCategories.length === 0 ? (
            <p className="text-slate-400 text-sm italic">Aucune publication</p>
          ) : (
            <div className="space-y-4">
              {stats.blogCategories.map(cat => (
                <div key={cat.category}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-slate-600">{cat.category || 'Non catégorisé'}</span>
                    <span className="text-sm font-bold text-slate-800">{cat.count}</span>
                  </div>
                  <MiniBar value={parseInt(cat.count)} max={maxCat} color="bg-blue-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exchanges summary */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-5 text-lg">Échanges & Transactions</h2>
          <div className="space-y-4">
            {[
              { label: 'Transactions effectuées', value: stats.totals.transactions, color: 'bg-yellow-400' },
              { label: 'Connexions acceptées', value: stats.totals.connections, color: 'bg-teal-400' },
              { label: 'Messages échangés', value: stats.totals.messages, color: 'bg-purple-400' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-slate-600">{item.label}</span>
                  <span className="text-sm font-bold text-slate-800">{item.value}</span>
                </div>
                <MiniBar value={item.value} max={Math.max(stats.totals.transactions, stats.totals.connections, stats.totals.messages, 1)} color={item.color} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Members per day chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-5 text-lg">Inscriptions — 30 derniers jours</h2>
          {stats.membersPerDay.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm italic">Aucune inscription ce mois-ci</div>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {stats.membersPerDay.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition"
                    style={{ height: `${(parseInt(day.count) / maxDay) * 100}%`, minHeight: '4px' }}
                    title={`${day.date}: ${day.count} inscription(s)`}
                  />
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-slate-400 mt-3 text-center">Chaque barre = 1 jour</p>
        </div>

        {/* Top members */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-5 text-lg">Membres les plus actifs</h2>
          {stats.topMembers.length === 0 ? (
            <p className="text-slate-400 text-sm italic">Aucune activité enregistrée</p>
          ) : (
            <div className="space-y-4">
              {stats.topMembers.map((member, i) => (
                <div key={member.uid} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-slate-300 w-6">#{i + 1}</span>
                  <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                    {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-sm">{member.name[0]}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-800 truncate">{member.name}</p>
                    <MiniBar value={member.score} max={maxScore} color="bg-blue-500" />
                  </div>
                  <span className="text-xs font-bold text-blue-600 flex-shrink-0">{member.score} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent members */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 className="font-bold text-slate-800 mb-5 text-lg">Derniers membres inscrits</h2>
        {stats.recentMembers.length === 0 ? (
          <p className="text-slate-400 text-sm italic">Aucun membre inscrit</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <th className="pb-3 pr-4">Membre</th>
                  <th className="pb-3 pr-4">Département</th>
                  <th className="pb-3">Inscription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.recentMembers.map(m => (
                  <tr key={m.uid} className="hover:bg-slate-50 transition">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                          {m.avatar ? <img src={m.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-xs">{m.name[0]}</div>}
                        </div>
                        <span className="font-bold text-sm text-slate-800">{m.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-slate-500">{m.department || '—'}</td>
                    <td className="py-3 text-sm text-slate-500">{new Date(m.createdAt).toLocaleDateString('fr', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminStats;
