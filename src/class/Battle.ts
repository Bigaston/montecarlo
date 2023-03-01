import { Player } from "./Player";

export class Battle {
  public player1: Player;
  public player2: Player;

  constructor(player1: Player, player2: Player) {
    this.player1 = player1.copy();
    this.player2 = player2.copy();
  }

  public startBattle() {
    console.log("====================================");
    console.log(
      "Battle entre " + this.player1.name + " et " + this.player2.name
    );
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

    let nbTour = 0;

    while (this.player1.health > 0 && this.player2.health > 0) {
      console.log("=== NOUVEAU TOUR ===");
      console.log("Tour de " + currentPlayer.name);
      currentPlayer.mana++;
      currentPlayer.draw();

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
      console.log(this.player1.name + " a gagné");
      return { nbTour, winner: this.player1.name };
    } else {
      console.log(this.player2.name + " a gagné");
      return { nbTour, winner: this.player2.name };
    }
  }
}
