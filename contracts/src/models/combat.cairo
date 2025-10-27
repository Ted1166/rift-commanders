use starknet::ContractAddress;

// Combat encounter between two units
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct CombatResult {
    #[key]
    pub game_id: u32,
    #[key]
    pub turn_number: u8,
    #[key]
    pub combat_id: u8,  // Multiple combats can happen per turn
    pub attacker: ContractAddress,
    pub attacker_unit_id: u8,
    pub defender: ContractAddress,
    pub defender_unit_id: u8,
    pub attacker_position_x: u8,
    pub attacker_position_y: u8,
    pub defender_position_x: u8,
    pub defender_position_y: u8,
    pub raw_damage: u8,
    pub actual_damage: u8,  // After defense reduction
    pub defender_health_before: u8,
    pub defender_health_after: u8,
    pub was_critical_hit: bool,
    pub defender_died: bool,
    pub terrain_bonus: u8,
    pub occurred_at: u64,
}

// Turn summary for statistics and replay
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct TurnSummary {
    #[key]
    pub game_id: u32,
    #[key]
    pub turn_number: u8,
    pub player1: ContractAddress,
    pub player2: ContractAddress,
    pub player1_units_alive: u8,
    pub player2_units_alive: u8,
    pub player1_total_health: u16,
    pub player2_total_health: u16,
    pub total_damage_this_turn: u16,
    pub units_killed_this_turn: u8,
    pub combats_this_turn: u8,
    pub rift_occurred: bool,
    pub turn_start_time: u64,
    pub turn_end_time: u64,
}

// Kill event tracking
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct KillEvent {
    #[key]
    pub game_id: u32,
    #[key]
    pub kill_id: u32,  // Unique kill identifier
    pub killer: ContractAddress,
    pub killer_unit_id: u8,
    pub victim: ContractAddress,
    pub victim_unit_id: u8,
    pub victim_was_commander: bool,
    pub turn_number: u8,
    pub position_x: u8,
    pub position_y: u8,
    pub final_blow_damage: u8,
    pub occurred_at: u64,
}

// Damage over time effect (from lava, etc.)
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct DamageOverTime {
    #[key]
    pub game_id: u32,
    #[key]
    pub affected_owner: ContractAddress,
    #[key]
    pub affected_unit_id: u8,
    pub damage_per_turn: u8,
    pub source: DamageSource,
    pub turns_remaining: u8,
    pub total_damage_dealt: u16,
}

// Buff/debuff effects on units
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct StatusEffect {
    #[key]
    pub game_id: u32,
    #[key]
    pub affected_owner: ContractAddress,
    #[key]
    pub affected_unit_id: u8,
    #[key]
    pub effect_id: u8,  // Can have multiple effects
    pub effect_type: EffectType,
    pub modifier_value: i8,  // Can be positive (buff) or negative (debuff)
    pub turns_remaining: u8,
    pub applied_at_turn: u8,
}

// Source of damage types
#[derive(Serde, Copy, Drop, Introspect, PartialEq, Debug, DojoStore, Default)]
pub enum DamageSource {
    #[default]
    Combat,         // From unit attacks
    Lava,           // From lava tiles
    Poison,         // Status effect
    Rift,           // From rift chaos
    Environmental,  // Other hazards
}

// Status effect types
#[derive(Serde, Copy, Drop, Introspect, PartialEq, Debug, DojoStore, Default)]
pub enum EffectType {
    #[default]
    AttackBoost,    // Increased attack power
    DefenseBoost,   // Increased defense
    SpeedBoost,     // Increased movement
    AttackDebuff,   // Decreased attack
    DefenseDebuff,  // Decreased defense
    SpeedDebuff,    // Decreased movement
    Stunned,        // Cannot act
    Regeneration,   // Heal over time
}

#[generate_trait]
pub impl CombatResultImpl of CombatResultTrait {
    #[inline(always)]
    fn new(
        game_id: u32,
        turn_number: u8,
        combat_id: u8,
        attacker: ContractAddress,
        attacker_unit_id: u8,
        defender: ContractAddress,
        defender_unit_id: u8,
        attacker_x: u8,
        attacker_y: u8,
        defender_x: u8,
        defender_y: u8,
        occurred_at: u64,
    ) -> CombatResult {
        CombatResult {
            game_id,
            turn_number,
            combat_id,
            attacker,
            attacker_unit_id,
            defender,
            defender_unit_id,
            attacker_position_x: attacker_x,
            attacker_position_y: attacker_y,
            defender_position_x: defender_x,
            defender_position_y: defender_y,
            raw_damage: 0,
            actual_damage: 0,
            defender_health_before: 0,
            defender_health_after: 0,
            was_critical_hit: false,
            defender_died: false,
            terrain_bonus: 0,
            occurred_at,
        }
    }

    #[inline(always)]
    fn record_damage(
        ref self: CombatResult,
        raw_dmg: u8,
        actual_dmg: u8,
        health_before: u8,
        health_after: u8,
    ) {
        self.raw_damage = raw_dmg;
        self.actual_damage = actual_dmg;
        self.defender_health_before = health_before;
        self.defender_health_after = health_after;
        
        if health_after == 0 {
            self.defender_died = true;
        }
    }

    #[inline(always)]
    fn mark_critical(ref self: CombatResult) {
        self.was_critical_hit = true;
    }

    #[inline(always)]
    fn add_terrain_bonus(ref self: CombatResult, bonus: u8) {
        self.terrain_bonus = bonus;
    }

    #[inline(always)]
    fn was_fatal(self: @CombatResult) -> bool {
        *self.defender_died
    }

    #[inline(always)]
    fn get_damage_reduction(self: @CombatResult) -> u8 {
        if *self.raw_damage > *self.actual_damage {
            *self.raw_damage - *self.actual_damage
        } else {
            0
        }
    }

    #[inline(always)]
    fn get_damage_percentage(self: @CombatResult) -> u8 {
        if *self.defender_health_before == 0 {
            return 0;
        }
        
        (*self.actual_damage * 100) / *self.defender_health_before
    }

    #[inline(always)]
    fn was_overkill(self: @CombatResult) -> bool {
        *self.actual_damage > *self.defender_health_before
    }

    #[inline(always)]
    fn get_combat_distance(self: @CombatResult) -> u8 {
        let dx = if *self.attacker_position_x > *self.defender_position_x {
            *self.attacker_position_x - *self.defender_position_x
        } else {
            *self.defender_position_x - *self.attacker_position_x
        };
        
        let dy = if *self.attacker_position_y > *self.defender_position_y {
            *self.attacker_position_y - *self.defender_position_y
        } else {
            *self.defender_position_y - *self.attacker_position_y
        };
        
        dx + dy
    }

    #[inline(always)]
    fn was_melee_combat(self: @CombatResult) -> bool {
        self.get_combat_distance() == 1
    }

    #[inline(always)]
    fn was_ranged_combat(self: @CombatResult) -> bool {
        self.get_combat_distance() > 1
    }
}

#[generate_trait]
pub impl TurnSummaryImpl of TurnSummaryTrait {
    #[inline(always)]
    fn new(
        game_id: u32,
        turn_number: u8,
        player1: ContractAddress,
        player2: ContractAddress,
        turn_start_time: u64,
    ) -> TurnSummary {
        TurnSummary {
            game_id,
            turn_number,
            player1,
            player2,
            player1_units_alive: 3,
            player2_units_alive: 3,
            player1_total_health: 0,
            player2_total_health: 0,
            total_damage_this_turn: 0,
            units_killed_this_turn: 0,
            combats_this_turn: 0,
            rift_occurred: false,
            turn_start_time,
            turn_end_time: 0,
        }
    }

    #[inline(always)]
    fn update_health_totals(
        ref self: TurnSummary,
        player1_health: u16,
        player2_health: u16,
    ) {
        self.player1_total_health = player1_health;
        self.player2_total_health = player2_health;
    }

    #[inline(always)]
    fn record_combat(ref self: TurnSummary, damage: u8, was_fatal: bool) {
        self.combats_this_turn += 1;
        self.total_damage_this_turn += damage.into();
        
        if was_fatal {
            self.units_killed_this_turn += 1;
        }
    }

    #[inline(always)]
    fn record_unit_death(ref self: TurnSummary, was_player1: bool) {
        if was_player1 {
            if self.player1_units_alive > 0 {
                self.player1_units_alive -= 1;
            }
        } else {
            if self.player2_units_alive > 0 {
                self.player2_units_alive -= 1;
            }
        }
    }

    #[inline(always)]
    fn mark_rift_occurred(ref self: TurnSummary) {
        self.rift_occurred = true;
    }

    #[inline(always)]
    fn end_turn(ref self: TurnSummary, end_time: u64) {
        self.turn_end_time = end_time;
    }

    #[inline(always)]
    fn get_turn_duration(self: @TurnSummary) -> u64 {
        if *self.turn_end_time > *self.turn_start_time {
            *self.turn_end_time - *self.turn_start_time
        } else {
            0
        }
    }

    #[inline(always)]
    fn was_bloody_turn(self: @TurnSummary) -> bool {
        *self.units_killed_this_turn >= 2
    }

    #[inline(always)]
    fn was_peaceful_turn(self: @TurnSummary) -> bool {
        *self.combats_this_turn == 0
    }

    #[inline(always)]
    fn get_average_damage_per_combat(self: @TurnSummary) -> u16 {
        if *self.combats_this_turn == 0 {
            return 0;
        }
        
        // Fixed: Dereference before operations
        let total_dmg: u16 = *self.total_damage_this_turn;
        let combats: u16 = (*self.combats_this_turn).into();
        
        total_dmg / combats
    }

    #[inline(always)]
    fn get_health_advantage(self: @TurnSummary) -> i16 {
        // Fixed: Dereference and proper conversion
        let p1_health: u16 = *self.player1_total_health;
        let p2_health: u16 = *self.player2_total_health;
        
        let p1_i16: i16 = p1_health.try_into().unwrap_or(0);
        let p2_i16: i16 = p2_health.try_into().unwrap_or(0);
        
        p1_i16 - p2_i16
    }

    #[inline(always)]
    fn get_unit_advantage(self: @TurnSummary) -> i8 {
        let p1_units: i8 = (*self.player1_units_alive).try_into().unwrap_or(0);
        let p2_units: i8 = (*self.player2_units_alive).try_into().unwrap_or(0);
        p1_units - p2_units
    }

    #[inline(always)]
    fn is_game_ending_turn(self: @TurnSummary) -> bool {
        *self.player1_units_alive == 0 || *self.player2_units_alive == 0
    }
}

#[generate_trait]
pub impl KillEventImpl of KillEventTrait {
    #[inline(always)]
    fn new(
        game_id: u32,
        kill_id: u32,
        killer: ContractAddress,
        killer_unit_id: u8,
        victim: ContractAddress,
        victim_unit_id: u8,
        victim_was_commander: bool,
        turn_number: u8,
        position_x: u8,
        position_y: u8,
        final_blow_damage: u8,
        occurred_at: u64,
    ) -> KillEvent {
        KillEvent {
            game_id,
            kill_id,
            killer,
            killer_unit_id,
            victim,
            victim_unit_id,
            victim_was_commander,
            turn_number,
            position_x,
            position_y,
            final_blow_damage,
            occurred_at,
        }
    }

    #[inline(always)]
    fn was_commander_kill(self: @KillEvent) -> bool {
        *self.victim_was_commander
    }

    #[inline(always)]
    fn was_game_ending(self: @KillEvent) -> bool {
        *self.victim_was_commander  // Commander death ends game
    }

    #[inline(always)]
    fn was_early_game_kill(self: @KillEvent) -> bool {
        *self.turn_number <= 3
    }

    #[inline(always)]
    fn was_late_game_kill(self: @KillEvent) -> bool {
        *self.turn_number >= 10
    }
}

#[generate_trait]
pub impl DamageOverTimeImpl of DamageOverTimeTrait {
    #[inline(always)]
    fn new(
        game_id: u32,
        affected_owner: ContractAddress,
        affected_unit_id: u8,
        damage_per_turn: u8,
        source: DamageSource,
        turns_remaining: u8,
    ) -> DamageOverTime {
        DamageOverTime {
            game_id,
            affected_owner,
            affected_unit_id,
            damage_per_turn,
            source,
            turns_remaining,
            total_damage_dealt: 0,
        }
    }

    #[inline(always)]
    fn apply_damage(ref self: DamageOverTime) -> u8 {
        if self.turns_remaining == 0 {
            return 0;
        }
        
        self.turns_remaining -= 1;
        self.total_damage_dealt += self.damage_per_turn.into();
        self.damage_per_turn
    }

    #[inline(always)]
    fn is_active(self: @DamageOverTime) -> bool {
        *self.turns_remaining > 0
    }

    #[inline(always)]
    fn is_environmental(self: @DamageOverTime) -> bool {
        *self.source == DamageSource::Lava || *self.source == DamageSource::Environmental
    }

    #[inline(always)]
    fn extend_duration(ref self: DamageOverTime, additional_turns: u8) {
        self.turns_remaining += additional_turns;
    }
}

#[generate_trait]
pub impl StatusEffectImpl of StatusEffectTrait {
    #[inline(always)]
    fn new(
        game_id: u32,
        affected_owner: ContractAddress,
        affected_unit_id: u8,
        effect_id: u8,
        effect_type: EffectType,
        modifier_value: i8,
        turns_remaining: u8,
        applied_at_turn: u8,
    ) -> StatusEffect {
        StatusEffect {
            game_id,
            affected_owner,
            affected_unit_id,
            effect_id,
            effect_type,
            modifier_value,
            turns_remaining,
            applied_at_turn,
        }
    }

    #[inline(always)]
    fn tick(ref self: StatusEffect) -> bool {
        if self.turns_remaining > 0 {
            self.turns_remaining -= 1;
            return true;
        }
        false
    }

    #[inline(always)]
    fn is_active(self: @StatusEffect) -> bool {
        *self.turns_remaining > 0
    }

    #[inline(always)]
    fn is_buff(self: @StatusEffect) -> bool {
        *self.modifier_value > 0
    }

    #[inline(always)]
    fn is_debuff(self: @StatusEffect) -> bool {
        *self.modifier_value < 0
    }

    #[inline(always)]
    fn is_crowd_control(self: @StatusEffect) -> bool {
        *self.effect_type == EffectType::Stunned
    }

    #[inline(always)]
    fn get_modifier(self: @StatusEffect) -> i8 {
        if self.is_active() {
            *self.modifier_value
        } else {
            0
        }
    }

    #[inline(always)]
    fn extend_duration(ref self: StatusEffect, additional_turns: u8) {
        self.turns_remaining += additional_turns;
    }

    #[inline(always)]
    fn refresh(ref self: StatusEffect, new_duration: u8) {
        if new_duration > self.turns_remaining {
            self.turns_remaining = new_duration;
        }
    }
}