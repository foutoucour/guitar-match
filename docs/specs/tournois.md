# Spec — Tournois Thématiques

## Description

Des tournois périodiques regroupent un ensemble de guitares autour d'un thème. Ils ont une durée limitée et un classement propre.

---

## Règles métier

### Structure d'un tournoi
- Thème : catégorie (ex: "Battle des Gibsons"), décennie (ex: "Vintage 70s"), usage (ex: "Guitares de scène")
- Durée : 7 jours par défaut
- Catalogue limité : 16 ou 32 guitares sélectionnées pour le tournoi
- Format : élimination directe ou round-robin (selon taille du catalogue)

### Participation
- Le joueur rejoint le tournoi volontairement (pas forcé)
- Les votes dans un tournoi sont indépendants des votes Mode Random (ELO général non affecté)
- Un joueur peut participer à plusieurs tournois en parallèle

### Classement du tournoi
- Classement ELO propre au tournoi, remis à zéro à chaque édition
- Le vainqueur du tournoi reçoit un badge sur sa fiche modèle
- Archive des tournois passés consultable

### Fréquence
- Maximum 2 tournois actifs simultanément
- Nouveau tournoi annoncé 48h à l'avance

---

## Lien avec la collection (Mode Survivor)

- Les guitares participant à un tournoi peuvent aussi être challengées en Mode Survivor
- Si une guitare d'un tournoi est en collection du joueur → signalé pendant le tournoi

---

## Données

### Tournoi
- `id`
- `title` — ex: "Semaine des Gibsons"
- `theme_category` — marque | décennie | usage
- `guitars[]` — liste des modèles participants
- `starts_at` / `ends_at`
- `status` : upcoming | active | completed

### Résultat de tournoi
- `winner_guitar_id`
- `final_rankings[]`
- `total_votes`
