import { IDamageable } from "./IDamageable";
import { log } from "./Logger";
import { Sprite, Text } from "pixi.js";

export class Card {
  public damage: number;
  public health: number;
  public cost: number;
  public x: number = 0;
  public y: number = 0;

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

  public toSprite() {
    let spr = Sprite.from("./card.png");

    const cost = new Text(this.cost, {
      fontFamily: "Arial",
      fontSize: 64,
      fill: 0xffffff,
      align: "center",
    });

    cost.x = 10;
    cost.y = 30;

    spr.addChild(cost);

    const damage = new Text(this.damage, {
      fontFamily: "Arial",
      fontSize: 64,
      fill: 0xffffff,
      align: "center",
    });

    damage.x = 15;
    damage.y = 320;

    spr.addChild(damage);

    const health = new Text(this.health, {
      fontFamily: "Arial",
      fontSize: 64,
      fill: 0xffffff,
      align: "center",
    });

    health.x = 205;
    health.y = 320;

    spr.addChild(health);

    return spr;
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
