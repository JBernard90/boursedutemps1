"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Page } from '@/types';
import { useRouter } from 'next/navigation';
import LegalModal from './LegalModal';

export default function Footer() {
  const router = useRouter();
  const [year, setYear] = React.useState(new Date().getFullYear());
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; title: string; content: React.ReactNode | null }>({
    isOpen: false,
    title: '',
    content: null
  });

  React.useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const handleNavigate = (page: string) => {
    if (page === 'home') router.push('/');
    else router.push(`/${page}`);
  };

  const openLegal = (type: 'mentions' | 'privacy' | 'cgu' | 'loi') => {
    let title = '';
    let content: React.ReactNode = null;

    if (type === 'privacy') {
      title = 'Politique de Confidentialité';
      content = (
        <div className="space-y-4">
          <section>
            <h3 className="font-bold text-slate-900 mb-2">1. Introduction</h3>
            <p>Le site Bourse du Temps (https://boursedutemps.vercel.app/) accorde une grande importance à la protection de vos données personnelles. La présente Politique de Confidentialité explique quelles informations nous collectons, comment nous les utilisons et quels sont vos droits. En utilisant notre site, vous acceptez les pratiques décrites ci-dessous.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">2. Données collectées</h3>
            <div className="space-y-2">
              <p><strong>2.1 Données fournies volontairement</strong></p>
              <p>Lorsque vous utilisez notre formulaire de contact, nous collectons : Nom et prénom, Adresse e‑mail, Message ou informations que vous choisissez de nous transmettre.</p>
              <p><strong>2.2 Données collectées automatiquement</strong></p>
              <p>Lors de votre navigation au site : Adresse IP, Type de navigateur et appareil, Pages consultées, Données analytiques anonymisées, Cookies techniques et analytiques.</p>
            </div>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">3. Finalités de la collecte</h3>
            <p>Les données collectées servent à : Répondre à vos demandes via le formulaire, Améliorer l’expérience utilisateur, Assurer le fonctionnement technique du site, Analyser l’audience et les performances du site. Aucune donnée n’est utilisée à des fins commerciales.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">4. Partage des données</h3>
            <p>Vos données ne sont jamais vendues. Elles peuvent être partagées uniquement avec : Notre hébergeur, Nos outils techniques (ex : Vercel, services d’analyse), Les autorités légales en cas d’obligation.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">5. Cookies</h3>
            <p>Le site utilise des cookies pour : Assurer son bon fonctionnement, Mesurer l’audience, Optimiser les performances. Vous pouvez désactiver les cookies via les paramètres de votre navigateur.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">6. Sécurité</h3>
            <p>Nous mettons en place des mesures techniques pour protéger vos données contre : L’accès non autorisé, La perte, La modification, La divulgation.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">7. Durée de conservation</h3>
            <p>Les données envoyées via le formulaire sont conservées uniquement le temps nécessaire au traitement de votre demande.</p>
          </section>
        </div>
      );
    } else if (type === 'mentions') {
      title = 'Mentions Légales';
      content = (
        <div className="space-y-4">
          <section>
            <h3 className="font-bold text-slate-900 mb-2">1. Éditeur du site</h3>
            <p>Nom / Raison sociale : PIERRE LOUIS Jean Bernard<br />
            Adresse : Université Senghor, Quartier des Universités - Axe Central, Ville Borg El-Arab El-Gedida - 5220220 Égypte<br />
            Email : jean.pierre-louis.2025@etu-usenghor.org<br />
            Téléphone : +509 32 27 4422</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">2. Directeur de la publication</h3>
            <p>PIERRE LOUIS Jean Bernard</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">3. Hébergeur</h3>
            <p>Le site est hébergé par : Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États‑Unis</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">4. Propriété intellectuelle</h3>
            <p>Tous les contenus présents sur le site (textes, images, logos, design) sont protégés par le droit d’auteur. Toute reproduction sans autorisation est interdite.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">5. Responsabilité</h3>
            <p>L’éditeur ne peut être tenu responsable : D’interruptions du site, D’erreurs ou omissions dans le contenu, De dommages liés à l’utilisation du site, Des liens externes présents sur le site.</p>
          </section>
        </div>
      );
    } else if (type === 'cgu') {
      title = "Conditions Générales d'Utilisation";
      content = (
        <div className="space-y-4">
          <section>
            <h3 className="font-bold text-slate-900 mb-2">1. Objet</h3>
            <p>Les présentes CGU encadrent l’utilisation du site Bourse du Temps.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">2. Accès au site</h3>
            <p>Le site est accessible gratuitement à toutes les personnes, membres de nos organisations partenaires.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">3. Services proposés</h3>
            <p>Le site propose : Des informations sur le concept Bourse du Temps, Un formulaire de contact, Une présentation des services. Aucune transaction monétaire n’est effectuée sur le site.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">4. Obligations de l’utilisateur</h3>
            <p>L’utilisateur s’engage à : Ne pas utiliser le site à des fins illégales, Ne pas tenter d’accéder aux données d’autres utilisateurs, Fournir des informations exactes via le formulaire.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">5. Propriété intellectuelle</h3>
            <p>Tous les contenus du site sont protégés. Toute reproduction est interdite sans autorisation écrite.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">6. Données personnelles</h3>
            <p>L’utilisation du site implique l’acceptation de notre Politique de Confidentialité.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">7. Limitation de responsabilité</h3>
            <p>Nous ne garantissons pas : L’absence d’erreurs, La disponibilité permanente du site, L’exactitude des informations.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">8. Modification des CGU</h3>
            <p>Les CGU peuvent être modifiées à tout moment. La version en vigueur est celle affichée sur le site.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">9. Droit applicable</h3>
            <p>Les présentes CGU sont soumises au droit des pays concernés et aux règlements de nos organisations partenaires.</p>
          </section>
        </div>
      );
    }

    } else if (type === 'loi') {
      title = "Loi des Conditions d'Échange";
      content = (
        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <section>
            <h3 className="font-bold text-slate-900 mb-2">1. Objet de la Loi</h3>
            <p>La présente Loi encadre les échanges de services, de compétences et de temps entre les utilisateurs du site Bourse du Temps. Elle définit les droits, obligations et responsabilités de chaque participant afin de garantir un environnement sûr, équitable et respectueux.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">2. Nature des Échanges</h3>
            <p><strong>Gratuité :</strong> Les échanges sont non commerciaux. Aucun paiement financier ne peut être exigé ou proposé.</p>
            <p><strong>Réciprocité :</strong> Un service rendu peut être compensé par un autre service ou un temps équivalent, selon les modalités convenues entre les utilisateurs.</p>
            <p><strong>Liberté :</strong> Les utilisateurs sont libres de choisir leurs partenaires, de définir les modalités de l'échange, et de refuser un échange sans justification.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">3. Engagements des Utilisateurs</h3>
            <p>Chaque utilisateur s'engage à adopter un comportement respectueux et bienveillant, à fournir des informations sincères sur ses compétences et sa disponibilité, et à ne pas proposer de services illégaux ou dangereux.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">4. Responsabilités</h3>
            <p>Le site Bourse du Temps n'intervient pas dans les échanges et ne garantit pas la qualité des services. Les utilisateurs sont seuls responsables des engagements qu'ils prennent et des conséquences de leurs actions.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">5. Confidentialité</h3>
            <p>Les échanges doivent respecter la vie privée de chacun. Aucune donnée personnelle obtenue dans le cadre d'un échange ne peut être divulguée, vendue ou utilisée à des fins commerciales.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">6. Interdictions</h3>
            <p>Il est strictement interdit de proposer des services illégaux, d'exiger une rémunération financière, d'usurper l'identité d'un tiers, ou de harceler un autre utilisateur.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">7. Annulation et Litiges</h3>
            <p>Un utilisateur peut annuler un échange en prévenant l'autre partie dans un délai raisonnable. En cas de désaccord, une résolution amiable est encouragée. Le site n'intervient pas dans les conflits.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 mb-2">8. Acceptation</h3>
            <p>L'utilisation du site implique l'acceptation pleine et entière de la présente Loi des Conditions d'Échange.</p>
          </section>
        </div>
      );
    }

    setLegalModal({ isOpen: true, title, content });
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
              Une plateforme pour favoriser l'entraide, le partage de connaissances et la solidarité.
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
                <span className="text-slate-400 text-sm">jeanbernardpierrelouis@gmail.com</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-400">📞</span>
                <span className="text-slate-400 text-sm">+509 32 27 4422</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs font-medium">
            © {year} Bourse du Temps - Université Senghor. Tous droits réservés.
          </p>
          <div className="flex gap-8">
            <button onClick={() => openLegal('mentions')} className="text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors">Mentions Légales</button>
            <button onClick={() => openLegal('privacy')} className="text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors">Confidentialité</button>
            <button onClick={() => openLegal('cgu')} className="text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors">CGU</button>
            <button onClick={() => openLegal('loi')} className="text-slate-500 hover:text-orange-400 text-xs font-medium transition-colors">⚖️ Loi des Échanges</button>
          </div>
        </div>
      </div>

      <LegalModal 
        isOpen={legalModal.isOpen} 
        onClose={() => setLegalModal({ ...legalModal, isOpen: false })}
        title={legalModal.title}
        content={legalModal.content}
      />
    </footer>
  );
}
