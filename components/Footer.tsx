"use client";

import React from 'react';
import Image from 'next/image';
import { Page } from '@/types';
import { useRouter } from 'next/navigation';

export default function Footer() {
  const router = useRouter();
  const [year, setYear] = React.useState(new Date().getFullYear());

  React.useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const handleNavigate = (page: string) => {
    if (page === 'home') router.push('/');
    else router.push(`/${page}`);
  };

  return (
    <footer className="bg-slate-900 pt-20 pb-10 px-6 text-slate-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10">
                <Image 
                  src="https://i.postimg.cc/5Y3Rg6zs/image-1.jpg" 
                  alt="Logo" 
                  fill
                  className="rounded-full object-cover border border-slate-700 shadow-sm" 
                />
              </div>
              <h2 className="font-heading text-xl font-bold text-white uppercase tracking-tighter">
                BOURSE DU TEMPS
              </h2>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Une initiative de l'Université Senghor pour favoriser l'entraide, le partage de connaissances et la solidarité entre étudiants et membres de la communauté.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all border border-slate-700">
                <span className="text-lg">FB</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all border border-slate-700">
                <span className="text-lg">IG</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all border border-slate-700">
                <span className="text-lg">LI</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white mb-6 text-sm uppercase tracking-widest">Navigation</h3>
            <ul className="space-y-4">
              <li><button onClick={() => handleNavigate('home')} className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Accueil</button></li>
              <li><button onClick={() => handleNavigate('services')} className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Services Offerts</button></li>
              <li><button onClick={() => handleNavigate('requests')} className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Demandes d'Aide</button></li>
              <li><button onClick={() => handleNavigate('members')} className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Membres</button></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-6 text-sm uppercase tracking-widest">Communauté</h3>
            <ul className="space-y-4">
              <li><button onClick={() => handleNavigate('blog')} className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Blog & Actualités</button></li>
              <li><button onClick={() => handleNavigate('forum')} className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Forum de Discussion</button></li>
              <li><button onClick={() => handleNavigate('testimonials')} className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Témoignages</button></li>
              <li><button onClick={() => handleNavigate('about')} className="text-slate-400 hover:text-blue-400 text-sm transition-colors">À propos</button></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-6 text-sm uppercase tracking-widest">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">📍</span>
                <span className="text-slate-400 text-sm leading-relaxed">1 Place Ahmed Orabi, Alexandrie, Égypte</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-400">✉️</span>
                <span className="text-slate-400 text-sm">contact@usenghor.org</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-400">📞</span>
                <span className="text-slate-400 text-sm">+20 3 4843374</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs font-medium">
            © {year} Bourse du Temps - Université Senghor. Tous droits réservés.
          </p>
          <div className="flex gap-8">
            <button className="text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors">Mentions Légales</button>
            <button className="text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors">Confidentialité</button>
            <button className="text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors">Règlement Intérieur</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
