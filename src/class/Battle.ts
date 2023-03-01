import { SECOND_PLAYER_MORE_CARD } from "../Params";
import { log } from "./Logger";
import { Player } from "./Player";

export class Battle {
  public player1: Player;
  public player2: Player;

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

        currentPlayer.displayJustPlayedCard();
        currentPlayer.displayPlayedCards();

        // Attaque de toutes les cartes possibles
        for (const card of currentPlayer.playedCards) {
          card.attack(otherPlayer);
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
