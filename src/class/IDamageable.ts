export interface IDamageable {
  health: number;
  name: string;

  takeDamage(damage: number): void;
}
