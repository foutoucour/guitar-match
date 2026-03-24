# Guitar Match — Product Requirements Document

## Vision

Guitar Match est un jeu web de duels de guitares. Deux modes s'opposent : voter pour alimenter un classement mondial, ou construire une collection personnelle limitée en choisissant quelles guitares garder. Le produit révèle l'identité musicale du joueur à travers ses choix, pas à travers un formulaire.

---

## Problème

Les guitaristes ont des opinions fortes sur le matériel mais peu d'endroits où les exprimer de façon légère et engageante. Les classements existants (magazines, forums) sont statiques et décidés par des experts. Guitar Match donne la parole aux joueurs et rend le débat ludique.

---

## Personas

### Le Passionné (core user)
- Guitariste amateur ou semi-pro, 20-45 ans
- Suit l'actu gear, navigue sur Reverb régulièrement
- Veut montrer son goût, débattre sans se prendre au sérieux

### Le Curieux
- Pas forcément guitariste, mais fan de musique
- Attire par le jeu viral, reste pour la découverte de modèles

---

## Features

### P0 — MVP

| Feature | Description |
|---|---|
| Mode Random | Duel entre deux guitares aléatoires, vote alimente l'ELO |
| Mode Survivor | On garde la guitare choisie, collection limitée à 5 emplacements |
| Collection | Vitrine personnelle des guitares survivantes avec leur historique |
| Catalogue guitares | Modèles issus de Reverb API, enrichis régulièrement |
| Débat soft | Réaction courte après chaque vote (1 tap) |

### P1 — Post-MVP

| Feature | Description |
|---|---|
| Duel du Jour | Un matchup quotidien commun à tous les joueurs |
| Stats surprises | Une stat inattendue révélée après chaque vote |
| Classement ELO | Leaderboard global par catégorie |
| Classement amis | Comparer sa collection avec ses amis |
| Partage collection | Carte générée "Voici mes 5 guitares" |

### P2 — Futur

| Feature | Description |
|---|---|
| Tournois thématiques | Semaine des Gibsons, Battle des basses, etc. |
| Profil musical auto-généré | "Tu es un Fender guy, tu préfères le vintage" |
| Notifications | "Un ami a voté différemment de toi sur le duel d'hier" |

---

## Contraintes

- **Données** : Reverb API pour les guitares (photos, marque, modèle, catégorie)
- **Pas de compte obligatoire au MVP** : collection stockée localement, compte optionnel pour le social
- **Mobile-first** : l'expérience duel doit fonctionner en portrait sur mobile
- **Performance** : affichage du duel < 300ms (images préchargées)

---

## Métriques de succès

| Métrique | Cible MVP |
|---|---|
| Votes par session | > 10 |
| Retour J+1 | > 20% |
| Partages collection | > 5% des sessions |
| Duels complétés Mode Survivor | > 3 par utilisateur |

---

## Hors scope MVP

- Commentaires texte libres
- Achat/lien vers Reverb (affiliation future)
- Application native mobile
- Authentification complexe (OAuth, email verification)
