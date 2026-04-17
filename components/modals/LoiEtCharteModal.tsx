"use client";
import { useState } from "react";

export default function LoiEtCharteModal({ onClose }: { onClose: () => void }) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // durée identique à l’animation
  };

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 
                 transition-opacity duration-300 ease-out ${isClosing ? "opacity-0" : "opacity-100"}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title-loi"
    >
      <div
        className={`bg-white max-h-[90vh] overflow-y-auto rounded-lg shadow-xl p-6 w-full max-w-3xl text-slate-800 
                   transform transition-transform duration-300 ease-out ${isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
      >
        {/* TITRE GLOBAL */}
        <h2 id="modal-title-loi" className="text-2xl font-bold mb-6 text-center">
          LOI DES CONDITIONS D’ÉCHANGE – BOURSE DU TEMPS
        </h2>

        {/* SECTION 1 : LOI DE CONDITIONS D’ÉCHANGE */}
        <div className="space-y-4 text-sm leading-relaxed whitespace-pre-line">
{`
LOI DE CONDITIONS D’ÉCHANGE – BOURSE DU TEMPS
1. Objet de la Loi
La présente Loi de Conditions d’Échange a pour objectif d’encadrer les échanges de services, de compétences et de temps entre les utilisateurs du site Bourse du Temps (https://boursedutemps.vercel.app).
Elle définit les droits, obligations et responsabilités de chaque participant afin de garantir un environnement sûr, équitable et respectueux.

2. Définitions
• Utilisateur : toute personne accédant au site ou participant à un échange.
• Offreur : utilisateur proposant un service ou une compétence.
• Demandeur : utilisateur sollicitant un service ou une compétence.
• Échange : prestation réalisée entre deux utilisateurs, basée un principe de temps contre temps ou service contre service.
• Crédit‑Temps : unité symbolique représentant la valeur d’un échange (si applicable).

3. Nature des Échanges
3.1 Gratuité
Les échanges réalisés via Bourse du Temps sont non commerciaux.
Aucun paiement financier ne peut être exigé ou proposé.
3.2 Réciprocité
Les échanges reposent sur un principe d’équité :
• un service rendu peut être compensé par un autre service,
• ou par un temps équivalent, selon les modalités convenues entre les utilisateurs.
3.3 Liberté contractuelle
Les utilisateurs sont libres de :
• choisir leurs partenaires d’échange,
• définir les modalités de l’échange,
• refuser un échange sans justification.

4. Engagements des Utilisateurs
4.1 Respect et courtoisie
Chaque utilisateur s’engage à adopter un comportement respectueux, bienveillant et non discriminatoire.
4.2 Exactitude des informations
Les utilisateurs doivent fournir des informations sincères concernant :
• leurs compétences,
• leur disponibilité,
• leur identité.
4.3 Sécurité
Les utilisateurs doivent veiller à leur propre sécurité et ne pas proposer :
• de services illégaux,
• de services dangereux,
• de services nécessitant une qualification professionnelle réglementée (ex : médecine, droit, électricité haute tension).

5. Responsabilités
5.1 Responsabilité de l’éditeur
Le site Bourse du Temps :
• n’intervient pas dans les échanges,
• ne garantit pas la qualité des services,
• ne peut être tenu responsable des litiges entre utilisateurs.
5.2 Responsabilité des utilisateurs
Les utilisateurs sont seuls responsables :
• des engagements qu’ils prennent,
• de la qualité des services rendus,
• des conséquences de leurs actions.

6. Confidentialité et Données
Les échanges doivent respecter la vie privée de chacun.
Aucune donnée personnelle obtenue dans le cadre d’un échange ne peut être :
• divulguée,
• vendue,
• utilisée à des fins commerciales.

7. Annulation et Litiges
7.1 Annulation
Un utilisateur peut annuler un échange, mais doit prévenir l’autre partie dans un délai raisonnable.
7.2 Litiges
En cas de désaccord, les utilisateurs doivent tenter une résolution amiable.
Le site n’intervient pas dans les conflits.

8. Interdictions
Il est strictement interdit de :
• proposer des services illégaux,
• exiger une rémunération financière,
• usurper l’identité d’un tiers,
• harceler ou menacer un autre utilisateur,
• détourner le site à des fins commerciales.

9. Suspension ou Exclusion
L’éditeur du site se réserve le droit de suspendre ou supprimer l’accès d’un utilisateur en cas de :
• non‑respect de la Loi,
• comportement dangereux,
• fraude ou tentative de fraude.

10. Modification de la Loi
La présente Loi peut être modifiée à tout moment.
La version en vigueur est celle publiée sur le site.

11. Acceptation
L’utilisation du site implique l’acceptation pleine et entière de la présente Loi de Conditions d’Échange.
`}
        </div>

        <hr className="my-8 border-slate-300" />

        {/* SECTION 2 : CHARTE ÉTHIQUE */}
        <h2 className="text-2xl font-bold mb-6 text-center">
          CHARTE ÉTHIQUE – BOURSE DU TEMPS
        </h2>

        <div className="space-y-4 text-sm leading-relaxed whitespace-pre-line">
{`
Préambule
La communauté Bourse du Temps repose sur un principe simple : chacun possède du temps, des talents et des compétences qui peuvent bénéficier aux autres.
Cette Charte Éthique établit les valeurs fondamentales qui guident les échanges entre les membres.
En utilisant le site, chaque utilisateur s’engage à respecter ces principes.

1. Respect et Bienveillance
Chaque membre s’engage à :
traiter les autres avec courtoisie et respect
adopter une attitude positive et non discriminatoire
écouter, comprendre et communiquer de manière constructive
*Aucun comportement agressif, humiliant ou irrespectueux n’est toléré.

2. Confiance et Transparence
La confiance est la base de tout échange.
Les utilisateurs doivent :
fournir des informations sincères sur leurs compétences et disponibilités
respecter les engagements pris
prévenir en cas d’imprévu ou d’annulation
*La transparence renforce la qualité des échanges.

3. Équité et Réciprocité
Les échanges doivent être :
équitables
équilibrés
basés sur la réciprocité
*Chaque service rendu doit être compensé par un autre service ou un temps équivalent, selon les modalités convenues librement entre les utilisateurs.

4. Gratuité des Échanges
La Bourse du Temps repose sur un principe fondamental :
aucune transaction financière n’est autorisée
aucun utilisateur ne peut exiger ou proposer une rémunération en argent
*Les échanges sont basés uniquement sur le temps, l’entraide et la solidarité.

5. Sécurité et Responsabilité
Chaque utilisateur doit :
veiller à sa propre sécurité
ne proposer que des services qu’il maîtrise réellement
ne pas s’engager dans des activités dangereuses ou illégales
*Les services nécessitant une qualification professionnelle réglementée (médecine, droit, travaux électriques complexes, etc.) sont interdits.

6. Confidentialité et Respect de la Vie Privée
Les informations échangées entre utilisateurs doivent rester confidentielles.
Il est strictement interdit de :
divulguer des données personnelles
enregistrer ou publier des échanges sans consentement
utiliser les informations obtenues à des fins commerciales ou malveillantes
*La confiance passe par la discrétion.

7. Inclusion et Non‑Discrimination
La communauté est ouverte à tous, sans distinction de :
sexe
âge
origine
religion
situation sociale
handicap
*Toute forme de discrimination est strictement interdite.

8. Engagement envers la Qualité
Chaque utilisateur s’engage à :
fournir un service de qualité
respecter les délais convenus
faire preuve de sérieux et de professionnalisme
*Un échange réussi renforce la communauté.

9. Résolution des Conflits
En cas de désaccord, les utilisateurs doivent :
privilégier le dialogue
rechercher une solution amiable
faire preuve de compréhension
*Le site n’intervient pas dans les litiges, mais encourage la communication respectueuse.

10. Contribution à la Communauté
Chaque membre contribue à faire de Bourse du Temps un espace :
utile
solidaire
respectueux
enrichissant pour tous
*L’esprit d’entraide est au cœur du projet.

11. Acceptation de la Charte
L’utilisation du site implique l’acceptation pleine et entière de la présente Charte Éthique.
Tout manquement peut entraîner une suspension ou une exclusion de la plateforme.
`}
        </div>

        <button
          onClick={handleClose}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2