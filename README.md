# Knowledge Learning

## À propos du projet

Knowledge Learning est une plateforme d’apprentissage en ligne que j’ai développée dans le cadre de ma formation **Développeur Web et Web Mobile (DWWM)**.

L’objectif était de concevoir une application web complète permettant aux utilisateurs de créer un compte, consulter un catalogue de formations, acheter des cursus, suivre leur progression et obtenir un certificat une fois leur formation terminée.

Ce projet m’a permis de mettre en pratique l’ensemble des compétences acquises pendant ma formation, aussi bien en développement front-end qu’en développement back-end.

---

## Fonctionnalités principales

### Espace utilisateur

- Création de compte
- Activation du compte par e-mail
- Connexion sécurisée
- Réinitialisation du mot de passe
- Consultation du catalogue de formations
- Achat d’une formation (paiement simulé)
- Accès aux leçons
- Suivi de la progression
- Historique des achats
- Gestion des certificats
- Tableau de bord personnel

### Espace administrateur

- Gestion des utilisateurs
- Gestion des formations
- Gestion des cursus et des leçons
- Gestion des achats
- Gestion des certificats
- Attribution des rôles

---

## Technologies utilisées

### Front-end
- HTML5
- CSS3
- JavaScript

### Back-end
- Node.js
- Express.js

### Base de données
- PostgreSQL
- Supabase

### Sécurité
- Supabase Auth
- JWT
- bcrypt
- Middlewares de protection

### Outils
- Visual Studio Code
- Git
- GitHub
- Nodemailer
- Jest
- Supertest

---

## Architecture

Le projet est organisé selon une architecture **MVC (Model – View – Controller)** afin de séparer les différentes responsabilités de l'application et faciliter sa maintenance.

```
config/
controllers/
middlewares/
public/
routes/
services/
tests/
```

---

## Sécurité

Plusieurs mécanismes ont été mis en place afin de sécuriser l'application :

- authentification avec JWT ;
- chiffrement des mots de passe avec bcrypt ;
- vérification de l'adresse e-mail ;
- protection des routes sensibles ;
- gestion des rôles utilisateurs.

---

## Tests

Des tests ont été réalisés avec **Jest** et **Supertest** afin de vérifier le bon fonctionnement des principales routes de l'API, notamment celles liées à l'authentification.

---

## Améliorations possibles

Si je devais poursuivre le développement du projet, j'aimerais notamment :

- intégrer un véritable système de paiement avec Stripe ;
- permettre aux utilisateurs de laisser un avis sur les formations ;
- améliorer encore la version mobile ;
- ajouter davantage de statistiques dans le tableau de bord.

---

## Ce que ce projet m'a apporté

La réalisation de Knowledge Learning m'a permis de développer une vision plus complète d'un projet web.

J'ai appris à concevoir une base de données relationnelle, développer une API REST, sécuriser une application, organiser un projet avec une architecture MVC et réaliser des tests afin de garantir le bon fonctionnement des fonctionnalités.

Au-delà des compétences techniques, ce projet m'a également appris à mieux organiser mon travail, résoudre des problèmes de manière autonome et mener un projet du début jusqu'à sa finalisation.

---

## Auteur

**Melina Yorgova**

Projet réalisé dans le cadre du **Titre Professionnel Développeur Web et Web Mobile (DWWM)**

Centre Européen de Formation – Session 2026
