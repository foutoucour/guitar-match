Feature: Stats Surprises
  En tant que joueur
  Je veux voir une stat inattendue après mon vote
  Afin de découvrir des tendances culturelles sur les guitares

  Background:
    Given le joueur vient de voter dans un duel
    And le matchup a au moins 50 votes enregistrés

  # --- Affichage ---

  Scenario: Stat affichée après le vote
    Given une stat surprise est disponible pour ce matchup
    When le résultat s'affiche
    Then une stat surprise est affichée sous le résultat ELO
    And la stat comporte une icône contextuelle et une phrase courte

  Scenario: Aucune stat si données insuffisantes
    Given le matchup a moins de 50 votes
    When le résultat s'affiche
    Then aucune stat surprise n'est affichée

  Scenario: Aucune stat si aucune n'est disponible
    Given aucune stat ne dépasse son seuil de surprise pour ce matchup
    When le résultat s'affiche
    Then aucune stat surprise n'est affichée

  # --- Types de stats ---

  Scenario: Stat de type age_split
    Given les moins de 30 ans votent pour la Jazzmaster à 70%
    And les plus de 30 ans votent pour la Jazzmaster à 30%
    When la stat est calculée pour ce matchup
    Then la stat "age_split" est disponible avec un score de surprise élevé

  Scenario: Stat de type owner_paradox
    Given 80% des joueurs ayant réagi "Je possède une des deux" ont voté pour la Telecaster
    And dans l'ensemble des votes la Telecaster gagne seulement à 45%
    When la stat est calculée
    Then la stat "owner_paradox" est disponible

  Scenario: Stat de type loyalty
    Given 95% des joueurs ayant la Les Paul en collection ont voté pour elle
    When la stat est calculée
    Then la stat "loyalty" est disponible

  # --- Sélection de la meilleure stat ---

  Scenario: La stat la plus surprenante est sélectionnée
    Given les stats "age_split" (score 0.6) et "loyalty" (score 0.9) sont toutes deux disponibles
    When une stat est sélectionnée pour ce duel
    Then la stat "loyalty" est affichée (score le plus élevé)

  Scenario: La stat concerne une des deux guitares du duel
    Given le duel oppose la Telecaster et la Les Paul
    When une stat est affichée
    Then la stat mentionne la Telecaster, la Les Paul, ou les deux
