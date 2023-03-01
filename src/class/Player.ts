import { Card } from "./Card";
import { IDamageable } from "./IDamageable";
import { log } from "./Logger";

export class Player implements IDamageable {
  public name: string;
  public health: number = 20;
  public deck: Card[] = [];
  public hand: Card[] = [];
  public mana: number = 0;
  public manaMax: number = 2;

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
    log(this.name + " mélange");
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
      log(this.name + " pioche " + card.name);

      this.hand.push(card);
    }
  }

  public playCard() {
    let playableCard = this.hand.filter((card) => card.cost <= this.mana);

    if (playableCard.length === 0) {
      log(
        this.name + " ne peut plus jouer de carte. Reste " + this.mana + " mana"
      );
      return false;
    }

    playableCard = playableCard.sort((a, b) => b.cost - a.cost);

    let choosedCard = playableCard[0];

    this.justPlayedCard.push(choosedCard);
    this.hand = this.hand.filter((c) => c !== choosedCard);
    this.mana -= choosedCard.cost;

    log(this.name + " joue " + choosedCard.name);

    return true;
  }

  public moveJustPlayedCard() {
    log(this.name + " déplace les cartes avec mal d'invocation");

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

    log(hand);
  }

  public displayPlayedCards() {
    let playedCards = "Cartes posées de " + this.name + ": ";
    for (const card of this.playedCards) {
      playedCards += card.name + " ";
    }

    log(playedCards);
  }

  public displayJustPlayedCard() {
    let justPlayedCard = "Cartes jouées de " + this.name + ": ";
    for (const card of this.justPlayedCard) {
      justPlayedCard += card.name + " ";
    }

    log(justPlayedCard);
  }

  public deckDiffer(deck: Card[]) {
    let cardDiffer = [];

    for (let i = 0; i < this.deck.length; i++) {
      if (!deck.includes(this.deck[i])) {
        cardDiffer.push(this.deck[i]);
      }
    }

    for (let i = 0; i < deck.length; i++) {
      if (!this.deck.includes(deck[i]) && !cardDiffer.includes(deck[i])) {
        cardDiffer.push(deck[i]);
      }
    }

    return cardDiffer;
  }

  public replaceDeck() {
    this.deck.splice(Math.floor(Math.random() * this.deck.length), 1);

    let availableCard = Card.allCards.filter((c) => !this.deck.includes(c));

    let addedCard =
      availableCard[Math.floor(Math.random() * availableCard.length)];

    this.deck.push(addedCard);
  }

  public resetMana() {
    this.manaMax = 2;
    this.mana = 0;
  }

  public exportDeck() {
    let exp = [];

    for (const card of this.deck) {
      exp.push(card.export());
    }

    return JSON.stringify(exp);
  }

  public importDeck(deck: string) {
    let inp = JSON.parse(deck);

    for (const cardIn of inp) {
      let card = new Card(cardIn.damage, cardIn.health);

      this.deck.push(card);
    }
  }
}
