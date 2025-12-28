# Configuration du Projet

## Configuration Supabase

1. Créez un projet sur [Supabase](https://supabase.com)
2. Allez dans Settings > API pour récupérer :
   - L'URL de votre projet (Project URL)
   - La clé anonyme (anon/public key)

3. Créez un fichier `.env` à la racine du projet avec :
```
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon
VITE_SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

**⚠️ IMPORTANT** : La clé `VITE_SUPABASE_SERVICE_ROLE_KEY` est sensible. Ne la commitez JAMAIS dans Git. Elle est nécessaire pour gérer les étudiants depuis le dashboard.

## Configuration de la Base de Données

### 1. Créer la table des cours

1. Allez dans Supabase > SQL Editor
2. Exécutez le script `supabase-setup.sql` qui se trouve à la racine du projet
3. Ce script créera la table `courses` avec les permissions nécessaires

### 2. Gérer les étudiants

Vous pouvez maintenant gérer les étudiants de deux façons :

**Option A : Via le Dashboard (Recommandé)**
1. Connectez-vous à l'application
2. Cliquez sur "Dashboard" dans le header
3. Allez dans l'onglet "Étudiants"
4. Ajoutez les étudiants avec leur email et mot de passe

**Option B : Via Supabase directement**
1. Allez dans Authentication > Users
2. Cliquez sur "Add user" > "Create new user"
3. Entrez l'email et le mot de passe de l'étudiant
4. L'étudiant pourra ensuite se connecter avec ces identifiants

## Utilisation du Dashboard

Le dashboard vous permet de :

1. **Gérer les cours** :
   - Ajouter de nouveaux cours avec titre, description, vidéo YouTube et ressources
   - Voir la liste de tous les cours
   - Supprimer des cours

2. **Gérer les étudiants** :
   - Ajouter de nouveaux étudiants (email + mot de passe)
   - Voir la liste de tous les étudiants
   - Supprimer des étudiants

Pour accéder au dashboard, connectez-vous avec un compte admin et cliquez sur "Dashboard" dans le header.

## Configuration d'un utilisateur Admin

Pour qu'un utilisateur puisse accéder au dashboard, vous devez ajouter son email dans la liste des admins :

1. Ouvrez le fichier `src/lib/admin.ts`
2. Dans le tableau `ADMIN_EMAILS`, ajoutez l'email de l'utilisateur admin :
   ```typescript
   const ADMIN_EMAILS = [
     'admin@example.com',
     'votre-email@example.com', // Ajoutez ici l'email de l'admin
   ]
   ```
3. Sauvegardez le fichier
4. Redémarrez le serveur de développement si nécessaire

**Important** : 
- Seuls les utilisateurs dont l'email est dans la liste `ADMIN_EMAILS` peuvent accéder au dashboard
- Les autres utilisateurs verront une page d'erreur "Accès Refusé" s'ils tentent d'accéder au dashboard
- Vous pouvez aussi définir le rôle via les user_metadata dans Supabase (les deux méthodes fonctionnent)

### Obtenir l'ID d'une vidéo YouTube

Pour une URL comme `https://www.youtube.com/watch?v=VIDEO_ID`, l'ID est `VIDEO_ID`

## Vidéos YouTube Privées

Pour que les vidéos YouTube privées fonctionnent :
1. Les vidéos doivent être configurées comme "Non répertoriées" ou "Privées" dans YouTube
2. Assurez-vous que l'embed est activé dans les paramètres de la vidéo YouTube
3. Pour les vidéos privées, vous devrez peut-être utiliser l'API YouTube pour vérifier l'accès

## Démarrage

```bash
npm install
npm run dev
```


