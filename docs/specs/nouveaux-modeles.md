# Spec — Nouveaux Modèles Réguliers

## Description

Le catalogue de guitares est enrichi régulièrement. Chaque modèle ajouté est associé à des métadonnées structurées et une image hébergée en propre dans un blob storage. Les images ne sont jamais servies directement depuis une source externe.

---

## Règles métier

### Ajout d'un modèle

- Un modèle représente un **type de guitare** (ex: Fender Telecaster 1972), pas un listing individuel
- Un modèle n'est ajouté au catalogue actif qu'une fois ses données et son image validées
- Le modèle est d'abord en statut `draft` jusqu'à validation manuelle

### Fréquence

- Objectif : minimum 10 nouveaux modèles par semaine
- Les ajouts sont groupés en "batches" pour limiter la charge opérationnelle
- Les nouveaux modèles n'apparaissent pas dans les duels avant d'avoir atteint un minimum de 10 votes initiaux (warm-up)

### Warm-up ELO

- À l'ajout, un modèle reçoit un ELO de départ de 1000 (valeur neutre)
- Pendant les 10 premiers duels, il est uniquement proposé contre des modèles de niveau ELO proche (±100)
- Après 10 duels, il entre dans le pool de tirage normal

---

## Pipeline d'ingestion des images

### Stratégie par phase

| Phase | Source principale | Droits |
|---|---|---|
| MVP | Reverb | Téléchargement unique, usage éditorial |
| Post-MVP | Press kits constructeurs (Fender, Gibson, PRS...) | Éditorial avec attribution |
| Modèles vintage / iconiques | Wikimedia Commons | CC avec attribution |
| Modèles rares introuvables ailleurs | eBay listings | Téléchargement unique, même traitement que Reverb |

### Reverb comme source primaire (MVP)

- Recherche manuelle dans les listings Reverb ou via l'API Reverb
- Sélectionner des photos de bonne qualité représentant bien le modèle (fond neutre privilégié)
- L'image est téléchargée **une seule fois** — elle n'est jamais chargée dynamiquement depuis Reverb
- Usage dans un contexte éditorial non commercial au MVP

### Évolution post-MVP

- Contacter directement les services presse des constructeurs majeurs (Fender, Gibson, PRS, Gretsch)
- Les press kits incluent généralement des photos HD sur fond blanc, libres d'usage éditorial avec mention de la marque
- Objectif : remplacer progressivement les images Reverb des modèles courants par des photos officielles

### Processus d'ingestion

1. L'image source est téléchargée **une seule fois** lors de l'ingestion du modèle
2. Elle est stockée dans un blob storage (ex: S3, R2, GCS)
3. L'URL externe originale et la source (`reverb` | `manufacturer` | `wikimedia` | `ebay`) sont archivées dans les métadonnées
4. Seule l'URL interne (blob storage) est utilisée dans l'application

### Traitement à l'ingestion

- Redimensionnement : génération de 3 variantes (thumbnail 200px, card 600px, full 1200px)
- Format : conversion en WebP
- Les variantes sont stockées dans le même bucket avec un suffixe (`_thumb`, `_card`, `_full`)

### Droits et gestion des contestations

- L'URL source et la provenance sont conservées pour permettre l'attribution si nécessaire
- En cas de demande de retrait, le modèle est passé en statut `image_disputed` et retiré des duels actifs
- La priorité post-MVP est de couvrir les modèles les plus joués avec des images à droits clairs (press kits)

---

## Données d'un modèle

```
guitar_model {
  id
  brand               // ex: Fender
  model               // ex: Telecaster
  year_range          // ex: "1950-1954" | "1972" | "2018-present"
  category            // électrique | acoustique | basse | autre
  image_url           // URL blob storage (variante _card par défaut)
  image_source_url    // URL originale archivée (non exposée publiquement)
  image_source        // reverb | manufacturer | wikimedia | ebay
  elo_score           // défaut: 1000
  total_duels         // défaut: 0
  status              // draft | active | image_disputed | retired
  added_at
}
```

---

## Statuts d'un modèle

| Statut | Description |
|---|---|
| `draft` | En cours de validation, absent des duels |
| `active` | Dans le catalogue, eligible aux duels |
| `image_disputed` | Image contestée, retiré des duels, données conservées |
| `retired` | Retiré définitivement du catalogue (ex: doublon) |

---

## Contraintes

- Un modèle `draft` ou `image_disputed` n'apparait jamais dans un duel
- Si un modèle en cours de duel passe `image_disputed`, le duel en cours est annulé côté client (rechargement silencieux)
- Le blob storage est la seule source d'images servie au client — aucune image externe n'est chargée par le navigateur
