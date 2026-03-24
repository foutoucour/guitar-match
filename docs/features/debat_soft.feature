Feature: Débat Soft
  En tant que joueur
  Je veux ajouter une réaction courte après mon vote
  Afin d'exprimer mon ressenti sans avoir à écrire un commentaire

  Background:
    Given le joueur vient de voter dans un duel

  # --- Affichage ---

  Scenario: Réactions affichées après le vote
    When le résultat s'affiche
    Then les 5 boutons de réaction sont visibles
    And aucune réaction n'est pré-sélectionnée

  # --- Sélection ---

  Scenario: Sélection d'une réaction
    When le joueur clique sur "Choix impossible"
    Then la réaction "Choix impossible" est mise en avant
    And les autres réactions sont grisées
    And le total de cette réaction pour ce matchup est affiché

  Scenario: Une seule réaction par duel
    Given le joueur a déjà sélectionné "Trop facile"
    When il essaie de cliquer sur "Choix impossible"
    Then la réaction n'est pas modifiée
    And "Trop facile" reste sélectionnée

  Scenario: Réaction optionnelle
    Given le résultat est affiché avec les boutons de réaction
    When le joueur clique directement sur "Suivant"
    Then aucune réaction n'est enregistrée
    And le duel suivant s'affiche

  # --- Délai ---

  Scenario: Réaction soumise dans les 30 secondes
    Given le résultat est affiché depuis 20 secondes
    When le joueur sélectionne une réaction
    Then la réaction est enregistrée

  Scenario: Réaction après 30 secondes ignorée
    Given le résultat est affiché depuis plus de 30 secondes
    When le joueur sélectionne une réaction
    Then les boutons de réaction sont désactivés
    And aucune réaction n'est enregistrée

  # --- Agrégation ---

  Scenario: Matchup éligible Duel du Jour via réactions
    Given un matchup a reçu 100 votes
    And 35 votes ont la réaction "Choix impossible"
    Then ce matchup a le flag "eligible_duel_du_jour"

  Scenario: Matchup déprioritisé dans le tirage aléatoire
    Given un matchup a reçu 100 votes
    And 55 votes ont la réaction "Trop facile"
    Then ce matchup a le flag "deprioritized"

  Scenario: Matchup exclu pour nouveaux joueurs
    Given un matchup a reçu 100 votes
    And 45 votes ont la réaction "Je connais pas les deux"
    And le joueur a moins de 10 votes au total
    When un duel est généré pour ce joueur
    Then ce matchup n'est pas proposé
