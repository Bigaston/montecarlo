import { SECOND_PLAYER_MORE_CARD } from "../Params";
import { Card } from "./Card";
import { IDamageable } from "./IDamageable";
import { log } from "./Logger";
import { Player } from "./Player";

export class Battle {
  public player1: Player;
  public player2: Player;

  public turn: number = 0;
  public currentPlayer: Player | undefined;
  public otherPlayer: Player | undefined;

  constructor(player1: Player, player2: Player) {
    this.player1 = player1.copy();
    this.player2 = player2.copy();
  }

  public startBattle(): Promise<{ nbTour: number; winner: string }> {
    return new Promise((resolve, _reject) => {
      log("====================================");
      log("Battle entre " + this.player1.name + " et " + this.player2.name);
      this.player1.shuffleDeck();
      this.player2.shuffleDeck();

      for (let i = 0; i < 5; i++) {
        this.player1.draw();
      }

      for (let i = 0; i < 5; i++) {
        this.player2.draw();
      }

      this.player1.resetMana();
      this.player2.resetMana();

      let startPlayer = Math.floor(Math.random() * 2) + 1;
      let currentPlayer = startPlayer === 1 ? this.player1 : this.player2;
      let otherPlayer = startPlayer === 1 ? this.player2 : this.player1;

      if (SECOND_PLAYER_MORE_CARD) {
        otherPlayer.draw();
      }

      let nbTour = 0;

      while (this.player1.health > 0 && this.player2.health > 0) {
        log("=== NOUVEAU TOUR ===");
        log("Tour de " + currentPlayer.name);

        currentPlayer.manaMax++;
        currentPlayer.mana = currentPlayer.manaMax;
        currentPlayer.draw();

        log(
          "Vie de " +
            currentPlayer.name +
            " : " +
            currentPlayer.health +
            ", Mana : " +
            currentPlayer.mana
        );

        currentPlayer.displayHand();

        // Pose de toutes les cartes possibles
        for (let i = 0; i < currentPlayer.hand.length; i++) {
          if (!currentPlayer.playCard()) {
            break;
          }
        }

        currentPlayer.displayPlayedCards();

        // Attaque de toutes les cartes possibles
        for (const card of currentPlayer.playedCards.filter(
          (c) => c.canAttack
        )) {
          let target: IDamageable | undefined;

          if (card.hasDistortion) {
            let cardWithTauntAndDisto = otherPlayer.playedCards.filter(
              (c) => c.hasTaunt && c.hasDistortion
            );

            if (cardWithTauntAndDisto.length > 0) {
              target = cardWithTauntAndDisto[0];
            } else {
              target = otherPlayer;
            }
          } else {
            target = otherPlayer.chooseTarget(card);
          }

          if (card.hasTremble) {
            card.trembleAttack(target, otherPlayer);
          } else {
            card.attack(target);
          }

          if (target instanceof Card) {
            if (target.health <= 0) {
              otherPlayer.playedCards = otherPlayer.playedCards.filter(
                (c) => c.name !== (target as IDamageable).name
              );
              log(target.name + " est mort");
            }
          }
        }

        // Déplacement des cartes juste posées dans les cartes posées
        currentPlayer.moveJustPlayedCard();

        // Changement de joueur
        let temp = currentPlayer;
        currentPlayer = otherPlayer;
        otherPlayer = temp;

        nbTour++;
      }

      if (this.player1.health > 0) {
        log(this.player1.name + " a gagné");
        resolve({ nbTour, winner: this.player1.name });
      } else {
        log(this.player2.name + " a gagné");
        resolve({ nbTour, winner: this.player2.name });
      }
    });
  }
}
