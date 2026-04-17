# deploy.ps1
param(
    [string]$Message = "Auto-deploy commit"
)

Write-Host "🚀 Déploiement en cours..."

# Étape 1 : Ajouter tous les fichiers modifiés
git add .

# Étape 2 : Créer un commit avec le message fourni
git commit -m $Message

# Étape 3 : Pousser vers la branche main
git push origin main

# Vérification
git status
git log -1

Write-Host "✅ Déploiement terminé et push effectué vers GitHub."
