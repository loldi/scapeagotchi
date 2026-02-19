/**
 * OSRS-style combat engine.
 * Handles attack timing, accuracy checks, and damage rolls.
 */

import { getWeapon } from '../data/weapons.js';

/**
 * Calculate attack roll for accuracy check.
 * Simplified OSRS formula: attack level + gear bonuses
 */
function calculateAttackRoll(attackLevel, attackBonus = 0) {
  return attackLevel + attackBonus;
}

/**
 * Calculate defense roll.
 * Simplified OSRS formula: defense level + gear bonuses
 */
function calculateDefenseRoll(defenseLevel, defenseBonus = 0) {
  return defenseLevel + defenseBonus;
}

/**
 * Calculate hit chance based on attack vs defense rolls.
 * OSRS-style formula: if attack > defense, chance = 1 - (defense + 2) / (2 * (attack + 1))
 *                     else chance = attack / (2 * (defense + 1))
 */
function calculateHitChance(attackRoll, defenseRoll) {
  if (attackRoll > defenseRoll) {
    return 1 - (defenseRoll + 2) / (2 * (attackRoll + 1));
  } else {
    return attackRoll / (2 * (defenseRoll + 1));
  }
}

/**
 * Roll for accuracy. Returns true if hit lands.
 */
function rollAccuracy(attackRoll, defenseRoll) {
  const hitChance = calculateHitChance(attackRoll, defenseRoll);
  return Math.random() < hitChance;
}

/**
 * Calculate max hit based on strength level and bonuses.
 * Simplified formula: maxHit = floor((strengthLevel + strengthBonus) / 8)
 * This gives reasonable damage scaling (e.g., str 1 = max hit 0-1, str 8 = max hit 0-1, str 16 = max hit 0-2)
 * We'll tune this constant as needed.
 */
function calculateMaxHit(strengthLevel, strengthBonus = 0) {
  const effectiveStrength = strengthLevel + strengthBonus;
  return Math.max(1, Math.floor(effectiveStrength / 8));
}

/**
 * Roll for damage. Returns random value from 0 to maxHit (inclusive).
 */
function rollDamage(maxHit) {
  return Math.floor(Math.random() * (maxHit + 1));
}

/**
 * Perform a single attack from attacker to defender.
 * Returns { hit: boolean, damage: number }
 */
export function performAttack(attacker, defender) {
  // Get attacker's weapon (or unarmed)
  const weapon = attacker.weapon || getWeapon('unarmed');

  // Debug dagger: always hit, always insta-kill (for loot testing)
  if (weapon.debugInstaKill) {
    return { hit: true, damage: 999 };
  }
  
  // Calculate rolls
  const attackRoll = calculateAttackRoll(
    attacker.attackLevel,
    weapon.attackBonus + (attacker.attackBonus || 0)
  );
  const defenseRoll = calculateDefenseRoll(
    defender.defenseLevel,
    defender.defenseBonus || 0
  );
  
  // Roll for accuracy
  const hit = rollAccuracy(attackRoll, defenseRoll);
  
  if (!hit) {
    return { hit: false, damage: 0 };
  }
  
  // Calculate and roll damage
  const maxHit = calculateMaxHit(
    attacker.strengthLevel,
    weapon.strengthBonus + (attacker.strengthBonus || 0)
  );
  const damage = rollDamage(maxHit);
  
  return { hit: true, damage };
}

/**
 * Combat state manager.
 * Tracks combat between two entities with attack timing.
 */
export class CombatState {
  constructor(attacker, defender, attackerWeaponId = 'unarmed') {
    this.attacker = attacker;
    this.defender = defender;
    this.weapon = getWeapon(attackerWeaponId);
    this.attackerNextAttack = 0; // timestamp in ms
    // NPC waits their full attackSpeed before first attack (so player attacks first)
    this.defenderNextAttack = defender.attackSpeed || 3000;
    this.active = true;
    this.onHit = null; // callback(attacker, defender, result)
    this.onAttack = null; // callback(attacker, defender) - called for every attack attempt (hit or miss)
    this.onCombatEnd = null; // callback(winner, loser)
  }
  
  /**
   * Update combat state. Call this every frame or on a timer.
   * Returns true if combat is still active.
   */
  update(time) {
    if (!this.active) return false;
    
    // Check if attacker can attack
    if (time >= this.attackerNextAttack) {
      const result = performAttack(this.attacker, this.defender);
      this.defender.hitpoints = Math.max(0, this.defender.hitpoints - result.damage);
      this.attackerNextAttack = time + this.weapon.attackSpeed;
      
      if (this.onAttack) {
        this.onAttack(this.attacker, this.defender);
      }
      
      if (this.onHit) {
        this.onHit(this.attacker, this.defender, result);
      }
      
      if (this.defender.hitpoints <= 0) {
        this.active = false;
        if (this.onCombatEnd) {
          this.onCombatEnd(this.attacker, this.defender);
        }
        return false;
      }
    }
    
    // Check if defender can attack (if it's an NPC)
    if (this.defender.attackSpeed && time >= this.defenderNextAttack) {
      const result = performAttack(this.defender, this.attacker);
      this.attacker.hitpoints = Math.max(0, this.attacker.hitpoints - result.damage);
      this.defenderNextAttack = time + this.defender.attackSpeed;
      
      if (this.onAttack) {
        this.onAttack(this.defender, this.attacker);
      }
      
      if (this.onHit) {
        this.onHit(this.defender, this.attacker, result);
      }
      
      if (this.attacker.hitpoints <= 0) {
        this.active = false;
        if (this.onCombatEnd) {
          this.onCombatEnd(this.defender, this.attacker);
        }
        return false;
      }
    }
    
    return true;
  }
  
  stop() {
    this.active = false;
  }
}
