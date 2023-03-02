import { IDamageable } from "./IDamageable";
import { log } from "./Logger";

export class Card implements IDamageable {
  public damage: number;
  public health: number;
  public maxHealth: number;
  public cost: number;

  public canAttack: boolean = false;
  public hasTaunt: boolean = false;

  get name() {
    return (
      (this.canAttack ? "" : "*") +
      this.damage +
      "/" +
      this.maxHealth +
      "," +
      this.cost +
      "," +
      (this.hasTaunt ? "T" : "")
    );
  }

  constructor(
    damage: number,
    health: number,
    capacity: { hasTaunt: boolean } = { hasTaunt: false }
  ) {
    this.damage = damage;
    this.health = health;
    this.maxHealth = health;
    this.hasTaunt = capacity.hasTaunt;

    this.cost = Math.floor((damage + health) / 2);

    if (this.hasTaunt) {
      this.cost += 1;
    }
  }

  takeDamage(damage: number) {
    this.health -= damage;

    return this.damage;
  }

  public attack(target: IDamageable) {
    target.takeDamage(this.damage);

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

  public toText() {
    let pre = document.createElement("pre");

    pre.innerHTML = `<span style="color: blue; font-weight:bold">${
      this.cost
    }</span>-----\n|     |\n|     |\n|  ${
      this.hasTaunt ? "T" : " "
    }  |\n<span style="color: gold; font-weight: bold">${
      this.damage
    }</span>-----<span style="color: red; font-weight: bold">${
      this.health
    }</span>`;

    return pre;
  }

  public export() {
    return {
      damage: this.damage,
      health: this.health,
    };
  }

  public copy() {
    return new Card(this.damage, this.health, { hasTaunt: this.hasTaunt });
  }

  // STATIC
  static generateSetList() {
    const setList: Card[] = [];

    for (let att = 0; att <= 12; att++) {
      for (let def = 1; def <= 13; def++) {
        let card = new Card(att, def);

        if (card.cost <= 6) {
          setList.push(card);
        }

        let cardTaunt = new Card(att, def, { hasTaunt: true });

        if (card.cost <= 6) {
          setList.push(cardTaunt);
        }
      }
    }

    return setList;
  }

  static allCards: Card[] = Card.generateSetList();
}
