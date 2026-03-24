Feature: Collection
  En tant que joueur
  Je veux consulter et partager ma collection de guitares
  Afin d'exprimer mon identité musicale

  Background:
    Given le joueur a une collection avec des guitares actives et sacrifiées

  # --- Affichage ---

  Scenario: Affichage des 5 emplacements
    When le joueur ouvre sa collection
    Then 5 emplacements sont affichés
    And les emplacements occupés montrent la photo, la marque, le modèle et le nombre de victoires
    And les emplacements vides sont affichés comme disponibles

  Scenario: Affichage du cimetière
    Given le joueur a 2 guitares sacrifiées
    When il ouvre la section cimetière
    Then les 2 guitares sacrifiées sont affichées dans l'ordre du sacrifice le plus récent
    And chaque guitare indique par quelle guitare elle a été remplacée

  # --- Statuts ---

  Scenario: Badge légendaire affiché
    Given la collection contient une Stratocaster avec le statut "legendary"
    When le joueur ouvre sa collection
    Then la Stratocaster affiche un badge "Légende"

  # --- Profil musical ---

  Scenario: Tag "Fender loyalist" généré
    Given la collection contient 3 guitares Fender ou plus
    When le joueur ouvre sa collection
    Then son profil affiche le tag "Fender loyalist"

  Scenario: Tag "Vintage hunter" généré
    Given la collection contient 3 guitares ou plus fabriquées avant 1980
    When le joueur ouvre sa collection
    Then son profil affiche le tag "Vintage hunter"

  Scenario: Tag "Explorer" généré
    Given la collection contient 5 guitares de 5 marques différentes
    When le joueur ouvre sa collection
    Then son profil affiche le tag "Explorer"

  Scenario: Tag "Restless" généré
    Given le joueur a sacrifié 5 guitares ou plus
    When il ouvre sa collection
    Then son profil affiche le tag "Restless"

  Scenario: Tag "Keeper" généré
    Given la collection contient au moins une guitare légendaire
    When le joueur ouvre sa collection
    Then son profil affiche le tag "Keeper"

  Scenario: Aucun tag si conditions non remplies
    Given la collection contient 1 guitare de chaque marque et aucune légendaire
    And le joueur a sacrifié moins de 5 guitares
    When il ouvre sa collection
    Then aucun profil musical n'est affiché

  # --- Partage ---

  Scenario: Génération de la carte partageable
    When le joueur clique sur "Partager ma collection"
    Then une image est générée côté serveur
    And l'image contient les photos des guitares actives
    And l'image contient le nom du joueur et son tag musical
    And l'image est disponible en format carré (1:1)

  Scenario: Partage avec collection incomplète
    Given le joueur a 3 guitares actives et 2 emplacements vides
    When il génère la carte partageable
    Then les 3 guitares sont affichées
    And les 2 emplacements vides sont représentés visuellement (silhouette)
