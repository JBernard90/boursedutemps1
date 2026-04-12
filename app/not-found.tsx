import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-6 text-center">
      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-4xl mb-8 shadow-inner">
        🔍
      </div>
      <h1 className="font-heading text-4xl font-bold text-slate-900 mb-4 uppercase tracking-tight">
        Page Introuvable
      </h1>
      <p className="text-slate-500 mb-8 max-w-md">
        Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link 
        href="/"
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
