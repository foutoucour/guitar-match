# Spec — Débat Soft

## Description

Après chaque vote (Mode Random et Duel du Jour), le joueur peut ajouter une réaction courte en un tap. Ces réactions sont des métadonnées qui améliorent la qualité des matchups.

---

## Réactions disponibles

| ID | Label | Signal métier |
|---|---|---|
| `impossible` | "Choix impossible" | Matchup équilibré, candidat pour Duel du Jour |
| `easy` | "Trop facile" | Une guitare écrase l'autre, ELO divergent |
| `dont_know` | "Je connais pas les deux" | Manque de notoriété, à filtrer pour débutants |
| `own_one` | "Je possède une des deux" | Attachement fort, vote potentiellement biaisé |
| `played_both` | "J'ai joué les deux" | Vote expert, poids supérieur (futur) |

---

## Règles métier

- Une seule réaction par duel par joueur
- La réaction est **optionnelle** — le joueur peut passer au suivant sans réagir
- La réaction peut être soumise jusqu'à 30 secondes après le vote
- Pas de modification après soumission

### Agrégation
- Les réactions sont agrégées par matchup (paire de modèles)
- Un matchup avec > 30% de réactions `impossible` est éligible au Duel du Jour
- Un matchup avec > 50% de réactions `easy` est déprioritisé dans le tirage aléatoire
- Un matchup avec > 40% de réactions `dont_know` est exclu pour les nouveaux joueurs (< 10 votes)

---

## Affichage

- Les réactions sont présentées après le vote, avant la stat surprise
- Format : rangée de boutons pill, icône + label court
- Après sélection : la réaction choisie est mise en avant, les autres grisées
- Le total de chaque réaction pour ce matchup est affiché après sélection
