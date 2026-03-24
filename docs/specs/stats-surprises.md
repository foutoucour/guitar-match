# Spec — Stats Surprises

## Description

Après chaque vote, une stat inattendue est affichée pour ce matchup. L'objectif n'est pas de montrer le % brut mais de révéler une tendance culturelle ou démographique surprenante.

---

## Types de stats

| Type | Exemple | Condition d'affichage |
|---|---|---|
| `age_split` | "Les moins de 30 ans choisissent la Jazzmaster 2x plus que les autres" | Écart > 40% entre tranches d'âge |
| `owner_paradox` | "La Telecaster perd contre ceux qui en possèdent une" | Corrélation réaction `own_one` vs vote |
| `genre_surprise` | "Les metalleux choisissent la Jazzmaster plus que les rockeurs" | Écart > 30% entre catégories de profil |
| `underdog` | "Ce modèle bat tout le monde... sauf les Gibsons" | Win rate > 70% sauf contre une marque |
| `trend` | "La Les Paul remonte : +15 points ELO ce mois-ci" | Variation ELO > 10 sur 30 jours |
| `loyalty` | "Ceux qui ont cette guitare en collection votent pour elle 95% du temps" | Corrélation collection vs vote |

---

## Règles d'affichage

- Une seule stat par duel (la plus surprenante disponible)
- Seuil minimum de données : une stat n'est affichée que si elle est basée sur >= 50 votes
- Si aucune stat disponible : pas d'affichage (pas de stat générique)
- La stat concerne toujours au moins une des deux guitares du duel en cours

### Algorithme de sélection
1. Calculer toutes les stats disponibles pour ce matchup
2. Scorer chaque stat par "surprise" (écart par rapport à la moyenne globale)
3. Afficher la stat au score le plus élevé

---

## Format d'affichage

- Une phrase courte (max 80 caractères)
- Précédée d'une icône contextuelle (graphique, trophée, flamme...)
- Affichée sous le résultat ELO, avant les réactions

---

## Données requises

Pour calculer ces stats, chaque vote enregistre (si disponible) :
- `player_age_range` : < 25, 25-35, 35-45, > 45 (optionnel, fourni par le joueur)
- `reaction` : réaction débat soft
- `has_in_collection` : si une des deux guitares est en collection du joueur
