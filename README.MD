# School-Sup — Démarches universitaires en ligne

**School-Sup** est une plateforme web destinée à simplifier certaines démarches administratives de l’Université Marien Ngouabi. Elle aide les nouveaux bacheliers et les étudiants, notamment ceux qui vivent en province, à trouver les informations utiles, déposer une demande et suivre son traitement sans multiplier les déplacements.

Le MVP se concentre sur deux démarches : **la pré-inscription** et **la légalisation d’attestations**. Il comprend un parcours de paiement Mobile Money de démonstration, le suivi des dossiers et un espace de traitement pour les agents.

## Fonctionnalités du MVP

| Module | Fonctionnalités prévues |
| --- | --- |
| **Compte et accès** | Création de compte étudiant, connexion et déconnexion (US1) |
| **Catalogue** | Consultation des facultés, filières et conditions d’accès (US2) |
| **Demandes** | Dépôt d’une demande de légalisation ou de pré-inscription avec pièces justificatives (US3, US4) |
| **Paiement** | Parcours Mobile Money en mode démonstration; paiement confirmé ou échoué (US5) |
| **Suivi** | Consultation du statut, du motif de refus et de l’historique du dossier (US6, US16) |
| **Espace agent** | Consultation des dossiers payés, validation, refus motivé, filtre et demande de pièce complémentaire (US7, US8, US11, US14) |
| **Reçu** | Reçu numérique après validation, avec code de vérification unique (US9) |
| **Notifications** | Email lors d’un changement de statut; SMS si le temps le permet (US10, US12) |
| **Administration** | Paramétrage du catalogue, des pièces et des montants, selon le temps disponible (US15) |
| **Vérification** | Vérification d’un document avec son code si le temps le permet (US13) |

Les User Stories et leurs critères d’acceptation détaillés sont suivis dans Jira. Le tableau Jira fait foi si une priorité, une affectation ou un statut change.

## Périmètre et règles produit

### Inclus dans le MVP

- Une application web en français, utilisable sur smartphone.
- Deux types de demandes : légalisation d’attestation et pré-inscription.
- Dépôt de pièces justificatives, suivi du dossier et traitement par un agent.
- Paiement Mobile Money simulé ou effectué dans un environnement de test.

### Hors périmètre

- Paiement réel en production et remboursements automatiques.
- Connexion aux systèmes internes de l’Université Marien Ngouabi.
- Application mobile native.

### Règles importantes

- Un dossier devient visible à l’agent après confirmation du paiement; un paiement échoué ne change pas son statut.
- Un refus ou une demande de pièce complémentaire doit comporter un motif visible par l’étudiant.
- Chaque changement de statut est horodaté et conservé dans l’historique.
- Un étudiant ne consulte que ses propres dossiers; les pièces jointes ne sont pas publiques.
- Le code de vérification d’un reçu est unique. Un dossier validé ou refusé n’est plus modifiable.

## Acteurs

| Acteur | Responsabilité dans le produit |
| --- | --- |
| **Étudiant** | Crée un compte, consulte le catalogue, dépose et paie une demande, puis suit son dossier. |
| **Agent de scolarité** | Consulte les dossiers payés, vérifie les pièces et valide, refuse ou demande un complément. |
| **Administrateur produit** | Configure le catalogue, les pièces demandées et les montants selon les fonctionnalités livrées. |

## Lancer le projet en local

Le dépôt contient actuellement le README et le workflow GitHub Actions; le code de l’application et sa stack ne sont pas encore présents. Les prérequis, l’installation, les variables d’environnement et les commandes pour lancer et tester le produit seront ajoutés dès que le code sera intégré. Ne publiez jamais de secrets ou de données personnelles réelles dans le dépôt.

## Structure du dépôt

```text
school-up-project/
├── .github/
│   └── workflows/
│       └── main-source-branch.yml  Contrôle la branche source des PR vers main
├── README.MD                      Présentation, périmètre et consignes d’équipe
└── Code source de l’application   À intégrer
```

## Méthode de travail

L’équipe travaille en sprint court avec un point quotidien de 15 minutes maximum : avancement, prochaine tâche et blocages. Priorisez les US **Must**, puis les **Should**; gardez les **Could** pour la fin si le temps le permet. Le Product Manager porte les priorités, le Business Analyst clarifie les exigences et critères d’acceptation, et les développeurs contribuent aux choix techniques et signalent rapidement les ambiguïtés.

### Jira, branches et Pull Requests

Une **US Jira** décrit le travail à faire et son suivi. Une **branche Git** est l’espace où le développeur réalise ce travail : ce sont deux éléments différents, reliés par la clé Jira.

Les branches partagées du dépôt sont `main` et `dev` :

1. Créez une branche courte depuis `dev` pour une US ou une fonctionnalité.
2. Ouvrez une Pull Request de cette branche vers `dev` pour intégrer le travail.
3. Quand l’intégration est prête, ouvrez une Pull Request de `dev` vers `main`.
4. N’envoyez pas directement de commit sur `main`.

Nommez vos branches à partir de la clé Jira, par exemple `feature/SUP-12-demande-legalisation`. Remplacez `SUP` par la vraie clé du projet Jira. Les PR vers `main` doivent provenir de `dev`; le workflow du dépôt vérifie cette règle. Même sans approbation obligatoire, une vérification rapide par un coéquipier est recommandée lorsque le délai le permet.

Exemple :

```bash
git switch dev
git pull origin dev
git switch -c feature/SUP-12-demande-legalisation
```

Après le développement :

```bash
git add <fichier-modifie>
git commit -m "feat(SUP-12): déposer une demande de légalisation"
git push -u origin feature/SUP-12-demande-legalisation
```

Reliez la PR à l’US Jira et décrivez les changements, les vérifications effectuées et les éventuelles limites. Utilisez des données fictives pour les tests et les démonstrations.

## Équipe et répartition des User Stories

La squad comprend un Product Manager, un Business Analyst et six développeurs. La répartition ci-dessous reprend le document de sprint; Jira reste la référence pour les changements d’affectation.

| Développeur | User Stories assignées | Points |
| --- | --- | ---: |
| **Beni NGASSAKI** | US3, US6 | 11 |
| **Dubien NGASSAI NDONGO** | US5, US10 | 11 |
| **Todd Gusman Hashall OKANA** | US1, US11, US15 | 12 |
| **Dreche NDONGALA** | US2, US4, US12 | 13 |
| **Ulrich ISSOKO** | US7, US8, US14 | 13 |
| **Alty DELLOT-MVOUMINA** | US9, US13, US16 | 11 |
| **Total** | **16 US** | **71** |

### Dépendances à coordonner

- L’US1 (compte) doit être disponible tôt pour les demandes US3 et US4.
- Le paiement US5 doit s’accorder avec les dossiers traités par les US7 et US8.
- Le reçu US9 et la vérification US13 doivent utiliser un format de code cohérent.
- Les US3 et US5 sont les plus risquées dans la répartition; signalez leur blocage sans attendre.
- Les US12, US13 et US16 sont à traiter en dernier si le temps le permet.

## Liens utiles

- **Projet Jira** : ajouter le lien du board.
- **Dépôt GitHub** : [school-sup](https://github.com/Beningassaki/school-sup)
