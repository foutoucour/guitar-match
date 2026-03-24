# Spec — Mode Random

## Description

Le joueur reçoit deux guitares tirées aléatoirement. Il vote pour l'une d'elles. Son vote alimente le classement ELO global. Aucune conséquence sur sa collection.

---

## Règles métier

### Sélection des guitares
- Les deux guitares sont tirées aléatoirement depuis le catalogue actif
- Les deux guitares doivent appartenir à la **même catégorie** (électrique, acoustique, basse, etc.)
- Le même modèle ne peut pas apparaître deux fois dans le même duel
- Un duel entre deux modèles déjà présentés ensemble dans les 10 derniers duels du joueur est évité

### Vote
- Le joueur doit choisir exactement une des deux guitares
- Un vote ne peut pas être annulé
- Un seul vote par duel par joueur (session ou compte)
- Le vote est enregistré immédiatement côté serveur avant d'afficher le résultat

### Réaction (Débat soft)
- Après le vote, le joueur peut (optionnellement) sélectionner une réaction parmi :
  - "Choix impossible"
  - "Trop facile"
  - "Je connais pas les deux"
  - "Je possède une des deux"
  - "J'ai joué les deux"
- Une seule réaction par duel
- La réaction est optionnelle — le joueur peut passer directement au duel suivant

### Affichage post-vote
- Le score ELO actuel des deux guitares est affiché après le vote
- Une stat surprise est affichée (si disponible pour ce matchup)
- Le bouton "Suivant" charge immédiatement le prochain duel (préchargé)

### Calcul ELO
- Algorithme ELO standard, K-factor = 32
- L'ELO est calculé au niveau du **modèle** (pas du listing individuel)
- Les deux scores sont mis à jour à chaque vote

---

## États de l'interface

| État | Description |
|---|---|
| `loading` | Chargement du duel, images en cours de préchargement |
| `ready` | Deux guitares affichées, attente du vote |
| `voted` | Guitare choisie mise en avant, résultat ELO + stat surprise affichés |
| `reacting` | Sélection optionnelle de la réaction |
| `error` | Impossible de charger le catalogue (réseau, API) |

---

## Données requises par guitare

- `id` — identifiant unique du modèle
- `brand` — marque (ex: Fender)
- `model` — modèle (ex: Telecaster)
- `year_range` — fourchette d'années (ex: 1970-1980)
- `category` — électrique | acoustique | basse | autre
- `image_url` — photo principale
- `elo_score` — score ELO courant
- `total_duels` — nombre total de duels joués

---

## Contraintes techniques

- L'image du prochain duel est préchargée pendant que le joueur voit le résultat
- Le vote est envoyé en < 200ms (optimistic update)
- Si le réseau est absent, le vote est mis en queue et envoyé à la reconnexion
