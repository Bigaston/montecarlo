import { IDamageable } from "./IDamageable";
import { log } from "./Logger";

export class Card {
  public damage: number;
  public health: number;
  public cost: number;

  get name() {
    return this.damage + "/" + this.health + "," + this.cost;
  }

  constructor(damage: number, health: number) {
    this.damage = damage;
    this.health = health;

    this.cost = Math.floor((damage + health) / 2);
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

    pre.innerHTML = `<span style="color: blue; font-weight:bold">${this.cost}</span>-----\n|     |\n|     |\n|     |\n<span style="color: gold; font-weight: bold">${this.damage}</span>-----<span style="color: red; font-weight: bold">${this.health}</span>`;

    return pre;
  }

  public export() {
    return {
      damage: this.damage,
      health: this.health,
    };
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
      }
    }

    return setList;
  }

  static allCards: Card[] = Card.generateSetList();
}
