Feature: Mode Random
  En tant que joueur
  Je veux voter entre deux guitares aléatoires
  Afin d'alimenter le classement ELO et découvrir de nouveaux modèles

  Background:
    Given le catalogue contient au moins 10 guitares actives
    And le joueur est sur la page Mode Random

  Scenario: Affichage d'un duel
    When le duel se charge
    Then deux guitares de la même catégorie sont affichées
    And chaque guitare affiche une photo, une marque et un modèle
    And aucun bouton de résultat n'est visible

  Scenario: Vote pour une guitare
    Given un duel est affiché
    When le joueur clique sur la guitare A
    Then la guitare A est mise en avant visuellement
    And le score ELO des deux guitares est affiché
    And les boutons de réaction (débat soft) sont affichés
    And le bouton "Suivant" est disponible

  Scenario: Le vote est enregistré immédiatement
    Given un duel est affiché
    When le joueur clique sur la guitare B
    Then le vote est envoyé au serveur avant l'affichage du résultat
    And le résultat s'affiche même en cas de latence réseau élevée (optimistic update)

  Scenario: Pas de répétition récente
    Given le joueur a déjà vu le duel "Telecaster vs Les Paul" dans ses 10 derniers duels
    When un nouveau duel est généré
    Then le duel "Telecaster vs Les Paul" n'est pas proposé

  Scenario: Deux guitares de catégories différentes
    Given le catalogue contient des électriques et des basses
    When un duel est généré
    Then les deux guitares appartiennent à la même catégorie

  Scenario: Le même modèle ne peut pas s'affronter lui-même
    When un duel est généré
    Then la guitare A et la guitare B ont des identifiants de modèle différents

  Scenario: Navigation vers le duel suivant
    Given le joueur a voté et voit le résultat
    When il clique sur "Suivant"
    Then un nouveau duel s'affiche immédiatement (image déjà préchargée)

  Scenario: Erreur de chargement du catalogue
    Given le serveur est indisponible
    When le joueur charge la page Mode Random
    Then un message d'erreur est affiché
    And un bouton "Réessayer" est disponible
