Feature: Classement Amis
  En tant que joueur
  Je veux partager ma collection et la comparer avec celle de mes amis
  Afin de créer du lien et du débat autour de nos goûts musicaux

  # --- Profil public ---

  Scenario: Accès au profil public via lien
    Given un joueur a un slug "guitarguy-42"
    When quelqu'un accède à "/p/guitarguy-42"
    Then la collection active est affichée
    And le tag musical est affiché
    And le nombre total de votes est affiché
    And les votes individuels ne sont pas visibles

  Scenario: Profil inexistant
    When quelqu'un accède à "/p/inconnu-999"
    Then une page 404 est affichée

  Scenario: Profil rendu privé
    Given le joueur a désactivé son lien public
    When quelqu'un accède à son URL de profil
    Then un message "Ce profil est privé" est affiché

  # --- Partage du lien ---

  Scenario: Génération du lien de profil
    Given le joueur est connecté
    When il accède à sa page collection
    Then un bouton "Partager mon profil" est disponible
    And il génère un lien "/p/{slug}"

  # --- Comparaison ---

  Scenario: Vue de comparaison entre deux profils
    Given les profils "guitarguy-42" et "riffmaster-7" existent tous les deux
    When quelqu'un accède à "/compare/guitarguy-42/riffmaster-7"
    Then les deux collections sont affichées côte à côte
    And les guitares en commun sont mises en évidence
    And les profils musicaux des deux joueurs sont affichés

  Scenario: Comparaison avec un profil privé
    Given "riffmaster-7" a son profil privé
    When quelqu'un accède à "/compare/guitarguy-42/riffmaster-7"
    Then un message indique que le profil de "riffmaster-7" est privé
    And seul le profil de "guitarguy-42" est affiché

  # --- Désaccords ---

  Scenario: Désaccords affichés dans la comparaison
    Given "guitarguy-42" a voté pour la Telecaster dans un duel
    And "riffmaster-7" a voté pour la Les Paul dans le même duel
    When la vue de comparaison est affichée
    Then ce duel apparaît dans la liste des désaccords

  Scenario: Maximum 5 désaccords affichés
    Given les deux joueurs ont 12 désaccords
    When la vue de comparaison est affichée
    Then seulement les 5 désaccords les plus récents sont affichés

  Scenario: Aucun désaccord commun
    Given les deux joueurs n'ont jamais voté sur les mêmes duels
    When la vue de comparaison est affichée
    Then la section désaccords affiche "Pas encore de duel en commun"
