import {
  DISTORTION_COST,
  HAS_DISTORTION,
  HAS_TAUNT,
  HAS_TREMPLE,
  MIN_REMOVED_CARD_COUNT,
  NB_EXEMPLARE_IN_DECK,
  TAUNT_COST,
  TREMBLE_COST,
} from "../Params";
import { IDamageable } from "./IDamageable";
import { log } from "./Logger";
import { Player } from "./Player";

export class Card implements IDamageable {
  public damage: number;
  public health: number;
  public maxHealth: number;
  public cost: number;

  public canAttack: boolean = false;
  public hasTaunt: boolean = false;
  public hasDistortion: boolean = false;
  public hasTremble: boolean = false;

  get name() {
    return (
      (this.canAttack ? "" : "*") +
      this.damage +
      "/" +
      this.maxHealth +
      "," +
      this.cost +
      "," +
      (this.hasTaunt ? "P" : "") +
      (this.hasDistortion ? "D" : "") +
      (this.hasTremble ? "T" : "")
    );
  }

  constructor(
    damage: number,
    health: number,
    capacity: {
      hasTaunt: boolean;
      hasDistortion: boolean;
      hasTremble: boolean;
    } = {
      hasTaunt: false,
      hasDistortion: false,
      hasTremble: false,
    }
  ) {
    this.damage = damage;
    this.health = health;
    this.maxHealth = health;
    this.hasTaunt = capacity.hasTaunt;
    this.hasDistortion = capacity.hasDistortion;
    this.hasTremble = capacity.hasTremble;

    this.cost = Math.floor((damage + health) / 2);

    if (this.hasTaunt) {
      this.cost += TAUNT_COST;
    }

    if (this.hasDistortion) {
      this.cost += DISTORTION_COST;
    }

    if (this.hasTremble) {
      this.cost += TREMBLE_COST;
    }
  }

  takeDamage(damage: number) {
    this.health -= damage;

    return this.damage;
  }

  public attack(target: IDamageable) {
    this.health -= target.takeDamage(this.damage);

    log(
      this.name +
        " attaque " +
        target.name +
        ". Il reste " +
        target.health +
        " points de vie à " +
        target.name
    );
  }

  public trembleAttack(target: IDamageable, player: Player) {
    let trembleDamage = Math.max(0, target.health - this.damage);

    this.health -= target.takeDamage(this.damage);
    player.takeDamage(trembleDamage);

    log(
      this.name +
        " attaque avec pietinnement " +
        target.name +
        ". Il reste " +
        target.health +
        " points de vie à " +
        target.name +
        ". " +
        player.name +
        " perd 1 point de vie."
    );
  }

  public toText() {
    let pre = document.createElement("pre");

    pre.innerHTML = `<span style="color: blue; font-weight:bold">${
      this.cost
    }</span>-----\n|     |\n|     |\n|  ${this.hasTaunt ? "P" : " "}${
      this.hasDistortion ? "D" : " "
    }${
      this.hasTremble ? "T" : " "
    }|\n<span style="color: gold; font-weight: bold">${
      this.damage
    }</span>-----<span style="color: red; font-weight: bold">${
      this.health
    }</span>`;

    return pre;
  }

  public export() {
    return {
      attack: this.damage,
      defense: this.health,
      attributes: [
        this.hasTaunt ? "taunt" : "",
        this.hasDistortion ? "distortion" : "",
        this.hasTremble ? "trample" : "",
      ].filter((a) => a !== ""),
    };
  }

  public copy() {
    return new Card(this.damage, this.health, {
      hasTaunt: this.hasTaunt,
      hasDistortion: this.hasDistortion,
      hasTremble: this.hasTremble,
    });
  }

  // STATIC
  static generateSetList() {
    const setList: Card[] = [];

    const deletedCards = Card.getRemovedCardsBanalized();

    for (let att = 0; att <= 12; att++) {
      for (let def = 1; def <= 13; def++) {
        for (let i = 0; i < NB_EXEMPLARE_IN_DECK; i++) {
          let card = new Card(att, def);

          if (
            card.cost <= 6 &&
            deletedCards[card.name]?.banalized < MIN_REMOVED_CARD_COUNT
          ) {
            setList.push(card);
          }

          if (HAS_TAUNT) {
            let cardTaunt = new Card(att, def, {
              hasTaunt: true,
              hasDistortion: false,
              hasTremble: false,
            });

            if (
              cardTaunt.cost <= 6 &&
              deletedCards[card.name]?.banalized < MIN_REMOVED_CARD_COUNT
            ) {
              setList.push(cardTaunt);
            }
          }

          if (HAS_DISTORTION) {
            let cardDistortion = new Card(att, def, {
              hasTaunt: false,
              hasDistortion: true,
              hasTremble: false,
            });

            if (
              cardDistortion.cost <= 6 &&
              deletedCards[card.name]?.banalized < MIN_REMOVED_CARD_COUNT
            ) {
              setList.push(cardDistortion);
            }
          }

          if (HAS_TREMPLE) {
            let cardTremble = new Card(att, def, {
              hasTaunt: false,
              hasDistortion: false,
              hasTremble: true,
            });

            if (
              cardTremble.cost <= 6 &&
              deletedCards[card.name]?.banalized < MIN_REMOVED_CARD_COUNT
            ) {
              setList.push(cardTremble);
            }
          }

          // Card with Taunt and Distortion
          if (HAS_TAUNT && HAS_DISTORTION) {
            let cardTauntDistortion = new Card(att, def, {
              hasTaunt: true,
              hasDistortion: true,
              hasTremble: false,
            });

            if (
              cardTauntDistortion.cost <= 6 &&
              deletedCards[card.name]?.banalized < MIN_REMOVED_CARD_COUNT
            ) {
              setList.push(cardTauntDistortion);
            }
          }

          // Card with Taunt and Tremble
          if (HAS_TAUNT && HAS_TREMPLE) {
            let cardTauntTremble = new Card(att, def, {
              hasTaunt: true,
              hasDistortion: false,
              hasTremble: true,
            });

            if (
              cardTauntTremble.cost <= 6 &&
              deletedCards[card.name]?.banalized < MIN_REMOVED_CARD_COUNT
            ) {
              setList.push(cardTauntTremble);
            }
          }

          // Card with Distortion and Tremble
          if (HAS_DISTORTION && HAS_TREMPLE) {
            let cardDistortionTremble = new Card(att, def, {
              hasTaunt: false,
              hasDistortion: true,
              hasTremble: true,
            });

            if (
              cardDistortionTremble.cost <= 6 &&
              deletedCards[card.name]?.banalized < MIN_REMOVED_CARD_COUNT
            ) {
              setList.push(cardDistortionTremble);
            }
          }

          // Card with Taunt, Distortion and Tremble
          if (HAS_TAUNT && HAS_DISTORTION && HAS_TREMPLE) {
            let cardTauntDistortionTremble = new Card(att, def, {
              hasTaunt: true,
              hasDistortion: true,
              hasTremble: true,
            });

            if (
              cardTauntDistortionTremble.cost <= 6 &&
              deletedCards[card.name]?.banalized < MIN_REMOVED_CARD_COUNT
            ) {
              setList.push(cardTauntDistortionTremble);
            }
          }
        }
      }
    }

    return setList;
  }

  static allCards: Card[];
  static removedCardsCount: { [key: string]: number };
  private static _nbParty: number = -1;

  static get nbParty() {
    if (Card._nbParty === -1) {
      Card._nbParty = JSON.parse(localStorage.getItem("nbParty") || "0");
    }

    return Card._nbParty;
  }

  static set nbParty(nbParty: number) {
    Card._nbParty = nbParty;

    localStorage.setItem("nbParty", JSON.stringify(nbParty));
  }

  public static addRemovedCards(card: Card) {
    if (!Card.removedCardsCount) {
      Card.removedCardsCount = JSON.parse(
        localStorage.getItem("removedCards") || "{}"
      );
    }

    if (Card.removedCardsCount[card.name]) {
      Card.removedCardsCount[card.name]++;
    } else {
      Card.removedCardsCount[card.name] = 1;
    }

    Card.nbParty++;

    localStorage.setItem(
      "removedCards",
      JSON.stringify(Card.removedCardsCount)
    );
  }

  public static getRemovedCards() {
    if (!Card.removedCardsCount) {
      Card.removedCardsCount = JSON.parse(
        localStorage.getItem("removedCards") || "{}"
      );
    }

    return Card.removedCardsCount;
  }

  public static getRemovedCardsBanalized() {
    if (!Card.removedCardsCount) {
      Card.removedCardsCount = JSON.parse(
        localStorage.getItem("removedCards") || "{}"
      );
    }

    let banalized: { [key: string]: { banalized: number; count: number } } = {};

    Object.keys(Card.removedCardsCount).forEach((key) => {
      banalized[key] = {
        banalized: Card.removedCardsCount[key] / Card.nbParty,
        count: Card.removedCardsCount[key],
      };
    });

    return banalized;
  }

  public static getRemovedCardsSorted() {
    if (!Card.removedCardsCount) {
      Card.removedCardsCount = JSON.parse(
        localStorage.getItem("removedCards") || "{}"
      );
    }

    let removedCards = [];
    for (const card of Object.keys(Card.removedCardsCount)) {
      removedCards.push({ card: card, count: Card.removedCardsCount[card] });
    }

    removedCards = removedCards.sort((a, b) => b.count - a.count);

    return removedCards;
  }

  public static getRemovedCardsSortBanalized() {
    if (!Card.removedCardsCount) {
      Card.removedCardsCount = JSON.parse(
        localStorage.getItem("removedCards") || "{}"
      );
    }

    let removedCards = [];
    for (const card of Object.keys(Card.removedCardsCount)) {
      removedCards.push({ card: card, count: Card.removedCardsCount[card] });
    }

    removedCards = removedCards.sort((a, b) => b.count - a.count);
    removedCards = removedCards.map((card) => ({
      ...card,
      banalized: card.count / Card.nbParty,
    }));

    return removedCards;
  }

  public static resetRemovedCards() {
    Card.removedCardsCount = {};
    localStorage.setItem("removedCards", JSON.stringify({}));
    Card._nbParty = 0;
    localStorage.setItem("nbParty", JSON.stringify(0));
  }
}
