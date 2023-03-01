import { IDamageable } from "./IDamageable";

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

    console.log(
      this.name +
        " attaque " +
        target.name +
        ". Il reste " +
        target.health +
        " points de vie à " +
        target.name
    );
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
