# School-Sup — Démarches universitaires en ligne

> Document de travail de l’équipe. Les critères d’acceptation, priorités et affectations à jour sont ceux de Jira.

## Sommaire

1. [Présentation et périmètre](#1-présentation-et-périmètre)
2. [Acteurs et rôles](#2-acteurs-et-rôles)
3. [Stack technique](#3-stack-technique)
4. [Architecture et état du socle](#4-architecture-et-état-du-socle)
5. [Règles métier](#5-règles-métier)
6. [Équipe et répartition](#6-équipe-et-répartition)
7. [Préparer son environnement](#7-préparer-son-environnement)
8. [Lancer le projet](#8-lancer-le-projet)
9. [Workflow GitHub](#9-workflow-github)
10. [Relier GitHub à Jira](#10-relier-github-à-jira)
11. [Contribuer au backend](#11-contribuer-au-backend)
12. [Contribuer au frontend](#12-contribuer-au-frontend)
13. [Base de données et migrations](#13-base-de-données-et-migrations)
14. [Sécurité et données](#14-sécurité-et-données)
15. [Conventions de code et commits](#15-conventions-de-code-et-commits)
16. [Pull request et intégration](#16-pull-request-et-intégration)
17. [Vérifications avant livraison](#17-vérifications-avant-livraison)
18. [Dépannage](#18-dépannage)

---

## 1. Présentation et périmètre

**School-Sup** est une plateforme web destinée à simplifier certaines démarches administratives de l’Université Marien Ngouabi (UMNG), notamment pour les nouveaux bacheliers et les étudiants vivant en province.

Le MVP porte sur deux démarches : **la pré-inscription** et **la légalisation d’attestations**. Il comprend le dépôt de pièces justificatives, un parcours de paiement Mobile Money de démonstration ou de test, le suivi des dossiers et leur traitement par un agent.

### Hors périmètre du MVP

- Paiement réel en production et remboursements automatiques.
- Connexion aux systèmes internes de l’UMNG.
- Application mobile native.

Les User Stories (US), critères d’acceptation, priorités et statuts sont suivis dans **Jira**. Jira fait foi en cas de divergence; signalez néanmoins les incohérences au Product Manager (PM) et au Business Analyst (BA).

## 2. Acteurs et rôles

| Acteur | Rôle applicatif | Responsabilités principales |
| --- | --- | --- |
| Étudiant | étudiant | Créer un compte, consulter le catalogue, déposer et payer une demande, suivre son dossier. |
| Agent de scolarité | agent | Consulter les dossiers payés, vérifier les pièces, valider, refuser avec motif ou demander un complément. |
| Administrateur produit | admin | Administrer le catalogue, les pièces demandées et les montants selon les US du MVP. |
| Product Manager | — | Clarifier la valeur, le périmètre et les priorités produit. |
| Business Analyst | — | Clarifier les règles métier, critères d’acceptation et cas limites. |

Le PM et le BA peuvent travailler via Jira et les échanges d’équipe. Ils n’ont pas besoin d’un accès d’écriture au dépôt sauf si leur rôle le nécessite.

## 3. Stack technique

| Couche | Technologie |
| --- | --- |
| Backend | Node.js, Express |
| Base de données | PostgreSQL |
| Frontend | React, Vite, React Router |
| Authentification | JWT, jsonwebtoken, bcryptjs |
| Validation | Zod |
| Téléversement de fichiers | Multer |
| Qualité du code | ESLint, Prettier |

Le frontend utilise **React**, un choix de framework JavaScript en plus de HTML/CSS/JS. L’équipe doit confirmer que cette architecture correspond bien à son accord et aux exigences du projet.

### Prérequis

- Git.
- Node.js LTS compatible avec les dépendances et les fichiers package-lock.
- PostgreSQL et, facultativement, pgAdmin.
- Un éditeur de code, par exemple VS Code.

Utilisez si possible la même version de Node dans toute l’équipe. En cas d’échec, partagez la version de Node et le message d’erreur complet.

## 4. Architecture et état du socle

Structure indicative du dépôt :

    school-sup-project/
    ├── .github/
    │   ├── pull_request_template.md
    │   └── workflows/
    │       └── main-source-branch.yml  (si présent dans le dépôt)
    ├── backend/
    │   ├── database/
    │   │   ├── migrations/
    │   │   ├── migrate.js
    │   │   └── seed.sql
    │   ├── src/
    │   │   ├── config/
    │   │   ├── middlewares/
    │   │   ├── modules/
    │   │   ├── utils/
    │   │   ├── app.js
    │   │   └── routes.js
    │   ├── server.js
    │   ├── .env.example
    │   ├── package.json
    │   └── package-lock.json
    ├── frontend/
    │   ├── src/
    │   │   ├── components/
    │   │   ├── context/
    │   │   ├── pages/
    │   │   ├── services/
    │   │   ├── styles/
    │   │   ├── App.jsx
    │   │   └── main.jsx
    │   ├── .env.example
    │   ├── package.json
    │   └── package-lock.json
    ├── .gitignore
    └── README.MD

Cette arborescence ne signifie pas que toutes les fonctionnalités sont terminées. Le socle examiné comprend le point de santé de l’API et le module de consultation des formations. Les routes d’authentification et de demandes doivent être considérées comme à intégrer tant qu’elles ne sont pas présentes et validées dans le code fusionné. La présence d’un fichier ou d’une page ne prouve pas qu’une US est terminée : ses critères Jira et son parcours doivent être vérifiés.

### Fichiers partagés

- Frontend : App.jsx, main.jsx, composants partagés, contexte d’authentification, client API, styles globaux.
- Backend : configuration, app.js, middlewares, utilitaires et routes.js.
- Base : migrations déjà fusionnées.
- GitHub : workflow de PR et modèle de PR.

Prévenez les propriétaires avant de modifier ces fichiers. Les développeurs des US liées doivent se coordonner sur les modules communs, routes et migrations; « chacun son dossier » ne suffit pas toujours à éviter les conflits.

## 5. Règles métier

Les critères d’acceptation Jira priment. Les règles générales prévues sont :

1. Une demande devient visible par l’agent après confirmation du paiement.
2. Un paiement échoué ne passe pas la demande à l’état payé.
3. Un refus ou une demande de complément comporte un motif communiqué à l’étudiant.
4. Chaque changement de statut est horodaté et conservé dans l’historique.
5. Un étudiant ne consulte que ses propres demandes; les pièces ne sont pas publiques.
6. Le code de vérification d’un reçu est unique.
7. Un dossier finalisé n’est plus modifiable, sauf règle explicitement prévue dans Jira.

| Statut | Signification prévue |
| --- | --- |
| brouillon | L’étudiant n’a pas terminé sa demande. |
| en_attente_paiement | Demande déposée, paiement attendu. |
| paye | Paiement confirmé; dossier visible à l’agent. |
| en_attente_complement | L’agent attend une pièce ou information complémentaire. |
| valide | Dossier accepté. |
| refuse | Dossier refusé avec motif. |

Le retour d’un dossier après ajout de pièces doit suivre la transition définie dans Jira; ne déduisez pas la règle uniquement de ce tableau.

## 6. Équipe et répartition

L’équipe compte un PM, un BA et six développeurs. Les affectations Jira font foi en cas de changement.

| Développeur | Affectation communiquée | Points indiqués |
| --- | --- | ---: |
| Beni NGASSAKI | US3, US6 | 11 |
| Dubien NGASSAI NDONGO | US5, US10 | 11 |
| Todd Gusman Hashall OKANA | US1, US11, US15 | 12 |
| Dreche NDONGALA | US2, US4, US12 | 13 |
| Ulrich ISSOKO | US7, US8, US14 | 13 |
| Alty DELLOT-MVOUMINA (lead dev) | US9, US13, US16 et socle technique | 11 |
| **Total développeurs** | **16 US** | **71** |

Les priorités ne sont volontairement pas recopiées ici : consultez Jira.

### Coordination entre modules

| Domaine | Responsable(s) initialement prévu(s) | Coordination nécessaire |
| --- | --- | --- |
| Demandes | Beni (socle), Dreche (pré-inscription/US4) | S’accorder sur le modèle, routes, validations et migrations avant les PR. |
| Authentification et administration | Todd | Convenir tôt du format du token et des rôles. |
| Paiements et notifications email | Dubien | Confirmer le parcours simulé et les limites avec PM/BA. |
| Catalogue et notifications SMS | Dreche | Prioriser selon Jira; SMS seulement si le périmètre et le temps le permettent. |
| Traitement agent | Ulrich | Coordonner statuts, motifs et pièces avec le module demandes. |
| Reçus et historique | Alty | Coordonner les événements de statut avec les demandes. |

Les propriétaires facilitent la coordination et ne bloquent pas les contributions. Toute modification commune doit être discutée avant la PR.

## 7. Préparer son environnement

### 7.1 Cloner le dépôt

Utilisez l’URL exacte affichée dans GitHub. L’URL ci-dessous reprend le nom de dépôt communiqué par l’équipe; vérifiez-la avant de l’utiliser :

    git clone https://github.com/Beningassaki/school-sup-project.git
    cd school-sup-project
    git switch dev
    git pull origin dev
    git remote -v

L’URL ne doit pas contenir de crochets Markdown. Si le dépôt n’a pas encore ce slug, copiez l’URL HTTPS depuis le bouton **Code** de GitHub.

### 7.2 Créer sa base locale

Chaque développeur utilise sa propre base locale :

    psql -U postgres -c "CREATE DATABASE schoolsup;"

Cette création se fait une seule fois. Si psql n’est pas reconnu, créez la base schoolsup avec pgAdmin.

### 7.3 Installer les dépendances

Dans un terminal, depuis backend :

    cd backend
    npm ci

Dans un second terminal, depuis la racine du dépôt :

    cd frontend
    npm ci

npm ci utilise le lockfile. Ne supprimez pas ou ne modifiez pas package-lock sans raison et sans prévenir l’équipe.

### 7.4 Configurer les fichiers locaux

Avant le premier push, le lead dev doit vérifier que backend/.env.example contient bien les noms des variables ci-dessous et des valeurs fictives/non sensibles. Le fichier était vide dans le dossier analysé; tant qu’il n’est pas complété, créez backend/.env localement avec ces variables. Dans tous les cas, ne commitez jamais le fichier .env.

Dans backend, copiez le modèle complété .env.example vers .env et utilisez vos paramètres PostgreSQL :

    NODE_ENV=development
    PORT=3000
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=schoolsup
    DB_USER=postgres
    DB_PASSWORD=VOTRE_MOT_DE_PASSE_POSTGRESQL
    JWT_SECRET=UNE_LONGUE_VALEUR_ALEATOIRE
    JWT_EXPIRES_IN=1d
    CORS_ORIGIN=http://localhost:5173

Pour générer un secret local :

    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

Dans frontend, copiez .env.example vers .env. La valeur locale attendue est :

    VITE_API_URL=http://localhost:3000/api

Ne partagez pas les valeurs des fichiers .env. Si un vrai secret est poussé sur GitHub, renouvelez-le immédiatement; supprimer le fichier dans un commit ultérieur ne retire pas le secret de l’historique.

## 8. Lancer le projet

Après configuration de PostgreSQL et des fichiers locaux, depuis backend :

    npm run db:migrate

Le seed est destructif : lisez la section 13 avant de lancer :

    npm run db:seed

Démarrez le backend dans un terminal depuis backend :

    npm run dev

Démarrez le frontend dans un autre terminal depuis frontend :

    npm run dev

| Adresse locale | Résultat attendu |
| --- | --- |
| http://localhost:3000/api/health | État de l’API et connexion à la base. |
| http://localhost:3000/api/formations | Formations actives si migration et données sont présentes. |
| http://localhost:5173 | Interface servie par Vite. |
| http://localhost:5173/formations | Page catalogue si elle est intégrée et fonctionnelle. |

Les routes disponibles dépendent du code fusionné; une page encore en construction peut ne pas afficher de données.

Les comptes présents dans le seed sont fictifs, réservés à la base de test et ne doivent jamais être utilisés en production. Consultez backend/database/seed.sql pour les identifiants courants.

## 9. Workflow GitHub

### Branches

- main : branche de référence/livraison.
- dev : branche d’intégration.
- feature/... ou fix/... : travail sur une US ou correction.
- Ne développez pas directement sur main ou dev.
- N’utilisez jamais git push --force sur une branche partagée.

### Créer une branche d’US

Remplacez SCRUM-13 par la vraie clé de votre ticket Jira :

    git switch dev
    git pull origin dev
    git switch -c feature/SCRUM-13-catalogue-formations

Exemple de branche de correction :

    git switch -c fix/SCRUM-42-validation-fichier

Après les changements :

    git status
    git add CHEMIN/DES/FICHIERS
    git commit -m "feat(SCRUM-13): afficher le catalogue"
    git push -u origin feature/SCRUM-13-catalogue-formations

Si dev avance pendant votre travail :

    git fetch origin
    git merge origin/dev

Résolvez les conflits, vérifiez les changements puis poussez à nouveau sans force push.

### Cibles des PR

- Branche d’US vers dev.
- dev vers main, par le responsable de l’intégration.
- N’envoyez pas directement une branche de fonctionnalité vers main.

Le workflow main-source-branch.yml, s’il est présent et activé, contrôle que les PR vers main viennent de dev. Il ne bloque pas à lui seul les pushes directs, n’exécute pas nécessairement les tests et ne remplace pas la protection des branches. L’administrateur doit vérifier les règles GitHub correspondantes.

## 10. Relier GitHub à Jira

Pour retrouver le travail depuis Jira :

1. Mettez la clé exacte de l’US dans le nom de branche.
2. Incluez-la dans le message de commit.
3. Mentionnez-la dans le titre ou la description de la PR.
4. Associez la PR à l’US dans Jira si l’intégration le permet.
5. Utilisez « Closes SCRUM-13 » seulement si la PR terminée signifie que l’US peut réellement être clôturée.

La clé dans les noms aide à retrouver le travail, mais l’association et les mises à jour automatiques dépendent de la configuration Jira–GitHub. La clé SCRUM-13 est un exemple réel fourni par l’équipe; utilisez la clé de votre propre ticket.

## 11. Contribuer au backend

Les modules métier se trouvent dans backend/src/modules/. Le module formations sert d’exemple de séparation routes, contrôleur et service. Une validation Zod peut vivre dans un fichier dédié.

| Fichier | Rôle |
| --- | --- |
| nom.routes.js | Routes HTTP, middleware d’accès et validation. |
| nom.controller.js | Appelle la logique métier et formule la réponse HTTP. |
| nom.service.js | Règles métier et requêtes SQL. |
| nom.validation.js | Validation des données entrantes. |

Format de succès :

    { "succes": true, "data": {} }

Format d’erreur :

    { "succes": false, "message": "Données invalides", "details": [] }

| Code HTTP | Usage |
| --- | --- |
| 200 | Lecture ou modification réussie. |
| 201 | Création réussie. |
| 400 | Données invalides. |
| 401 | Authentification absente ou invalide. |
| 403 | Rôle non autorisé. |
| 404 | Ressource introuvable. |
| 409 | Conflit métier, par exemple email déjà utilisé. |
| 500 | Erreur interne sans divulguer de détails sensibles au client. |

Bonnes pratiques :

- Utilisez les paramètres SQL $1, $2, etc.; ne concaténez jamais les valeurs utilisateur.
- L’authentification seule ne suffit pas : vérifiez que la demande appartient à l’utilisateur connecté.
- Appliquez l’autorisation côté backend, même si le frontend protège aussi la page.
- Validez les entrées et identifiants.
- Utilisez une transaction si plusieurs écritures doivent réussir ensemble, par exemple statut et historique; faites rollback en cas d’erreur et libérez la connexion.
- Enregistrez le nouveau module dans backend/src/routes.js après coordination.
- Convenez du contrat API avec les autres responsables; les routes doivent correspondre aux critères Jira.

## 12. Contribuer au frontend

- Les pages sont classées par domaine dans frontend/src/pages/.
- Utilisez frontend/src/services/api.js pour les appels API lorsque cela convient.
- App.jsx rassemble les routes; les protections d’interface sont complétées par l’autorisation backend.
- Les composants partagés sont dans frontend/src/components/; l’authentification et les styles partagés ont leurs fichiers dédiés.
- Avant de développer contre une API, convenez du chemin, des méthodes, du format de réponse, des erreurs et des rôles avec le développeur backend.
- Gérez les états de chargement, succès, absence de résultat et erreur.
- Coordonnez les changements des fichiers partagés. Pour ajouter une route de page, fournissez son chemin, son composant, le rôle requis et l’US au propriétaire d’App.jsx.

## 13. Base de données et migrations

Les migrations numérotées sont dans backend/database/migrations/ et sont appliquées par :

    npm run db:migrate

- Ne modifiez pas une migration déjà appliquée/fusionnée; créez une nouvelle migration.
- Annoncez le numéro de migration prévu pour éviter les doublons.
- Vérifiez contraintes, clés étrangères, index et compatibilité des données.
- Appliquez migration et seed uniquement à votre base de développement locale.

### Avertissement important sur le seed

backend/database/seed.sql utilise TRUNCATE ... RESTART IDENTITY CASCADE. npm run db:seed efface les données des tables visées avant de les remplir avec les données fictives.

**Ne lancez jamais cette commande sur une base partagée, importante ou de production.** Vérifiez d’abord que votre DB_NAME locale pointe vers votre propre base schoolsup.

## 14. Sécurité et données

- Ne commitez ni .env, mots de passe, tokens, clés secrètes, ni exports contenant des données réelles.
- Le .gitignore racine doit au minimum contenir les règles suivantes :

      .env
      **/.env
      node_modules/
      **/node_modules/
      dist/
      **/dist/
      backend/uploads/

  Ces règles ignorent les secrets, dépendances installées, builds et fichiers téléversés sans exclure les fichiers .env.example. Vérifiez git status avant chaque commit.
- Les données du seed et ses comptes sont uniquement fictifs.
- Les pièces justificatives doivent rester privées; vérifiez l’identité, le rôle et l’accès au dossier avant de les servir.
- Limitez la taille et les types de fichiers; ne faites pas confiance au nom ni au type MIME fournis par le navigateur.
- Le paiement du MVP est simulé/test; ne stockez pas de données de paiement réelles.
- Ne retournez pas au navigateur de traces SQL, secrets, chemins locaux ou détails internes.
- Si un secret est publié accidentellement, révoquez-le et remplacez-le immédiatement. Un commit qui efface le fichier ne purge pas l’historique.

## 15. Conventions de code et commits

Format conseillé :

    type(SCRUM-13): description courte

Types : feat (fonctionnalité), fix (correction), docs (documentation), style (formatage sans changement fonctionnel), refactor (réorganisation), chore (configuration/outillage).

Exemples :

    feat(SCRUM-13): afficher le catalogue
    fix(SCRUM-42): refuser un fichier non pris en charge
    docs(SCRUM-18): clarifier l’installation

Un commit = un changement compréhensible. Évitez les messages vagues comme update, modif ou aaa. Suivez le style du code voisin, évitez les dépendances inutiles et ne mélangez pas un formatage global avec un changement fonctionnel sans raison.

## 16. Pull request et intégration

Avant d’ouvrir une PR :

1. Mettez votre branche à jour avec dev.
2. Vérifiez git status et le diff; ne poussez que les fichiers attendus.
3. Exécutez les vérifications pertinentes.
4. Ouvrez une PR vers dev et remplissez le modèle du dépôt s’il existe.

La PR doit indiquer l’US, le but, les changements, comment tester, les limites/décisions ouvertes et les migrations nécessaires. Ajoutez des captures d’écran pour les changements visuels utiles à vérifier.

Même avec une échéance courte, demandez une vérification rapide par un coéquipier pour les changements touchant l’authentification, les rôles, l’accès aux dossiers, les migrations, les téléversements ou les paiements. Si la revue n’est pas exigée dans les paramètres GitHub, ne la présentez pas comme un contrôle automatiquement garanti.

Après fusion dans dev, le responsable décide quand ouvrir la PR de dev vers main. Ne fusionnez pas une branche de fonctionnalité directement dans main.

## 17. Vérifications avant livraison

Depuis backend :

    npm run lint

Depuis frontend :

    npm run lint
    npm run build

N’affirmez pas qu’une vérification a réussi si elle n’a pas été lancée. Vérifiez les scripts disponibles dans les package.json. S’il n’existe pas de suite de tests backend, testez manuellement les parcours et cas d’erreur de l’US.

Selon le changement, vérifiez notamment : accès autorisé/refusé, données invalides, ressource absente, migration sur une base locale de test, et états de chargement/succès/erreur côté interface.

## 18. Dépannage

| Problème | Vérifications |
| --- | --- |
| Repository not found | Vérifiez l’URL avec git remote -v, l’orthographe du dépôt, vos droits et votre authentification GitHub. N’ajoutez pas de crochets à l’URL. |
| no upstream branch | Pour une nouvelle branche, utilisez git push -u origin nom-de-branche. |
| npm ci échoue | Vérifiez la version de Node, le lockfile et le message complet; ne supprimez pas le lockfile sans coordination. |
| Connexion PostgreSQL refusée | Vérifiez que PostgreSQL tourne et que DB_HOST, DB_PORT, DB_NAME, DB_USER et DB_PASSWORD correspondent à votre base locale. |
| Variable manquante | Vérifiez que backend/.env a été créé depuis .env.example, sans partager ses valeurs secrètes. |
| Erreur CORS | Vérifiez CORS_ORIGIN côté backend et l’adresse Vite utilisée. |
| Migration échouée | Lisez l’erreur, vérifiez la base sélectionnée et les migrations déjà appliquées; ne supprimez pas de table au hasard. |
| Conflit Git | Conservez les changements de chacun, demandez au propriétaire du fichier concerné, vérifiez le diff puis relancez les contrôles. |
| Seed lancé sur la mauvaise base | Arrêtez toute opération et prévenez l’équipe; les données supprimées ne sont pas automatiquement récupérables. |

Pour demander de l’aide, partagez la commande, le message complet et les étapes tentées. Masquez secrets, mots de passe, tokens et données personnelles.

---

## Aide-mémoire Git

    git switch dev
    git pull origin dev
    git switch -c feature/SCRUM-13-description-courte

    # Après développement et vérification
    git status
    git add CHEMIN/DES/FICHIERS
    git commit -m "feat(SCRUM-13): description courte"
    git push -u origin feature/SCRUM-13-description-courte

Ouvrez ensuite une PR vers dev, liez-la à l’US Jira et attendez son intégration avant de commencer une tâche dépendante.
