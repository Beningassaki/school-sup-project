# School-Sup

School-Sup est une plateforme web destinée à simplifier certaines démarches administratives universitaires à l’Université Marien Ngouabi. Elle vise en particulier les nouveaux bacheliers et les étudiants qui doivent aujourd’hui se déplacer pour obtenir des informations, déposer un dossier ou suivre son traitement.

## Objectif du MVP

Permettre à un étudiant de déposer une demande à distance, de suivre son avancement et, dans le cadre du prototype, de tester le paiement des frais. Un agent doit pouvoir consulter les dossiers concernés et les traiter.

## Périmètre fonctionnel

### Priorité Must

- Créer un compte étudiant et se connecter.
- Consulter les facultés, les filières et leurs conditions d’accès.
- Déposer une demande de légalisation ou de pré-inscription avec les pièces requises.
- Effectuer le parcours de paiement Mobile Money dans l’environnement de démonstration.
- Consulter le statut d’une demande et le motif d’un refus.
- Permettre à l’agent de consulter les dossiers payés, puis de les valider ou de les refuser avec un motif.
- Générer un reçu numérique avec un code de vérification unique après validation.

### Priorité Should

- Envoyer un email lors d’un changement de statut.
- Filtrer les dossiers par type et par statut.
- Permettre à l’agent de demander une pièce complémentaire.
- Consulter l’historique d’un dossier.
- Paramétrer le catalogue, les pièces demandées et les montants, si le temps le permet.

### Priorité Could

- Envoyer des notifications par SMS.
- Vérifier un document depuis son code de vérification.

Les critères d’acceptation, les responsables, les dépendances et l’état d’avancement des US sont suivis dans Jira. Jira fait foi si une priorité ou une affectation change.

## Hors périmètre du MVP

- Paiement réel en production et remboursements automatiques.
- Connexion aux systèmes internes de l’Université Marien Ngouabi.
- Application mobile native : le produit est une application web à rendre utilisable sur smartphone.

## Utilisateurs et rôles

- **Étudiant** : crée un compte, dépose et paie une demande, puis suit son dossier.
- **Agent de scolarité** : consulte les dossiers payés, vérifie les pièces et traite les demandes.
- **Administrateur produit** : configure le catalogue, les pièces demandées et les montants selon le périmètre livré.

## Organisation de l’équipe

- **Product Manager** : porte la vision, priorise le produit et arbitre le périmètre avec la squad.
- **Business Analyst** : maintient les exigences, les User Stories et leurs critères d’acceptation, puis contribue à la recette fonctionnelle.
- **Développeurs** : conçoivent, développent, intègrent et vérifient les fonctionnalités.
- **Repo admin** : gère les accès, les branches protégées et l’intégration GitHub. Ce rôle ne remplace pas les décisions produit de la squad.

Les six développeurs se répartissent les US dans Jira. Signalez rapidement les blocages et les dépendances, notamment entre l’authentification et les demandes, entre le paiement et le traitement agent, ainsi qu’entre le reçu et son code de vérification.

## Méthode de travail

L’équipe travaille en sprint court, avec synchronisation quotidienne et priorisation des US Must avant les Should et Could. Avant de commencer une US, vérifiez dans Jira son responsable, ses critères d’acceptation et ses dépendances. Si une exigence est ambiguë, faites-la clarifier avec le BA et le PM avant de figer l’implémentation.

### Flux Git

Les branches partagées sont `main` et `dev` :

1. Créez une branche courte depuis `dev` pour une US ou une fonctionnalité.
2. Faites une Pull Request de cette branche vers `dev` pour l’intégration.
3. Quand `dev` est prêt pour une livraison, ouvrez une Pull Request de `dev` vers `main`.
4. Gardez `main` présentable et à jour ; ne poussez pas directement dessus.

Nommez les branches avec la clé Jira, par exemple `feature/SUP-12-demande-legalisation` ou `fix/SUP-18-statut-paiement`. Remplacez `SUP` par la clé réelle de votre projet Jira.

Exemple de création de branche :

```bash
git switch dev
git pull origin dev
git switch -c feature/SUP-12-demande-legalisation
```

Poussez votre branche et ouvrez ensuite une Pull Request vers `dev` :

```bash
git push -u origin feature/SUP-12-demande-legalisation
```

Dans le titre et la description de la PR, indiquez la clé Jira, ce qui a changé, comment vérifier le résultat et les éventuelles limites. Faites une vérification ciblée par un coéquipier lorsque le délai le permet. Ne fusionnez pas une fonctionnalité si elle casse le parcours déjà intégré.

Utilisez des commits descriptifs, par exemple :

```text
feat(SUP-12): déposer une demande de légalisation
fix(SUP-18): conserver le statut après un paiement échoué
```

Ne commitez jamais de mot de passe, clé API, jeton ou fichier contenant des données personnelles réelles. Utilisez des données fictives pour les démonstrations.

## Technologies et démarrage

La stack technique et les commandes d’installation, de lancement et de test seront ajoutées ici dès que l’architecture du dépôt sera initialisée. Ne commitez aucune valeur secrète ; documentez les variables nécessaires dans un fichier `.env.example` sans valeur confidentielle.

## Liens

- **Backlog et suivi du sprint Jira** : à compléter avec le lien du projet Jira.
- **Dépôt GitHub** : [school-up-project](https://github.com/Beningassaki/school-up-project)
