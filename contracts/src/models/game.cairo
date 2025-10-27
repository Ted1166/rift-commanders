use starknet::ContractAddress;
use core::num::traits::Zero;

// Core game state - manages the overall match
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Game {
    #[key]
    pub game_id: u32,
    pub player1: ContractAddress,
    pub player2: ContractAddress,
    pub creator: ContractAddress,
    pub current_phase: GamePhase,
    pub current_turn: u8,
    pub winner: ContractAddress,
    pub is_started: bool,
    pub is_finished: bool,
    pub created_at: u64,
    pub started_at: u64,
    pub finished_at: u64,
    pub rift_seed: u64,  // For verifiable randomness
    pub moves_committed_count: u8,  // Track how many players committed moves
}

// Game phases
#[derive(Serde, Copy, Drop, Introspect, PartialEq, Debug, DojoStore, Default)]
pub enum GamePhase {
    #[default]
    Lobby,        // Waiting for players
    Setup,        // Placing initial units
    Planning,     // Players commit moves secretly
    Execution,    // Moves revealed and executed
    Finished,     // Game over
}

#[generate_trait]
pub impl GameImpl of GameTrait {
    #[inline(always)]
    fn new(game_id: u32, creator: ContractAddress, created_at: u64) -> Game {
        Game {
            game_id,
            player1: creator,
            player2: Zero::zero(),
            creator,
            current_phase: GamePhase::Lobby,
            current_turn: 0,
            winner: Zero::zero(),
            is_started: false,
            is_finished: false,
            created_at,
            started_at: 0,
            finished_at: 0,
            rift_seed: created_at,  // Initial seed from timestamp
            moves_committed_count: 0,
        }
    }

    #[inline(always)]
    fn add_player(ref self: Game, player: ContractAddress) -> bool {
        // Only allow join if in lobby and player2 slot is empty
        if self.current_phase != GamePhase::Lobby {
            return false;
        }
        
        if self.player2 != Zero::zero() {
            return false;  // Game already full
        }
        
        if player == self.player1 {
            return false;  // Can't join own game
        }
        
        self.player2 = player;
        true
    }

    #[inline(always)]
    fn start_game(ref self: Game, started_at: u64) -> bool {
        if self.current_phase != GamePhase::Lobby {
            return false;
        }
        
        if self.player2 == Zero::zero() {
            return false;  // Need 2 players
        }
        
        self.is_started = true;
        self.started_at = started_at;
        self.current_phase = GamePhase::Setup;
        true
    }

    #[inline(always)]
    fn advance_to_planning(ref self: Game) -> bool {
        if self.current_phase != GamePhase::Setup {
            return false;
        }
        
        self.current_phase = GamePhase::Planning;
        self.moves_committed_count = 0;
        true
    }

    #[inline(always)]
    fn record_move_commitment(ref self: Game) -> bool {
        if self.current_phase != GamePhase::Planning {
            return false;
        }
        
        self.moves_committed_count += 1;
        
        // If both players committed, advance to execution
        if self.moves_committed_count >= 2 {
            self.current_phase = GamePhase::Execution;
        }
        
        true
    }

    #[inline(always)]
    fn advance_to_execution(ref self: Game) -> bool {
        if self.current_phase != GamePhase::Planning {
            return false;
        }
        
        self.current_phase = GamePhase::Execution;
        true
    }

    #[inline(always)]
    fn complete_turn(ref self: Game, new_rift_seed: u64) -> bool {
        if self.current_phase != GamePhase::Execution {
            return false;
        }
        
        self.current_turn += 1;
        self.rift_seed = new_rift_seed;  // Update seed for next rift
        self.current_phase = GamePhase::Planning;
        self.moves_committed_count = 0;
        true
    }

    #[inline(always)]
    fn end_game(ref self: Game, winner: ContractAddress, finished_at: u64) {
        self.is_finished = true;
        self.winner = winner;
        self.finished_at = finished_at;
        self.current_phase = GamePhase::Finished;
    }

    #[inline(always)]
    fn is_player(self: @Game, address: ContractAddress) -> bool {
        *self.player1 == address || *self.player2 == address
    }

    #[inline(always)]
    fn is_creator(self: @Game, address: ContractAddress) -> bool {
        *self.creator == address
    }

    #[inline(always)]
    fn is_full(self: @Game) -> bool {
        *self.player2 != Zero::zero()
    }

    #[inline(always)]
    fn is_active(self: @Game) -> bool {
        *self.is_started && !*self.is_finished
    }

    #[inline(always)]
    fn get_opponent(self: @Game, player: ContractAddress) -> ContractAddress {
        if *self.player1 == player {
            *self.player2
        } else {
            *self.player1
        }
    }

    #[inline(always)]
    fn both_players_committed(self: @Game) -> bool {
        *self.moves_committed_count >= 2
    }

    #[inline(always)]
    fn generate_rift_seed(self: @Game, block_timestamp: u64) -> u64 {
        // Simple deterministic randomness from game state
        let seed = *self.rift_seed;
        let turn = *self.current_turn;
        
        // Mix timestamp, turn, and previous seed
        (seed + block_timestamp + turn.into()) * 1103515245 + 12345
    }
}