"use client";

export default function PolitiqueConfidentialiteModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white max-h-[90vh] overflow-y-auto rounded-lg shadow-xl p-6 w-full max-w-3xl text-slate-800">

        <h2 className="text-2xl font-bold mb-6 text-center">
          POLITIQUE DE CONFIDENTIALITÉ – BOURSE DU TEMPS
        </h2>

        {/* Texte complet */}
        <div className="space-y-4 text-sm leading-relaxed whitespace-pre-line">
          {`
POLITIQUE DE CONFIDENTIALITÉ – Bourse du Temps
1. Introduction
Le site Bourse du Temps (https://boursedutemps.vercel.app/) accorde une grande importance à la protection de vos données personnelles.
La présente Politique de Confidentialité explique quelles informations nous collectons, comment nous les utilisons et quels sont vos droits.
En utilisant notre site, vous acceptez les pratiques décrites ci-dessous.

2. Données collectées
2.1 Données fournies volontairement
Lorsque vous utilisez notre formulaire de contact, nous collectons :
• Nom et prénom
• Adresse e‑mail
• Message ou informations que vous choisissez de nous transmettre
2.2 Données collectées automatiquement
Lors de votre navigation au site :
• Adresse IP
• Type de navigateur et appareil
• Pages consultées
• Données analytiques anonymisées
• Cookies techniques et analytiques

3. Finalités de la collecte
Les données collectées servent à :
• Répondre à vos demandes via le formulaire
• Améliorer l’expérience utilisateur
• Assurer le fonctionnement technique du site
• Analyser l’audience et les performances du site
Aucune donnée n’est utilisée à des fins commerciales.

4. Partage des données
Vos données ne sont jamais vendues.
Elles peuvent être partagées uniquement avec :
• Notre hébergeur
• Nos outils techniques (ex : Vercel, services d’analyse)
• Les autorités légales en cas d’obligation

5. Cookies
Le site utilise des cookies pour :
• Assurer son bon fonctionnement
• Mesurer l’audience
• Optimiser les performances
Vous pouvez désactiver les cookies via les paramètres de votre navigateur.

6. Sécurité
Nous mettons en place des mesures techniques pour protéger vos données contre :
• L’accès non autorisé
• La perte
• La modification
• La divulgation

7. Durée de conservation
Les données envoyées via le formulaire sont conservées uniquement le temps nécessaire au traitement de votre demande.

MENTIONS LÉGALES – Bourse du Temps
1. Éditeur du site
Nom / Raison sociale : PIERRE LOUIS Jean Bernard
Adresse : Université Senghor
Quartier des Universités - Axe Central
Ville Borg El-Arab El-Gedida - 5220220 Égypte
Email : jean.pierre-louis.2025@etu-usenghor.org
Téléphone : +509 32 27 4422

2. Directeur de la publication
PIERRE LOUIS Jean Bernard 

3. Hébergeur
Le site est hébergé par :
Vercel Inc.
340 S Lemon Ave #4133
Walnut, CA 91789
États‑Unis

4. Propriété intellectuelle
Tous les contenus présents sur le site (textes, images, logos, design) sont protégés par le droit d’auteur.
Toute reproduction sans autorisation est interdite.

5. Responsabilité
L’éditeur ne peut être tenu responsable :
• D’interruptions du site
• D’erreurs ou omissions dans le contenu
• De dommages liés à l’utilisation du site
• Des liens externes présents sur le site

CONDITIONS GÉNÉRALES D’UTILISATION (CGU)
1. Objet
Les présentes CGU encadrent l’utilisation du site Bourse du Temps.

2. Accès au site
Le site est accessible gratuitement à toutes les personnes, membres de nos organisations partenaires.

3. Services proposés
Le site propose :
• Des informations sur le concept Bourse du Temps
• Un formulaire de contact
• Une présentation des services
Aucune transaction monétaire n’est effectuée sur le site.

4. Obligations de l’utilisateur
L’utilisateur s’engage à :
• Ne pas utiliser le site à des fins illégales
• Ne pas tenter d’accéder aux données d’autres utilisateurs
• Fournir des informations exactes via le formulaire

5. Propriété intellectuelle
Tous les contenus du site sont protégés.
Toute reproduction est interdite sans autorisation écrite.

6. Données personnelles
L’utilisation du site implique l’acceptation de notre Politique de Confidentialité.

7. Limitation de responsabilité
Nous ne garantissons pas :
• L’absence d’erreurs
• La disponibilité permanente du site
• L’exactitude des informations

8. Modification des CGU
Les CGU peuvent être modifiées à tout moment.
La version en vigueur est celle affichée sur le site.

9. Droit applicable
Les présentes CGU sont soumises au droit des pays concernés et aux règlements de nos organisations partenaires.
          `}
        </div>

        <button
          onClick={onClose}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
