# Knowledge Learning

Projet e-learning développé en Node.js avec Express et MySQL.

Ce projet a été réalisé dans le cadre d’une formation en développement web.  
Il permet aux utilisateurs de suivre des formations en ligne, valider des leçons et obtenir des certifications.

---

## Fonctionnalités

- Inscription avec vérification par email
- Connexion sécurisée avec JWT
- Achat de cursus et de leçons
- Accès aux contenus après achat
- Validation des leçons
- Obtention automatique de certifications
- Backoffice administrateur (gestion utilisateurs et achats)

---

## Technologies utilisées

- Node.js
- Express.js
- MySQL
- JWT (authentification)
- bcrypt (hash des mots de passe)
- Jest (tests backend)
- HTML / CSS / JavaScript (frontend)

---

## Installation

1. Cloner le projet

```bash
git clone <(https://github.com/mel411/knowledge-learning)>
cd knowledge-learning-backend

2. Installer les dépendances

npm install

3. Configurer le fichier .env

Créer un fichier `.env` avec les variables suivantes :

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=knowledge_learning
JWT_SECRET=secret

4. Lancer le serveur

npm start

## Tests

Les tests backend sont réalisés avec Jest.

Pour lancer les tests :

npm test


---

## API

Routes principales :

- /api/auth → inscription / connexion
- /api/purchase → achat de contenu
- /api/access → vérification d’accès
- /api/validation → validation des leçons
- /api/certifications → certifications
- /api/admin → backoffice

## Auteur

Projet réalisé dans le cadre d’une formation en développement web.

lien render: https://knowledge-learning-1-3im1.onrender.com
