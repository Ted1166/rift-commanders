use starknet::ContractAddress;
use core::num::traits::Zero;

// Individual unit on the battlefield
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Unit {
    #[key]
    pub game_id: u32,
    #[key]
    pub owner: ContractAddress,
    #[key]
    pub unit_id: u8,  // 0, 1, or 2 (3 units per player)
    pub unit_type: UnitType,
    pub position_x: u8,  // 0-4 (5x5 grid)
    pub position_y: u8,  // 0-4 (5x5 grid)
    pub health: u8,
    pub max_health: u8,
    pub attack_power: u8,
    pub defense: u8,
    pub movement_range: u8,
    pub attack_range: u8,
    pub is_alive: bool,
    pub has_moved_this_turn: bool,
    pub has_attacked_this_turn: bool,
    pub total_damage_dealt: u32,
    pub total_damage_taken: u32,
    pub kills: u8,
    pub turns_survived: u8,
}

// Unit types with different stats and abilities
#[derive(Serde, Copy, Drop, Introspect, PartialEq, Debug, DojoStore, Default)]
pub enum UnitType {
    #[default]
    Commander,  // High HP, medium damage, MUST survive to win
    Warrior,    // Balanced melee fighter
    Archer,     // Long range, low HP
}

#[generate_trait]
pub impl UnitImpl of UnitTrait {
    #[inline(always)]
    fn new(
        game_id: u32,
        owner: ContractAddress,
        unit_id: u8,
        unit_type: UnitType,
        position_x: u8,
        position_y: u8,
    ) -> Unit {
        let (health, attack, defense, move_range, atk_range) = Self::get_unit_stats(unit_type);
        
        Unit {
            game_id,
            owner,
            unit_id,
            unit_type,
            position_x,
            position_y,
            health,
            max_health: health,
            attack_power: attack,
            defense,
            movement_range: move_range,
            attack_range: atk_range,
            is_alive: true,
            has_moved_this_turn: false,
            has_attacked_this_turn: false,
            total_damage_dealt: 0,
            total_damage_taken: 0,
            kills: 0,
            turns_survived: 0,
        }
    }

    #[inline(always)]
    fn get_unit_stats(unit_type: UnitType) -> (u8, u8, u8, u8, u8) {
        // Returns: (health, attack, defense, move_range, attack_range)
        match unit_type {
            UnitType::Commander => (100, 15, 10, 2, 1),  // Tanky, short range
            UnitType::Warrior => (80, 20, 8, 2, 1),      // High damage melee
            UnitType::Archer => (50, 18, 5, 2, 2),       // Ranged attacker
        }
    }

    #[inline(always)]
    fn move_to(ref self: Unit, new_x: u8, new_y: u8) -> bool {
        if !self.is_alive {
            return false;
        }
        
        if self.has_moved_this_turn {
            return false;
        }
        
        // Check if within movement range (Manhattan distance)
        let distance = Self::calculate_distance(
            self.position_x, 
            self.position_y, 
            new_x, 
            new_y
        );
        
        if distance > self.movement_range {
            return false;
        }
        
        self.position_x = new_x;
        self.position_y = new_y;
        self.has_moved_this_turn = true;
        true
    }

    #[inline(always)]
    fn calculate_distance(x1: u8, y1: u8, x2: u8, y2: u8) -> u8 {
        let dx = if x1 > x2 { x1 - x2 } else { x2 - x1 };
        let dy = if y1 > y2 { y1 - y2 } else { y2 - y1 };
        dx + dy  // Manhattan distance
    }

    #[inline(always)]
    fn can_attack_target(self: @Unit, target_x: u8, target_y: u8) -> bool {
        if !*self.is_alive {
            return false;
        }
        
        if *self.has_attacked_this_turn {
            return false;
        }
        
        let distance = Self::calculate_distance(
            *self.position_x,
            *self.position_y,
            target_x,
            target_y
        );
        
        distance <= *self.attack_range
    }

    #[inline(always)]
    fn take_damage(ref self: Unit, raw_damage: u8) -> u8 {
        if !self.is_alive {
            return 0;
        }
        
        // Calculate actual damage after defense
        let actual_damage = if raw_damage > self.defense {
            raw_damage - self.defense
        } else {
            1  // Minimum 1 damage
        };
        
        // Apply damage
        if self.health > actual_damage {
            self.health -= actual_damage;
        } else {
            self.health = 0;
            self.is_alive = false;
        }
        
        self.total_damage_taken += actual_damage.into();
        actual_damage
    }

    #[inline(always)]
    fn attack(ref self: Unit, ref target: Unit) -> u8 {
        if !self.is_alive || !target.is_alive {
            return 0;
        }
        
        if self.has_attacked_this_turn {
            return 0;
        }
        
        // Check range
        if !self.can_attack_target(target.position_x, target.position_y) {
            return 0;
        }
        
        // Deal damage
        let damage = target.take_damage(self.attack_power);
        self.total_damage_dealt += damage.into();
        self.has_attacked_this_turn = true;
        
        // Record kill if target died
        if !target.is_alive {
            self.kills += 1;
        }
        
        damage
    }

    #[inline(always)]
    fn reset_turn_actions(ref self: Unit) {
        self.has_moved_this_turn = false;
        self.has_attacked_this_turn = false;
        
        if self.is_alive {
            self.turns_survived += 1;
        }
    }

    #[inline(always)]
    fn heal(ref self: Unit, amount: u8) -> u8 {
        if !self.is_alive {
            return 0;
        }
        
        let old_health = self.health;
        self.health += amount;
        
        if self.health > self.max_health {
            self.health = self.max_health;
        }
        
        self.health - old_health  // Return actual amount healed
    }

    #[inline(always)]
    fn is_commander(self: @Unit) -> bool {
        *self.unit_type == UnitType::Commander
    }

    #[inline(always)]
    fn is_warrior(self: @Unit) -> bool {
        *self.unit_type == UnitType::Warrior
    }

    #[inline(always)]
    fn is_archer(self: @Unit) -> bool {
        *self.unit_type == UnitType::Archer
    }

    #[inline(always)]
    fn is_at_position(self: @Unit, x: u8, y: u8) -> bool {
        *self.position_x == x && *self.position_y == y
    }

    #[inline(always)]
    fn is_adjacent_to(self: @Unit, x: u8, y: u8) -> bool {
        let distance = Self::calculate_distance(*self.position_x, *self.position_y, x, y);
        distance == 1
    }

    #[inline(always)]
    fn get_health_percentage(self: @Unit) -> u8 {
        if *self.max_health == 0 {
            return 0;
        }
        (*self.health * 100) / *self.max_health
    }

    #[inline(always)]
    fn is_critically_wounded(self: @Unit) -> bool {
        self.get_health_percentage() < 25
    }

    #[inline(always)]
    fn is_healthy(self: @Unit) -> bool {
        self.get_health_percentage() >= 75
    }

    #[inline(always)]
    fn can_reach_position(self: @Unit, target_x: u8, target_y: u8) -> bool {
        if !*self.is_alive {
            return false;
        }
        
        let distance = Self::calculate_distance(
            *self.position_x,
            *self.position_y,
            target_x,
            target_y
        );
        
        distance <= *self.movement_range
    }

    #[inline(always)]
    fn get_effective_attack(self: @Unit) -> u8 {
        // Attack power modified by health (wounded units fight weaker)
        let health_pct = self.get_health_percentage();
        let attack = *self.attack_power;
        
        if health_pct < 25 {
            attack * 7 / 10  // 70% attack at critical health
        } else if health_pct < 50 {
            attack * 85 / 100  // 85% attack at low health
        } else {
            attack
        }
    }

    #[inline(always)]
    fn get_effective_defense(self: @Unit) -> u8 {
        // Defense modified by unit type positioning advantage
        let base_defense = *self.defense;
        
        // Archers get defense bonus at range
        if *self.unit_type == UnitType::Archer {
            base_defense + 2
        } else {
            base_defense
        }
    }

    #[inline(always)]
    fn calculate_threat_level(self: @Unit) -> u8 {
        if !*self.is_alive {
            return 0;
        }
        
        let mut threat: u8 = 0;
        
        // Base threat from attack power
        threat += *self.attack_power;
        
        // Threat from health (tankier = more dangerous)
        threat += *self.health / 10;
        
        // Commander bonus threat
        if self.is_commander() {
            threat += 20;
        }
        
        // Range multiplier (ranged units more threatening)
        if *self.attack_range > 1 {
            threat += 10;
        }
        
        threat
    }

    #[inline(always)]
    fn get_combat_rating(self: @Unit) -> u32 {
        let mut rating: u32 = 0;
        
        // Health contribution
        rating += (*self.health).into() * 2;
        
        // Attack power
        rating += (*self.attack_power).into() * 5;
        
        // Defense value
        rating += (*self.defense).into() * 3;
        
        // Kill bonus
        rating += (*self.kills).into() * 50;
        
        // Survival bonus
        rating += (*self.turns_survived).into() * 10;
        
        // Damage dealt bonus
        rating += *self.total_damage_dealt;
        
        rating
    }

    #[inline(always)]
    fn is_in_range_of(self: @Unit, other: @Unit) -> bool {
        if !*self.is_alive || !*other.is_alive {
            return false;
        }
        
        let distance = Self::calculate_distance(
            *self.position_x,
            *self.position_y,
            *other.position_x,
            *other.position_y
        );
        
        distance <= *self.attack_range
    }
}