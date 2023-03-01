import { Card } from "./Card";
import { IDamageable } from "./IDamageable";

export class Player implements IDamageable {
  public name: string;
  public health: number = 20;
  public deck: Card[] = [];
  public hand: Card[] = [];
  public mana: number = 2;

  public playedCards: Card[] = [];
  public justPlayedCard: Card[] = [];

  constructor(name: string) {
    this.health = 20;
    this.mana = 2;
    this.name = name;
  }
  takeDamage(damage: number): void {
    this.health -= damage;
  }

  public generateDeck() {
    let stayCard = [...Card.allCards];

    for (let i = 0; i < 30; i++) {
      let randomIndex = Math.floor(Math.random() * stayCard.length);
      this.deck.push(stayCard[randomIndex]);
      stayCard.splice(randomIndex, 1);
    }
  }

  public shuffleDeck() {
    console.log(this.name + " mélange");
    let stayCard = [...this.deck];

    this.deck = [];

    for (let i = 0; i < 30; i++) {
      let randomIndex = Math.floor(Math.random() * stayCard.length);
      this.deck.push(stayCard[randomIndex]);
      stayCard.splice(randomIndex, 1);
    }
  }

  public draw() {
    let card = this.deck.shift();
    if (card !== undefined) {
      console.log(this.name + " pioche " + card.name);

      this.hand.push(card);
    }
  }

  public playCard() {
    let playableCard = this.hand.filter((card) => card.cost <= this.mana);

    if (playableCard.length === 0) {
      console.log(this.name + " ne peut plus jouer de carte");
      return false;
    }

    let choosedCard = playableCard[0];

    for (let i = 0; i < playableCard.length; i++) {
      if (
        playableCard[i].cost >= choosedCard.cost &&
        playableCard[i].cost <= this.mana
      ) {
        choosedCard = playableCard[i];
      }
    }

    this.justPlayedCard.push(choosedCard);
    this.hand = this.hand.filter((c) => c !== choosedCard);
    this.mana -= choosedCard.cost;

    console.log(this.name + " joue " + choosedCard.name);

    return true;
  }

  public moveJustPlayedCard() {
    console.log(this.name + " déplace les cartes avec mal d'invocation");

    this.playedCards.push(...this.justPlayedCard);
    this.justPlayedCard = [];
  }

  public copy() {
    let player = new Player(this.name);
    player.health = this.health;
    player.mana = this.mana;
    player.deck = [...this.deck];

    return player;
  }

  public displayHand() {
    let hand = "Main de " + this.name + ": ";
    for (const card of this.hand) {
      hand += card.name + " ";
    }

    console.log(hand);
  }

  public displayPlayedCards() {
    let playedCards = "Cartes posées de " + this.name + ": ";
    for (const card of this.playedCards) {
      playedCards += card.name + " ";
    }

    console.log(playedCards);
  }

  public displayJustPlayedCard() {
    let justPlayedCard = "Cartes jouées de " + this.name + ": ";
    for (const card of this.justPlayedCard) {
      justPlayedCard += card.name + " ";
    }

    console.log(justPlayedCard);
  }
}
