# Spec — Classement Amis

## Description

Les joueurs peuvent comparer leur collection et leurs votes avec leurs amis. Pas de réseau social complet — juste un lien de partage et une vue de comparaison.

---

## Règles métier

### Connexion entre amis
- Pas de système de "follow" ou d'amis bidirectionnel au MVP
- Un joueur partage son profil via un **lien unique** (`/p/{slug}`)
- Quiconque a le lien peut voir la collection publique

### Visibilité du profil
- Par défaut : collection publique, votes individuels privés
- Le joueur peut rendre son profil entièrement privé (lien désactivé)

### Vue de comparaison
- Accessible depuis `/compare/{slug-a}/{slug-b}`
- Affiche les deux collections côte à côte
- Met en évidence :
  - Les guitares en commun dans les deux collections
  - Les guitares sur lesquelles les deux joueurs ont voté différemment (si disponible)
  - Les profils musicaux des deux joueurs

### Divergences de votes
- Si les deux joueurs ont voté sur le même duel mais différemment → signalé comme "désaccord"
- La liste des désaccords est affichée dans la vue de comparaison
- Maximum 5 désaccords affichés (les plus récents)

---

## Données

### Profil public
- `slug` — identifiant unique (ex: `guitarguy-42`)
- `collection` — guitares actives
- `profile_tag` — tag musical auto-généré
- `total_votes` — nombre total de votes
- `member_since` — date d'inscription

### Profil privé (non partageable)
- Votes individuels
- Cimetière
- Streak Duel du Jour
