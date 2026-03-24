# Spec — Duel du Jour

## Description

Chaque jour, un seul matchup est proposé à tous les joueurs simultanément. Le résultat est révélé à minuit. Ce duel existe dans les deux modes.

---

## Règles métier

### Sélection du duel
- Un duel est sélectionné manuellement (ou via un algorithme) chaque jour
- Il met en avant deux guitares emblématiques ou controversées
- Le même duel n'est pas répété dans les 90 jours

### Participation
- Chaque joueur peut voter une seule fois par jour
- Le vote est verrouillé après participation (pas de changement)
- Le joueur voit son vote même après avoir voté

### Révélation
- Les résultats (% de votes, stat surprise, réactions agrégées) sont révélés à minuit heure locale du serveur
- Avant révélation : seul le nombre de participants est affiché ("1 247 joueurs ont voté")
- Après révélation : résultats complets visibles par tous

### Mode Random
- Le vote du Duel du Jour alimente l'ELO global comme un vote normal
- La réaction (débat soft) est disponible

### Mode Survivor
- Si une des deux guitares est dans la collection du joueur, le duel est signalé : "Ta collection est en jeu"
- Si le joueur vote pour la challenger et sa collection est pleine → règles de sacrifice normales
- Si le joueur vote pour sa guitare → elle reste, la challenger est éliminée

### Streak
- Si le joueur participe X jours consécutifs, il reçoit un badge de streak
- Niveaux : 3 jours, 7 jours, 30 jours

---

## États

| État | Description |
|---|---|
| `open` | Le duel est ouvert, le joueur n'a pas encore voté |
| `voted_pending` | Le joueur a voté, résultats pas encore révélés |
| `revealed` | Résultats visibles |
| `missed` | Le joueur n'a pas voté hier — duel expiré |
