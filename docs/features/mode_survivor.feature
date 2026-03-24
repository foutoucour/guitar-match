Feature: Mode Survivor
  En tant que joueur
  Je veux construire ma collection en choisissant quelles guitares garder
  Afin de révéler mon identité musicale à travers mes choix

  Background:
    Given le joueur est en Mode Survivor

  # --- Collection vide ---

  Scenario: Première session — collection vide
    Given la collection du joueur est vide
    When un duel est généré
    Then deux challengers sont proposées (pas de guitare de collection)
    And la guitare choisie entre en collection

  Scenario: Collection vide — la guitare choisie est ajoutée
    Given la collection du joueur est vide
    And le duel affiche la Telecaster et la Les Paul
    When le joueur choisit la Telecaster
    Then la Telecaster est ajoutée à la collection avec 0 victoires
    And la Les Paul est éliminée

  # --- Collection non pleine ---

  Scenario: Challenger acceptée — collection non pleine
    Given la collection contient 2 guitares dont une Stratocaster
    And le duel oppose la Stratocaster (collection) à une Jazzmaster (challenger)
    When le joueur choisit la Jazzmaster
    Then la Jazzmaster entre en collection
    And la Stratocaster reste en collection avec son compteur de victoires inchangé

  Scenario: Guitare de collection défendue — collection non pleine
    Given la collection contient une Stratocaster avec 3 victoires
    And le duel oppose la Stratocaster à une Jazzmaster
    When le joueur choisit la Stratocaster
    Then la Stratocaster reste en collection avec 4 victoires
    And la Jazzmaster est éliminée

  # --- Collection pleine ---

  Scenario: Challenger acceptée — collection pleine — sacrifice requis
    Given la collection est pleine (5 guitares)
    And le duel oppose une guitare de la collection à une Jazzmaster
    When le joueur choisit la Jazzmaster
    Then le joueur est invité à choisir quelle guitare sacrifier
    And les 5 guitares de la collection sont affichées avec leurs stats

  Scenario: Sacrifice confirmé
    Given le joueur a choisi d'accepter la Jazzmaster
    And il désigne la SG comme guitare à sacrifier
    When le sacrifice est confirmé
    Then la Jazzmaster entre en collection
    And la SG passe dans le cimetière avec le statut "sacrificed"
    And la SG indique qu'elle a été remplacée par la Jazzmaster

  Scenario: Refus du sacrifice — collection pleine
    Given la collection est pleine et le joueur est invité à sacrifier
    When le joueur annule le sacrifice
    Then la challenger est éliminée
    And la collection reste inchangée

  Scenario: Garde sa guitare — collection pleine
    Given la collection est pleine
    And le duel oppose une guitare de collection à une challenger
    When le joueur choisit sa guitare de collection
    Then la challenger est éliminée sans proposition de sacrifice

  # --- Statut légendaire ---

  Scenario: Guitare devient légendaire
    Given la collection contient une Les Paul avec 9 victoires
    And elle affronte une nouvelle challenger
    When le joueur choisit de garder la Les Paul
    Then la Les Paul a 10 victoires
    And son statut passe à "legendary"
    And un badge "Légende" est affiché sur la carte

  # --- Règles de non-répétition ---

  Scenario: La même challenger n'apparaît pas deux fois dans la même session
    Given la Jazzmaster a déjà été proposée comme challenger dans cette session
    When un nouveau duel est généré
    Then la Jazzmaster n'est pas proposée comme challenger

  Scenario: Une guitare en collection n'est pas proposée comme challenger
    Given la Telecaster est en collection
    When un duel est généré
    Then la Telecaster n'est pas proposée comme challenger

  # --- Persistance ---

  Scenario: La collection est sauvegardée entre les sessions
    Given le joueur a une collection de 3 guitares
    When il ferme et rouvre l'application
    Then sa collection de 3 guitares est restaurée avec leurs stats
