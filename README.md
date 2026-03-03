# Plateforme de Formation en Ligne

Bienvenue sur la Plateforme de Formation en Ligne, une application web moderne permettant la gestion, la diffusion et le suivi de cours numériques à destination des étudiants et des administrateurs.

---

## ✨ Fonctionnalités principales

- **Gestion des utilisateurs** : Authentification sécurisée (étudiants / admin)
- **Tableau de bord administrateur** : Création, modification, suppression de cours et gestion des étudiants
- **Catalogue de cours interactifs** : Accès à des cours vidéo, description, ressources supplémentaires
- **Filtrage & Responsive design** : Interface adaptée à tous les écrans (mobile, tablette, desktop)
- **Modification en temps réel** : Ajout et édition instantanée des contenus pédagogiques
- **Connexion Supabase** : Stockage sécurisé des données utilisateurs et cours
- **Sécurité et droits d'accès** : Accès restreint selon le rôle utilisateur
- **(Optionnel) Tracking de présence** : Affiche l’état “en ligne” ou la dernière connexion des étudiants

---

## 🛠️ Stack technique

- **Frontend** : React + TypeScript + TailwindCSS
- **Backend (BaaS)** : Supabase (PostgreSQL, Auth, Realtime)
- **Outils** : Vite, ESLint, Vercel pour l’hébergement

---

## 🚀 Installation & lancement

### 1. Cloner le dépôt

git clone https://github.com/votre-utilisateur/votre-projet.git
cd votre-projet/formation### 2. Installer les dépendances

npm install### 3. Fichier de configuration

Créer un fichier `.env` à la racine du dossier `formation` (voir `.env.example` si fourni).

### 4. Lancer en mode développement

npm run dev### 5. Accéder à l’application

Rendez-vous sur [localhost:5173](http://localhost:5173)

---

## 📦 Structure du projet

- `src/components/` : Tous les composants React (cours, dashboard, login, etc.)
- `src/lib/` : Fonctions pour interroger Supabase (gestion des cours, utilisateurs, etc.)
- `src/types/` : Types TypeScript
- `public/` : Fichiers statiques

---

## 👨‍💻 Utilisation

Pour accéder au tableau de bord admin, vous devez être connecté avec un compte disposant du rôle administrateur.  
Les étudiants peuvent consulter les cours auxquels ils sont inscrits via leur espace personnel.

---

## 🚧 Fonctionnalités à venir (exemples)

- Système de quiz et de validation d’acquis
- Filtres avancés pour les cours
- Notifications email et sur l’interface
- Messagerie interne
- Génération de certificats de réussite

---

## 🤝 Contribuer

Les contributions sont les bienvenues !  
Pour toute suggestion ou bug, ouvrez une issue ou une pull request.

---

## 📝 Licence

Ce projet est sous licence MIT.

---

## 📧 Contact

Pour toute question, contactez l’équipe technique à : **contact@formation-plateforme.com**
