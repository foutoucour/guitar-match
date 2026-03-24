# Spec — Mode Survivor

## Description

Le joueur part avec une collection vide (max 5 emplacements). À chaque duel, deux guitares s'affrontent. La guitare choisie **entre dans la collection** si elle n'y est pas déjà, ou **reste** si elle y est déjà. Si la collection est pleine, le joueur doit **sacrifier une guitare existante** pour accueillir la nouvelle.

---

## Règles métier

### Début de session
- Le joueur démarre une session Survivor avec sa collection actuelle (vide au premier lancement)
- Une session peut être reprise à tout moment

### Le duel
- Deux guitares sont présentées : la **challenger** (nouvelle) et soit une guitare au hasard, soit la dernière guitare jouée
- Si la collection est vide : le joueur choisit entre deux challengers, la gagnante entre en collection
- Si la collection a au moins une guitare : la challenger affronte une guitare tirée de la collection

### Choix du joueur — collection non pleine (< 5)
- **Je choisis la challenger** : elle entre en collection, la guitare de la collection reste
- **Je garde ma guitare** : la challenger est éliminée, la guitare de la collection reste

### Choix du joueur — collection pleine (= 5)
- **Je choisis la challenger** : le joueur doit désigner quelle guitare de sa collection est sacrifiée pour libérer un emplacement
- **Je garde ma guitare** : la challenger est éliminée, collection inchangée
- Le joueur voit les 5 guitares de sa collection avant de confirmer le sacrifice

### Historique d'une guitare en collection
Chaque guitare conserve :
- Nombre de challengers repoussées
- Date d'entrée en collection
- Statut : `active` | `legendary` (après 10 victoires) | `sacrificed`
- Si sacrifiée : par quelle guitare elle a été remplacée

### Guitares sacrifiées
- Elles quittent la collection active mais restent dans le **cimetière** (historique consultable)
- Le cimetière est illimité
- Une guitare sacrifiée peut revenir comme challenger dans les duels suivants

### Règle de non-répétition
- La même challenger ne peut pas apparaître deux fois dans la même session
- Une guitare déjà en collection ne peut pas être proposée comme challenger

---

## États de l'interface

| État | Description |
|---|---|
| `loading` | Chargement du duel |
| `ready` | Challenger vs guitare de collection (ou 2 challengers si collection vide) |
| `choosing_sacrifice` | Collection pleine, le joueur choisit quelle guitare sacrifier |
| `result` | Résultat du duel, mise à jour de la collection affichée |
| `collection_full_no_sacrifice` | Le joueur refuse de sacrifier — la challenger est renvoyée |

---

## Données spécifiques Mode Survivor

### Collection (par joueur)
```
collection {
  slots: Guitar[5]         // max 5
  graveyard: Guitar[]      // illimité
}
```

### Guitar dans la collection
```
guitar {
  id
  brand
  model
  image_url
  victories: number        // challengers repoussées
  entered_at: date
  status: active | legendary | sacrificed
  sacrificed_for?: guitar_id
}
```

---

## Contraintes

- La collection est persistée côté serveur (avec compte) ou localStorage (sans compte)
- Une session sans compte peut être transférée vers un compte lors de la création
- Le sacrifice est irréversible dans la session en cours
