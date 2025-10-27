use starknet::ContractAddress;
use core::num::traits::Zero;

// Planned move during commitment phase (hidden from opponent)
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct PlannedMove {
    #[key]
    pub game_id: u32,
    #[key]
    pub player: ContractAddress,
    #[key]
    pub unit_id: u8,
    pub target_x: u8,
    pub target_y: u8,
    pub action_type: ActionType,
    pub commitment_hash: felt252,  // Hash of the move for hiding
    pub is_revealed: bool,
    pub committed_at: u64,
}

// Executed move after reveal phase
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct ExecutedMove {
    #[key]
    pub game_id: u32,
    #[key]
    pub turn_number: u8,
    #[key]
    pub player: ContractAddress,
    #[key]
    pub unit_id: u8,
    pub from_x: u8,
    pub from_y: u8,
    pub target_x: u8,
    pub target_y: u8,
    pub action_type: ActionType,
    pub was_successful: bool,
    pub damage_dealt: u8,
    pub target_unit_id: u8,  // If attacking, which unit was targeted
    pub target_owner: ContractAddress,  // Owner of target unit
    pub executed_at: u64,
}

// Move history for replay/analysis
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct MoveHistory {
    #[key]
    pub game_id: u32,
    #[key]
    pub turn_number: u8,
    pub player1_moves_count: u8,
    pub player2_moves_count: u8,
    pub total_attacks: u8,
    pub total_movements: u8,
    pub total_special_abilities: u8,
    pub rift_triggered: bool,
}

// Action types for units
#[derive(Serde, Copy, Drop, Introspect, PartialEq, Debug, DojoStore, Default)]
pub enum ActionType {
    #[default]
    Move,           // Move to target position
    Attack,         // Attack enemy unit at position
    Defend,         // Defensive stance (bonus defense this turn)
    Special,        // Unit-specific special ability
    Wait,           // Skip action (stay in place)
}

#[generate_trait]
pub impl PlannedMoveImpl of PlannedMoveTrait {
    #[inline(always)]
    fn new(
        game_id: u32,
        player: ContractAddress,
        unit_id: u8,
        target_x: u8,
        target_y: u8,
        action_type: ActionType,
        commitment_hash: felt252,
        committed_at: u64,
    ) -> PlannedMove {
        PlannedMove {
            game_id,
            player,
            unit_id,
            target_x,
            target_y,
            action_type,
            commitment_hash,
            is_revealed: false,
            committed_at,
        }
    }

    #[inline(always)]
    fn reveal(ref self: PlannedMove) -> bool {
        if self.is_revealed {
            return false;
        }
        
        self.is_revealed = true;
        true
    }

    #[inline(always)]
    fn verify_commitment(self: @PlannedMove, actual_hash: felt252) -> bool {
        *self.commitment_hash == actual_hash
    }

    #[inline(always)]
    fn is_attack_action(self: @PlannedMove) -> bool {
        *self.action_type == ActionType::Attack
    }

    #[inline(always)]
    fn is_move_action(self: @PlannedMove) -> bool {
        *self.action_type == ActionType::Move
    }

    #[inline(always)]
    fn is_defensive_action(self: @PlannedMove) -> bool {
        *self.action_type == ActionType::Defend
    }

    #[inline(always)]
    fn is_special_action(self: @PlannedMove) -> bool {
        *self.action_type == ActionType::Special
    }

    #[inline(always)]
    fn is_wait_action(self: @PlannedMove) -> bool {
        *self.action_type == ActionType::Wait
    }

    #[inline(always)]
    fn get_target_position(self: @PlannedMove) -> (u8, u8) {
        (*self.target_x, *self.target_y)
    }
}

#[generate_trait]
pub impl ExecutedMoveImpl of ExecutedMoveTrait {
    #[inline(always)]
    fn new(
        game_id: u32,
        turn_number: u8,
        player: ContractAddress,
        unit_id: u8,
        from_x: u8,
        from_y: u8,
        target_x: u8,
        target_y: u8,
        action_type: ActionType,
        executed_at: u64,
    ) -> ExecutedMove {
        ExecutedMove {
            game_id,
            turn_number,
            player,
            unit_id,
            from_x,
            from_y,
            target_x,
            target_y,
            action_type,
            was_successful: false,
            damage_dealt: 0,
            target_unit_id: 255,  // 255 = no target
            target_owner: Zero::zero(),
            executed_at,
        }
    }

    #[inline(always)]
    fn mark_successful(ref self: ExecutedMove) {
        self.was_successful = true;
    }

    #[inline(always)]
    fn mark_failed(ref self: ExecutedMove) {
        self.was_successful = false;
    }

    #[inline(always)]
    fn record_attack_result(
        ref self: ExecutedMove,
        damage: u8,
        target_unit_id: u8,
        target_owner: ContractAddress,
    ) {
        self.damage_dealt = damage;
        self.target_unit_id = target_unit_id;
        self.target_owner = target_owner;
        self.was_successful = true;
    }

    #[inline(always)]
    fn is_attack(self: @ExecutedMove) -> bool {
        *self.action_type == ActionType::Attack
    }

    #[inline(always)]
    fn is_movement(self: @ExecutedMove) -> bool {
        *self.action_type == ActionType::Move
    }

    #[inline(always)]
    fn has_target(self: @ExecutedMove) -> bool {
        *self.target_unit_id != 255
    }

    #[inline(always)]
    fn get_distance_moved(self: @ExecutedMove) -> u8 {
        let dx = if *self.from_x > *self.target_x {
            *self.from_x - *self.target_x
        } else {
            *self.target_x - *self.from_x
        };
        
        let dy = if *self.from_y > *self.target_y {
            *self.from_y - *self.target_y
        } else {
            *self.target_y - *self.from_y
        };
        
        dx + dy
    }

    #[inline(always)]
    fn was_attack_successful(self: @ExecutedMove) -> bool {
        *self.was_successful && *self.damage_dealt > 0
    }

    #[inline(always)]
    fn get_from_position(self: @ExecutedMove) -> (u8, u8) {
        (*self.from_x, *self.from_y)
    }

    #[inline(always)]
    fn get_target_position(self: @ExecutedMove) -> (u8, u8) {
        (*self.target_x, *self.target_y)
    }
}

#[generate_trait]
pub impl MoveHistoryImpl of MoveHistoryTrait {
    #[inline(always)]
    fn new(game_id: u32, turn_number: u8) -> MoveHistory {
        MoveHistory {
            game_id,
            turn_number,
            player1_moves_count: 0,
            player2_moves_count: 0,
            total_attacks: 0,
            total_movements: 0,
            total_special_abilities: 0,
            rift_triggered: false,
        }
    }

    #[inline(always)]
    fn record_player1_move(ref self: MoveHistory, action_type: ActionType) {
        self.player1_moves_count += 1;
        self.increment_action_counter(action_type);
    }

    #[inline(always)]
    fn record_player2_move(ref self: MoveHistory, action_type: ActionType) {
        self.player2_moves_count += 1;
        self.increment_action_counter(action_type);
    }

    #[inline(always)]
    fn increment_action_counter(ref self: MoveHistory, action_type: ActionType) {
        match action_type {
            ActionType::Attack => self.total_attacks += 1,
            ActionType::Move => self.total_movements += 1,
            ActionType::Special => self.total_special_abilities += 1,
            ActionType::Defend => {},
            ActionType::Wait => {},
        }
    }

    #[inline(always)]
    fn trigger_rift(ref self: MoveHistory) {
        self.rift_triggered = true;
    }

    #[inline(always)]
    fn get_total_actions(self: @MoveHistory) -> u8 {
        *self.player1_moves_count + *self.player2_moves_count
    }

    #[inline(always)]
    fn was_aggressive_turn(self: @MoveHistory) -> bool {
        *self.total_attacks >= 4  // If 4+ attacks happened, turn was aggressive
    }

    #[inline(always)]
    fn was_defensive_turn(self: @MoveHistory) -> bool {
        *self.total_movements > *self.total_attacks
    }

    #[inline(always)]
    fn both_players_moved(self: @MoveHistory) -> bool {
        *self.player1_moves_count > 0 && *self.player2_moves_count > 0
    }

    #[inline(always)]
    fn get_aggression_score(self: @MoveHistory) -> u8 {
        // Calculate how aggressive the turn was (0-100)
        let attacks = *self.total_attacks;
        let specials = *self.total_special_abilities;
        let total_actions = self.get_total_actions();
        
        if total_actions == 0 {
            return 0;
        }
        
        let aggressive_actions = attacks + specials;
        (aggressive_actions * 100) / total_actions
    }
}

// Helper functions for move validation
#[generate_trait]
pub impl MoveValidationImpl of MoveValidationTrait {
    #[inline(always)]
    fn is_valid_grid_position(x: u8, y: u8) -> bool {
        x < 5 && y < 5  // 5x5 grid (0-4)
    }

    #[inline(always)]
    fn is_diagonal_move(from_x: u8, from_y: u8, to_x: u8, to_y: u8) -> bool {
        let dx = if from_x > to_x { from_x - to_x } else { to_x - from_x };
        let dy = if from_y > to_y { from_y - to_y } else { to_y - from_y };
        
        dx > 0 && dy > 0  // Both coordinates changed
    }

    #[inline(always)]
    fn calculate_move_distance(from_x: u8, from_y: u8, to_x: u8, to_y: u8) -> u8 {
        let dx = if from_x > to_x { from_x - to_x } else { to_x - from_x };
        let dy = if from_y > to_y { from_y - to_y } else { to_y - from_y };
        dx + dy
    }

    #[inline(always)]
    fn is_same_position(x1: u8, y1: u8, x2: u8, y2: u8) -> bool {
        x1 == x2 && y1 == y2
    }

    #[inline(always)]
    fn positions_are_adjacent(x1: u8, y1: u8, x2: u8, y2: u8) -> bool {
        let distance = Self::calculate_move_distance(x1, y1, x2, y2);
        distance == 1
    }
}