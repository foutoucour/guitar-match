Feature: Duel du Jour
  En tant que joueur
  Je veux voter sur un duel quotidien commun à tous
  Afin de me comparer à la communauté et revenir chaque jour

  Background:
    Given un Duel du Jour est actif pour aujourd'hui

  # --- Participation ---

  Scenario: Joueur n'a pas encore voté
    When le joueur ouvre le Duel du Jour
    Then les deux guitares sont affichées
    And le nombre total de participants est affiché ("X joueurs ont voté")
    And les résultats ne sont pas visibles

  Scenario: Vote sur le Duel du Jour
    Given le joueur n'a pas encore voté aujourd'hui
    When il vote pour la guitare A
    Then son vote est enregistré
    And le message "Résultats révélés à minuit" est affiché
    And le nombre de participants est mis à jour

  Scenario: Vote unique par jour
    Given le joueur a déjà voté aujourd'hui
    When il retourne sur le Duel du Jour
    Then son choix précédent est affiché comme sélectionné
    And les boutons de vote sont désactivés

  # --- Révélation à minuit ---

  Scenario: Résultats révélés après minuit
    Given le joueur a voté
    And il est maintenant après minuit
    When il consulte le Duel du Jour
    Then le pourcentage de votes pour chaque guitare est affiché
    And la stat surprise du duel est affichée
    And les réactions agrégées sont affichées

  Scenario: Résultats visibles pour tous après minuit
    Given plusieurs joueurs ont voté
    And il est après minuit
    When un joueur qui n'a pas voté consulte le Duel du Jour
    Then les résultats complets sont visibles
    And le duel est marqué comme expiré (vote impossible)

  # --- Mode Survivor ---

  Scenario: Collection en jeu — guitare du joueur dans le duel
    Given la collection du joueur contient une Telecaster
    And le Duel du Jour oppose la Telecaster à une Les Paul
    When le joueur ouvre le Duel du Jour
    Then un message "Ta collection est en jeu" est affiché
    And la Telecaster est mise en évidence visuellement

  Scenario: Duel du Jour affecte la collection — sacrifice si pleine
    Given la collection du joueur est pleine
    And le Duel du Jour oppose une guitare de sa collection à une challenger
    When il vote pour la challenger
    Then les règles de sacrifice standard s'appliquent

  # --- Streak ---

  Scenario: Streak de 3 jours
    Given le joueur a participé au Duel du Jour 3 jours consécutifs
    When il vote le 3ème jour
    Then il reçoit le badge "3 jours de suite"

  Scenario: Streak brisée
    Given le joueur avait un streak de 5 jours
    And il n'a pas voté hier
    When il vote aujourd'hui
    Then son streak repart à 1
    And ses badges de streak précédents sont conservés

  # --- Vote alimente l'ELO ---

  Scenario: Vote du Duel du Jour mis à jour dans l'ELO global
    Given le Duel du Jour oppose la Stratocaster et la Jazzmaster
    When le joueur vote pour la Stratocaster
    Then l'ELO de la Stratocaster est recalculé
    And l'ELO de la Jazzmaster est recalculé
