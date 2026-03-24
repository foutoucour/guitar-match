# Spec — Collection

## Description

La collection est la vitrine personnelle du joueur. Elle contient jusqu'à 5 guitares actives et un cimetière illimité. Elle est construite exclusivement via le Mode Survivor.

---

## Règles métier

### Affichage
- Les 5 emplacements sont toujours visibles, vides ou occupés
- Chaque guitare affiche : photo, marque, modèle, nombre de victoires, statut
- Le cimetière est accessible depuis la collection (section dépliable ou page dédiée)

### Statuts d'une guitare

| Statut | Condition | Affichage |
|---|---|---|
| `active` | En collection, < 10 victoires | Normal |
| `legendary` | En collection, >= 10 victoires | Badge "Légende" |
| `sacrificed` | Retirée de la collection | Grisée, dans le cimetière |

### Partage
- La collection génère une carte partageable (image statique)
- La carte contient : les photos des 5 guitares (ou emplacements vides), le nom du joueur
- Format adapté Instagram/Twitter (1:1 et 16:9)
- La carte est générée côté serveur (pas de dépendance au navigateur)

### Profil musical auto-généré
- Calculé à partir des votes en collection et du cimetière
- Exemples de tags : "Fender loyalist", "Vintage hunter", "Genre switcher"
- Affiché sur la page collection, inclus dans la carte partageable

---

## Règles de calcul du profil musical

| Condition | Tag |
|---|---|
| >= 3 guitares de la même marque en collection | "{Marque} loyalist" |
| >= 3 guitares fabriquées avant 1980 | "Vintage hunter" |
| Aucune marque représentée plus d'une fois | "Explorer" |
| >= 5 guitares sacrifiées | "Restless" |
| >= 1 guitare avec statut `legendary` | "Keeper" |

---

## Données

### Page collection
- Liste des guitares actives (triées par date d'entrée)
- Liste des guitares sacrifiées (triées par date de sacrifice, les plus récentes d'abord)
- Profil musical calculé
- Bouton partage

### Carte partageable
- `player_name`
- `guitars[5]` : photo + brand + model
- `profile_tag`
- `generated_at`
