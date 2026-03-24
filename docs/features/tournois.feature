Feature: Tournois Thématiques
  En tant que joueur
  Je veux participer à des tournois de guitares thématiques limités dans le temps
  Afin de découvrir des comparaisons ciblées et suivre un classement dédié

  # --- Découverte ---

  Scenario: Tournoi actif affiché sur la page d'accueil
    Given un tournoi "Semaine des Gibsons" est actif
    When le joueur ouvre l'application
    Then le tournoi est affiché avec son titre, son thème et sa date de fin

  Scenario: Annonce d'un tournoi à venir
    Given un tournoi commence dans 24h
    When le joueur ouvre l'application
    Then le tournoi est annoncé comme "À venir"
    And sa date de début est affichée

  # --- Participation ---

  Scenario: Rejoindre un tournoi
    Given un tournoi actif est affiché
    When le joueur clique sur "Participer"
    Then il est inscrit au tournoi
    And les duels du tournoi lui sont proposés

  Scenario: Vote dans un tournoi
    Given le joueur participe au tournoi "Semaine des Gibsons"
    And le duel oppose une Les Paul Standard et une SG
    When il vote pour la Les Paul Standard
    Then le vote est enregistré dans le classement ELO du tournoi
    And l'ELO global des modèles n'est pas modifié

  Scenario: Duels du tournoi uniquement entre guitares du catalogue du tournoi
    Given le tournoi "Semaine des Gibsons" contient 16 modèles Gibson
    When un duel est généré pour ce tournoi
    Then les deux guitares sont des modèles Gibson du catalogue du tournoi

  # --- Classement ---

  Scenario: Classement ELO propre au tournoi
    Given le tournoi "Semaine des Gibsons" est actif
    When le joueur consulte le classement du tournoi
    Then le classement n'affiche que les modèles du tournoi
    And les scores ELO sont indépendants du classement global

  Scenario: Classement remis à zéro entre éditions
    Given une précédente édition du tournoi "Semaine des Gibsons" a eu lieu
    When une nouvelle édition démarre
    Then le classement repart de zéro
    And les résultats de l'édition précédente sont archivés

  # --- Fin de tournoi ---

  Scenario: Vainqueur du tournoi
    Given le tournoi "Semaine des Gibsons" est terminé
    When le joueur consulte les résultats
    Then la guitare avec le score ELO le plus élevé est désignée vainqueur
    And un badge "Vainqueur Semaine des Gibsons" est affiché sur sa fiche modèle

  Scenario: Archive des tournois passés
    Given plusieurs tournois sont terminés
    When le joueur consulte l'archive des tournois
    Then chaque tournoi terminé affiche son vainqueur, son thème et ses dates

  # --- Limite de tournois simultanés ---

  Scenario: Maximum 2 tournois actifs simultanément
    Given 2 tournois sont déjà actifs
    When un administrateur tente d'en démarrer un troisième
    Then une erreur est retournée indiquant la limite atteinte
