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

    // if (this.hasTaunt) {
    //   this.cost += 1;
    // }

    // if (this.hasDistortion) {
    //   this.cost += 1;
    // }

    // if (this.hasTremble) {
    //   this.cost += 1;
    // }
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
      hasTaunt: this.hasTaunt,
      hasDistortion: this.hasDistortion,
      hasTremble: this.hasTremble,
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

    for (let att = 0; att <= 12; att++) {
      for (let def = 1; def <= 13; def++) {
        let card = new Card(att, def);

        if (card.cost <= 6) {
          setList.push(card);
        }

        let cardTaunt = new Card(att, def, {
          hasTaunt: true,
          hasDistortion: false,
          hasTremble: false,
        });

        if (cardTaunt.cost <= 6) {
          setList.push(cardTaunt);
        }

        let cardDistortion = new Card(att, def, {
          hasTaunt: false,
          hasDistortion: true,
          hasTremble: false,
        });

        if (cardDistortion.cost <= 6) {
          setList.push(cardDistortion);
        }

        let cardTremble = new Card(att, def, {
          hasTaunt: false,
          hasDistortion: false,
          hasTremble: true,
        });

        if (cardTremble.cost <= 6) {
          setList.push(cardTremble);
        }

        // Card with Taunt and Distortion
        let cardTauntDistortion = new Card(att, def, {
          hasTaunt: true,
          hasDistortion: true,
          hasTremble: false,
        });

        if (cardTauntDistortion.cost <= 6) {
          setList.push(cardTauntDistortion);
        }

        // Card with Taunt and Tremble
        let cardTauntTremble = new Card(att, def, {
          hasTaunt: true,
          hasDistortion: false,
          hasTremble: true,
        });

        if (cardTauntTremble.cost <= 6) {
          setList.push(cardTauntTremble);
        }

        // Card with Distortion and Tremble
        let cardDistortionTremble = new Card(att, def, {
          hasTaunt: false,
          hasDistortion: true,
          hasTremble: true,
        });

        if (cardDistortionTremble.cost <= 6) {
          setList.push(cardDistortionTremble);
        }

        // Card with Taunt, Distortion and Tremble
        let cardTauntDistortionTremble = new Card(att, def, {
          hasTaunt: true,
          hasDistortion: true,
          hasTremble: true,
        });

        if (cardTauntDistortionTremble.cost <= 6) {
          setList.push(cardTauntDistortionTremble);
        }
      }
    }

    return setList;
  }

  static allCards: Card[] = Card.generateSetList();
}
