import { Container } from "pixi.js";

export interface IDamageable {
  health: number;
  name: string;
  targetX: number;
  targetY: number;

  takeDamage(damage: number): void;
  drawDamage(app: Container, fromX: number, fromY: number): void;
}
