use starknet::ContractAddress;
use core::num::traits::Zero;

// Player state within a game
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Player {
    #[key]
    pub game_id: u32,
    #[key]
    pub address: ContractAddress,
    pub player_number: u8,  // 1 or 2
    pub units_alive: u8,    // How many units still alive (max 3)
    pub has_committed_moves: bool,
    pub setup_complete: bool,  // Has finished unit placement
    pub commander_alive: bool,  // Special flag for commander (win condition)
    pub total_damage_dealt: u32,
    pub total_damage_taken: u32,
    pub units_killed: u8,
    pub special_abilities_used: u8,
}

#[generate_trait]
pub impl PlayerImpl of PlayerTrait {
    #[inline(always)]
    fn new(
        game_id: u32,
        address: ContractAddress,
        player_number: u8,
    ) -> Player {
        Player {
            game_id,
            address,
            player_number,
            units_alive: 3,  // Start with 3 units
            has_committed_moves: false,
            setup_complete: false,
            commander_alive: true,
            total_damage_dealt: 0,
            total_damage_taken: 0,
            units_killed: 0,
            special_abilities_used: 0,
        }
    }

    #[inline(always)]
    fn complete_setup(ref self: Player) -> bool {
        if self.setup_complete {
            return false;  // Already completed
        }
        
        self.setup_complete = true;
        true
    }

    #[inline(always)]
    fn commit_moves(ref self: Player) -> bool {
        if self.has_committed_moves {
            return false;  // Already committed this turn
        }
        
        self.has_committed_moves = true;
        true
    }

    #[inline(always)]
    fn reset_move_commitment(ref self: Player) {
        self.has_committed_moves = false;
    }

    #[inline(always)]
    fn unit_killed(ref self: Player, was_commander: bool) {
        if self.units_alive > 0 {
            self.units_alive -= 1;
        }
        
        if was_commander {
            self.commander_alive = false;
        }
        
        self.units_killed += 1;
    }

    #[inline(always)]
    fn record_damage_dealt(ref self: Player, damage: u32) {
        self.total_damage_dealt += damage;
    }

    #[inline(always)]
    fn record_damage_taken(ref self: Player, damage: u32) {
        self.total_damage_taken += damage;
    }

    #[inline(always)]
    fn use_special_ability(ref self: Player) {
        self.special_abilities_used += 1;
    }

    #[inline(always)]
    fn is_defeated(self: @Player) -> bool {
        // Player is defeated if commander is dead OR all units are dead
        !*self.commander_alive || *self.units_alive == 0
    }

    #[inline(always)]
    fn has_units_alive(self: @Player) -> bool {
        *self.units_alive > 0
    }

    #[inline(always)]
    fn is_ready_for_battle(self: @Player) -> bool {
        *self.setup_complete && *self.units_alive > 0
    }

    #[inline(always)]
    fn can_commit_moves(self: @Player) -> bool {
        !*self.has_committed_moves && *self.units_alive > 0
    }

    #[inline(always)]
    fn get_kill_death_ratio(self: @Player) -> u32 {
        if *self.units_killed == 0 {
            return 0;
        }
        
        let units_lost = 3 - *self.units_alive;
        if units_lost == 0 {
            let kills: u32 = (*self.units_killed).into();
            return kills * 100;  // Perfect KD
        }
        
        let kills: u32 = (*self.units_killed).into();
        let lost: u32 = units_lost.into();

        (kills * 100) / lost
    }

    #[inline(always)]
    fn get_damage_efficiency(self: @Player) -> u32 {
        // Damage dealt vs damage taken ratio (percentage)
        if *self.total_damage_taken == 0 {
            if *self.total_damage_dealt > 0 {
                return 100;  // Perfect efficiency
            }
            return 0;
        }
        
        (*self.total_damage_dealt * 100) / *self.total_damage_taken
    }

    #[inline(always)]
    fn is_player_one(self: @Player) -> bool {
        *self.player_number == 1
    }

    #[inline(always)]
    fn is_player_two(self: @Player) -> bool {
        *self.player_number == 2
    }

    #[inline(always)]
    fn has_commander(self: @Player) -> bool {
        *self.commander_alive
    }

    #[inline(always)]
    fn get_remaining_units(self: @Player) -> u8 {
        *self.units_alive
    }

    #[inline(always)]
    fn calculate_score(self: @Player) -> u32 {
        let mut score: u32 = 0;
        
        // Points for units alive
        score += (*self.units_alive).into() * 100;
        
        // Bonus for commander alive
        if *self.commander_alive {
            score += 200;
        }
        
        // Points for kills
        score += (*self.units_killed).into() * 50;
        
        // Points for damage dealt
        score += *self.total_damage_dealt / 10;
        
        // Penalty for damage taken
        if score > *self.total_damage_taken / 20 {
            score -= *self.total_damage_taken / 20;
        } else {
            score = 0;
        }
        
        score
    }

    #[inline(always)]
    fn is_dominating(self: @Player) -> bool {
        // Player is dominating if they have clear advantage
        *self.units_alive == 3 && *self.units_killed >= 1
    }

    #[inline(always)]
    fn is_in_danger(self: @Player) -> bool {
        // Player is in danger if only 1 unit left
        *self.units_alive == 1
    }
}