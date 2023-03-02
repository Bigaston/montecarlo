# Optimisation

## Stack technique
Concernant la stack technique, j'ai voulu partir sur un langage et une technologie que je connaissais. Je suis donc parti sur du *TypeScript*, un dérivé du *JavaScript* reprenant le typage fort des langages comme le C#. Pour le faire fonctionner sur navigateur, il faut le transpiller en JavaScript classique, j'ai donc utilisé la bibliothèque/boilerplate *Vite* qui inclut un serveur de développement, et un moyen de transpiler pour la production.

Pour l'affichage des graphs, j'ai utilisés la bibliothèque Chart.js qui permet de faire un affichage de données très simple et efficace.

## Organisation du code
Le code est organisé de la manière suivante:
- Le fichier `Params.ts` contient des paramètres modifiables de la génération (nombre de générations, cout des différents types de cartes...)
- Le fichier `main.ts` contient le code effectif de la génération
- Les fichiers `Battle.ts`, `Card.ts` et `Player.ts` contiennent les classes représentant les différents objets du jeu
- `IDamageable` contient une interface qui représente tous les objets pouvant prendre des dégats (a de la vie, peut prendre des dégats)

## Résultats
