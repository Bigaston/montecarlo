import { NB_CARD_IN_DECK, NB_MANA, NB_PV } from "../Params";
import { Card } from "./Card";
import { IDamageable } from "./IDamageable";
import { log } from "./Logger";

export class Player implements IDamageable {
  public name: string;
  public health: number = NB_PV;
  public deck: Card[] = [];
  public hand: Card[] = [];
  public mana: number = 0;
  public manaMax: number = NB_MANA;

  public playedCards: Card[] = [];

  public targetX: number;
  public targetY: number;

  constructor(name: string, targetX: number = 0, targetY: number = 0) {
    this.health = 20;
    this.mana = 2;
    this.name = name;
    this.targetX = targetX;
    this.targetY = targetY;
  }

  takeDamage(damage: number) {
    this.health -= damage;

    return 0;
  }

  public generateDeck(removeBadCards: boolean = false) {
    Card.allCards = Card.generateSetList(removeBadCards);

    this.deck = [];
    let stayCard = [...Card.allCards];

    for (let i = 0; i < NB_CARD_IN_DECK; i++) {
      let randomIndex = Math.floor(Math.random() * stayCard.length);
      this.deck.push(stayCard[randomIndex].copy());
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
    } else {
      log(this.name + " ne peut plus piocher. Fatigue et mort");
      this.health -= 999;
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

    this.playedCards.push(choosedCard);
    this.hand = this.hand.filter((c) => c.name !== choosedCard.name);
    this.mana -= choosedCard.cost;

    log(this.name + " joue " + choosedCard.name);

    return true;
  }

  public moveJustPlayedCard() {
    log(this.name + " déplace les cartes avec mal d'invocation");

    for (const card of this.playedCards.filter((c) => !c.canAttack)) {
      card.canAttack = true;
    }
  }

  public copy() {
    let player = new Player(this.name);
    player.health = this.health;
    player.mana = this.mana;
    player.deck = this.deck.map((c) => c.copy());

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

  public deckDiffer(deck: Card[]) {
    let cardDiffer = [];

    for (let i = 0; i < this.deck.length; i++) {
      if (!deck.map((ca) => ca.name).includes(this.deck[i].name)) {
        cardDiffer.push(this.deck[i]);
      }
    }

    for (let i = 0; i < deck.length; i++) {
      if (
        !this.deck.map((ca) => ca.name).includes(deck[i].name) &&
        !cardDiffer.map((ca) => ca.name).includes(deck[i].name)
      ) {
        cardDiffer.push(deck[i]);
      }
    }

    return cardDiffer;
  }

  public static deckDiffer(deck1: Card[], deck2: Card[]) {
    let cardDiffer = [];

    for (let i = 0; i < deck1.length; i++) {
      if (!deck2.map((ca) => ca.name).includes(deck1[i].name)) {
        cardDiffer.push(deck1[i]);
      }
    }

    for (let i = 0; i < deck2.length; i++) {
      if (
        !deck1.map((ca) => ca.name).includes(deck2[i].name) &&
        !cardDiffer.map((ca) => ca.name).includes(deck2[i].name)
      ) {
        cardDiffer.push(deck2[i]);
      }
    }

    return cardDiffer;
  }

  public replaceDeck() {
    let removedCard = this.deck.splice(
      Math.floor(Math.random() * this.deck.length),
      1
    );

    let availableCard = Card.allCards.filter((c) => {
      return !this.deck.map((ca) => ca.name).includes(c.name);
    });

    let addedCard =
      availableCard[Math.floor(Math.random() * availableCard.length)];

    this.deck.push(addedCard.copy());

    return [removedCard[0], addedCard];
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
    this.deck = [];
    let inp = JSON.parse(deck);

    for (const cardIn of inp) {
      let card = new Card(cardIn.attack, cardIn.defense, {
        hasTaunt: cardIn.hasTaunt,
        hasDistortion: cardIn.hasDistortion,
        hasTremble: cardIn.hasTremble,
      });

      this.deck.push(card);
    }
  }

  public chooseTarget(_card: Card): IDamageable {
    let target: IDamageable;

    let tauntCard = this.playedCards.filter((c) => c.hasTaunt);

    if (tauntCard.length > 0) {
      target = tauntCard[0];
    } else {
      target = this;
    }

    return target;
  }
}
