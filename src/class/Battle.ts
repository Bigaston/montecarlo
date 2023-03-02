import { Application, Container, Text } from "pixi.js";
import { SECOND_PLAYER_MORE_CARD } from "../Params";
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

  public startDrawBattle() {
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
    this.currentPlayer = startPlayer === 1 ? this.player1 : this.player2;
    this.otherPlayer = startPlayer === 1 ? this.player2 : this.player1;

    this.turn = 0;

    // app.stage.addChild(this.player1.hand[0].toSprite());
  }

  public nextTurn() {
    if (this.currentPlayer === undefined || this.otherPlayer === undefined)
      return;

    this.currentPlayer.manaMax++;
    this.currentPlayer.mana = this.currentPlayer.manaMax;
    this.currentPlayer.draw();

    for (let i = 0; i < this.currentPlayer.hand.length; i++) {
      if (!this.currentPlayer.playCard()) {
        break;
      }
    }

    for (const card of this.currentPlayer.playedCards) {
      card.attack(this.otherPlayer);
    }

    this.currentPlayer.moveJustPlayedCard();

    // Changement de joueur
    let temp = this.currentPlayer;
    this.currentPlayer = this.otherPlayer;
    this.otherPlayer = temp;

    this.turn++;
  }

  public drawState(app: Application) {
    app.stage.children.forEach((child) => {
      child.visible = false;
      child.removeFromParent();
    });

    const healthJ1 = new Text(this.player1.health, {
      fontFamily: "Arial",
      fontSize: 64,
      fill: 0xffffff,
      align: "center",
    });

    healthJ1.x = 900;

    app.stage.addChild(healthJ1);

    const healthJ2 = new Text(this.player2.health, {
      fontFamily: "Arial",
      fontSize: 64,
      fill: 0xffffff,
      align: "center",
    });

    healthJ2.x = 900;
    healthJ2.y = 600;

    app.stage.addChild(healthJ2);

    let handP1 = new Container();
    app.stage.addChild(handP1);

    this.drawHand(this.player1, handP1);

    let handP2 = new Container();
    app.stage.addChild(handP2);

    this.drawHand(this.player2, handP2);
    handP2.y = 600;

    let terrainP1 = new Container();
    app.stage.addChild(terrainP1);

    this.drawTerrain(this.player1, terrainP1);
    terrainP1.y = 100;

    let terrainP2 = new Container();
    app.stage.addChild(terrainP2);

    this.drawTerrain(this.player2, terrainP2);
    terrainP2.y = 400;
  }

  public drawHand(player: Player, stage: Container) {
    player.hand.forEach((card, index) => {
      let spr = card.toSprite();
      spr.x = index * 100;
      spr.y = 0;

      spr.width = 80;
      spr.height = 100;

      stage.addChild(spr);
    });
  }

  public drawTerrain(player: Player, stage: Container) {
    player.playedCards.forEach((card, index) => {
      let spr = card.toSprite();
      spr.x = index * 160;
      spr.y = 0;

      spr.width = 160;
      spr.height = 200;

      stage.addChild(spr);
    });

    player.justPlayedCard.forEach((card, index) => {
      let spr = card.toSprite();
      spr.x = (player.playedCards.length + index) * 160;
      spr.y = 0;

      spr.width = 160;
      spr.height = 200;

      stage.addChild(spr);
    });
  }
}
