# 🎮 Heartopia Wiki - Plateforme Complete

<div align="center">
  <img src="https://cdn.discordapp.com/icons/123456789012345678/abc123def456.png" alt="Heartopia Logo" width="120"/>
  
  **[🌐 Site Web](https://heartopia.fr)** • **[📖 Documentation](https://docs.heartopia.fr)** • **[💬 Discord](https://discord.gg/heartopiafr)**
  
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Version](https://img.shields.io/badge/Version-2.2.0-green.svg)](https://github.com/livonix/heartopia/releases)
  [![Node.js](https://img.shields.io/badge/Node.js-18.x+-green.svg)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-19.x+-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x+-blue.svg)](https://www.typescriptlang.org/)
</div>

## 📋 Table des Matières

- [🎯 À Propos](#-à-propos)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🛠️ Stack Technique](#️-stack-technique)
- [🚀 Démarrage Rapide](#-démarrage-rapide)
- [📁 Structure du Projet](#-structure-du-projet)
- [⚙️ Configuration](#️-configuration)
- [🔧 Développement](#-développement)
- [📦 Déploiement](#-déploiement)
- [🤝 Contribuer](#-contribuer)
- [📄 Licence](#-licence)

## 🎯 À Propos

**Heartopia Wiki** est une plateforme complète de gestion de wiki pour le jeu Heartopia, développée avec les technologies web les plus modernes. Elle offre une interface d'administration puissante, un système de traduction automatique, et une expérience utilisateur optimisée.

### Objectifs Principaux
- 📚 **Centralisation** : Rassembler toutes les informations sur Heartopia
- 🌍 **Internationalisation** : Support multilingue avec traduction automatique
- 🔒 **Sécurité** : Système d'authentification et de permissions robuste
- 📊 **Analytics** : Statistiques détaillées et monitoring en temps réel
- 🎨 **Design Moderne** : Interface épurée et professionnelle

## ✨ Fonctionnalités

### 🎮 Fonctionnalités Utilisateur
- **Wiki Interactif** : Navigation intuitive dans les catégories et pages
- **Recherche Avancée** : Recherche plein texte et filtrage
- **Mode Sombre/Clair** : Personnalisation de l'interface
- **Commentaires** : Système de feedback et discussion
- **Codes Promo** : Génération et validation de codes cadeaux
- **Showcase** : Galerie de créations des joueurs
- **Trading** : Place d'échange d'items

### 🛠️ Fonctionnalités Administration
- **Panel Admin** : Interface complète de gestion
- **Gestion des Contenus** : CRUD sur catégories, pages, sections
- **Système de Rôles** : Admin, Modérateur, Support, Visiteur
- **Traduction IA** : Traduction automatique en plusieurs langues
- **Analytics GDPR** : Statistiques conformes RGPD
- **Modération** : Gestion des commentaires et signalements
- **Maintenance** : Mode maintenance avec redirection
- **Broadcast** : Notifications temps réel aux utilisateurs

### 🔧 Fonctionnalités Techniques
- **WebSocket** : Communication temps réel
- **API REST** : Endpoints complets et documentés
- **Base de Données** : MySQL avec optimisations
- **Cache** : Stratégies de mise en cache intelligentes
- **Sécurité** : JWT, CORS, validation des inputs

## 🛠️ Stack Technique

### Frontend
```
React 19.x          # Interface utilisateur moderne
TypeScript 5.x       # Typage statique
Vite 6.x            # Build tool ultra-rapide
TailwindCSS 3.x     # Styling utilitaire-first
Lucide React          # Icônes modernes
```

### Backend
```
Node.js 18.x         # Runtime JavaScript
Express 4.x          # Framework web
MySQL 8.x            # Base de données relationnelle
Socket.IO            # WebSocket temps réel
JWT                  # Authentification sécurisée
Axios                # Client HTTP
```

### Infrastructure
```
Docker                # Conteneurisation
Nginx                # Reverse proxy
PM2                   # Process manager
SSL/TLS              # Chiffrement HTTPS
```

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18.x ou supérieur
- MySQL 8.x ou supérieur
- npm ou yarn

### Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/livonix/heartopia.git
   cd wiki
   ```

2. **Installer les dépendances**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../
   npm install
   ```

3. **Configurer la base de données**
   ```bash
   # Créer la base de données
   mysql -u root -p
   CREATE DATABASE heartopia;
   
   # Configurer les variables d'environnement
   cp backend/.env.example backend/.env
   # Éditer backend/.env avec vos credentials
   ```

4. **Démarrer le serveur**
   ```bash
   # Développement
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

### Variables d'Environnement

```env
# Base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_password
DB_NAME=heartopia
DB_PORT=3306

# JWT
JWT_SECRET=votre_secret_key

# Discord Bot (optionnel)
DISCORD_BOT_TOKEN=votre_bot_token

# URLs
API_URL=http://localhost:5000/api
FRONTEND_URL=http://localhost:5173
```

## 📁 Structure du Projet

```
heartopia/
├── 📂 backend/                 # Backend Node.js
│   ├── 📂 config/               # Configuration DB
│   ├── 📂 routes/               # Routes API
│   ├── 📂 services/             # Services métier
│   ├── 📂 node_modules/         # Dépendances
│   ├── 📄 package.json          # Configuration backend
│   └── 📄 server.js             # Point d'entrée
├── 📂 components/              # Composants React
│   ├── 📂 admin/               # Panel admin
│   ├── 📄 *.tsx               # Composants principaux
│   └── 📄 *.ts               # Types et utilitaires
├── 📂 lib/                    # Bibliothèques partagées
│   ├── 📄 apiService.ts        # Client API
│   └── 📄 socketContext.ts     # Context WebSocket
├── 📂 public/                 # Fichiers statiques
├── 📄 index.html              # Template HTML
├── 📄 package.json            # Configuration frontend
├── 📄 tsconfig.json           # Configuration TypeScript
├── 📄 tailwind.config.js      # Configuration Tailwind
└── 📄 vite.config.ts          # Configuration Vite
```

## ⚙️ Configuration

### Configuration du Frontend
- **TailwindCSS** : Personnalisation des thèmes et couleurs
- **Vite** : Configuration du serveur de développement
- **TypeScript** : Configuration du typage strict

### Configuration du Backend
- **Express** : Middleware et routes
- **MySQL** : Connexion et pool de connexions
- **Socket.IO** : Configuration WebSocket

### Configuration de la Base de Données
- **Tables** : Structure optimisée avec index
- **Migrations** : Mises à jour automatiques
- **Seed** : Données initiales

## 🔧 Développement

### Scripts Disponibles

```bash
# Frontend
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Preview du build
npm run lint         # Linting du code

# Backend
npm start            # Serveur de production
npm run dev          # Serveur de développement avec nodemon
```

### Conventions de Code

- **TypeScript** : Typage strict pour toute la base de code
- **ESLint** : Linting avec configuration personnalisée
- **Prettier** : Formatage automatique du code
- **Git Hooks** : Pre-commit pour la qualité

### Architecture

- **Components** : Architecture basée sur les composants
- **Services** : Séparation de la logique métier
- **Context** : Gestion d'état global avec React Context
- **API** : RESTful avec validation des entrées

## 📦 Déploiement

### Déploiement avec Docker

1. **Build des images**
   ```bash
   docker build -t heartopia-backend ./backend
   docker build -t heartopia-frontend .
   ```

2. **Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Déploiement Manuel

1. **Build du frontend**
   ```bash
   npm run build
   ```

2. **Configuration du serveur**
   ```bash
   # Configurer Nginx/Apache
   # Configurer SSL
   # Configurer les variables d'environnement
   ```

3. **Démarrage des services**
   ```bash
   npm start
   ```

## 🤝 Contribuer

Nous apprécions vos contributions ! Voici comment participer :

### Guide de Contribution

1. **Forker** le projet
2. **Créer** une branche (`git checkout -b feature/amazing-feature`)
3. **Committer** vos changements (`git commit -m 'Add amazing feature'`)
4. **Pusher** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrir** une Pull Request

### Types de Contributions

- 🐛 **Bug Reports** : Issues détaillées avec steps de reproduction
- ✨ **Nouvelles Fonctionnalités** : Propositions bien documentées
- 📝 **Documentation** : Améliorations de la documentation
- 🎨 **Design** : Améliorations de l'interface utilisateur
- ⚡ **Performance** : Optimisations et améliorations

### Standards de Qualité

- **Tests** : Couverture de code minimale de 80%
- **Documentation** : Comments JSDoc pour toutes les fonctions publiques
- **Performance** : Respect des budgets de performance
- **Accessibilité** : Conformité WCAG 2.1 AA

## 📄 Licence

Ce projet est sous licence **MIT** - voir le fichier [LICENSE](LICENSE) pour plus de détails.

### Droits d'Auteur

© 2026 **Heartopia Wiki Team**. Tous droits réservés.

### Restrictions

- **Commercialisation** : Interdite sans autorisation explicite
- **Redistribution** : Autorisée avec conservation de la licence
- **Modifications** : Autorisées avec mention des changements
- **Patents** : Aucun brevet n'est appliqué

### Mentions Légales

Ce projet utilise des composants et bibliothèques sous leurs licences respectives. Consultez `package.json` pour la liste complète.

---

<div align="center">
  **Made with ❤️ by Heartopia Wiki Team**
  
  [🌐 Site Web](https://heartopia.fr) • [💬 Discord](https://discord.gg/heartopiafr) • [📧 Support](mailto:contact@heartopia.fr)
</div>
