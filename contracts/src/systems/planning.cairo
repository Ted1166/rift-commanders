use starknet::ContractAddress;
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
use rift_commanders::models::game::{Game, GameTrait, GamePhase};
use rift_commanders::models::player::{Player, PlayerTrait};
use rift_commanders::models::unit::{Unit, UnitTrait};
use rift_commanders::models::moves::{PlannedMove, PlannedMoveTrait, ActionType, MoveValidationTrait};

#[starknet::interface]
trait IPlanning<T> {
    fn commit_moves(
        ref self: T,
        game_id: u32,
        unit_0_target_x: u8,
        unit_0_target_y: u8,
        unit_0_action: ActionType,
        unit_1_target_x: u8,
        unit_1_target_y: u8,
        unit_1_action: ActionType,
        unit_2_target_x: u8,
        unit_2_target_y: u8,
        unit_2_action: ActionType,
        commitment_hash: felt252,
    );
    fn auto_advance_if_ready(ref self: T, game_id: u32);
}

#[dojo::contract]
mod planning {
    use super::{IPlanning, ContractAddress};
    use starknet::{get_caller_address, get_block_timestamp};
    use dojo::model::{ModelStorage, ModelValueStorage};
    use dojo::event::EventStorage;
    
    use rift_commanders::models::game::{Game, GameTrait, GamePhase};
    use rift_commanders::models::player::{Player, PlayerTrait};
    use rift_commanders::models::unit::{Unit, UnitTrait};
    use rift_commanders::models::moves::{
        PlannedMove, PlannedMoveTrait, ActionType, MoveValidationTrait
    };

    // Events
    #[derive(Copy, Drop, Serde, Debug)]
    #[dojo::event]
    pub struct MovesCommitted {
        #[key]
        pub game_id: u32,
        pub player: ContractAddress,
        pub turn_number: u8,
        pub commitment_hash: felt252,
        pub timestamp: u64,
    }

    #[derive(Copy, Drop, Serde, Debug)]
    #[dojo::event]
    pub struct ReadyForExecution {
        #[key]
        pub game_id: u32,
        pub turn_number: u8,
        pub timestamp: u64,
    }

    #[abi(embed_v0)]
    impl PlanningImpl of IPlanning<ContractState> {
        fn commit_moves(
            ref self: ContractState,
            game_id: u32,
            unit_0_target_x: u8,
            unit_0_target_y: u8,
            unit_0_action: ActionType,
            unit_1_target_x: u8,
            unit_1_target_y: u8,
            unit_1_action: ActionType,
            unit_2_target_x: u8,
            unit_2_target_y: u8,
            unit_2_action: ActionType,
            commitment_hash: felt252,
        ) {
            let mut world = self.world_default();
            let caller = get_caller_address();
            let timestamp = get_block_timestamp();
            
            // Get and validate game
            let mut game: Game = world.read_model(game_id);
            assert(game.is_player(caller), 'Not a player');
            assert(game.current_phase == GamePhase::Planning, 'Not in planning phase');
            assert(game.is_active(), 'Game not active');
            
            // Get and validate player
            let mut player: Player = world.read_model((game_id, caller));
            assert(player.can_commit_moves(), 'Already committed');
            assert(player.units_alive > 0, 'No units alive');
            
            // Validate all positions are in grid bounds
            assert(
                MoveValidationTrait::is_valid_grid_position(unit_0_target_x, unit_0_target_y),
                'Unit 0 target invalid'
            );
            assert(
                MoveValidationTrait::is_valid_grid_position(unit_1_target_x, unit_1_target_y),
                'Unit 1 target invalid'
            );
            assert(
                MoveValidationTrait::is_valid_grid_position(unit_2_target_x, unit_2_target_y),
                'Unit 2 target invalid'
            );
            
            // Get units and validate they're alive
            let unit_0: Unit = world.read_model((game_id, caller, 0_u8));
            let unit_1: Unit = world.read_model((game_id, caller, 1_u8));
            let unit_2: Unit = world.read_model((game_id, caller, 2_u8));
            
            // Create planned moves for each unit (even if dead, we store them)
            let move_0 = PlannedMoveTrait::new(
                game_id,
                caller,
                0,
                unit_0_target_x,
                unit_0_target_y,
                unit_0_action,
                commitment_hash,
                timestamp,
            );
            world.write_model(@move_0);
            
            let move_1 = PlannedMoveTrait::new(
                game_id,
                caller,
                1,
                unit_1_target_x,
                unit_1_target_y,
                unit_1_action,
                commitment_hash,
                timestamp,
            );
            world.write_model(@move_1);
            
            let move_2 = PlannedMoveTrait::new(
                game_id,
                caller,
                2,
                unit_2_target_x,
                unit_2_target_y,
                unit_2_action,
                commitment_hash,
                timestamp,
            );
            world.write_model(@move_2);
            
            // Only validate alive units' moves - FIXED: Changed Self:: to InternalImpl::
            if unit_0.is_alive {
                InternalImpl::validate_unit_move(
                    ref self,
                    game_id,
                    @unit_0,
                    unit_0_target_x,
                    unit_0_target_y,
                    unit_0_action
                );
            }
            
            if unit_1.is_alive {
                InternalImpl::validate_unit_move(
                    ref self,
                    game_id,
                    @unit_1,
                    unit_1_target_x,
                    unit_1_target_y,
                    unit_1_action
                );
            }
            
            if unit_2.is_alive {
                InternalImpl::validate_unit_move(
                    ref self,
                    game_id,
                    @unit_2,
                    unit_2_target_x,
                    unit_2_target_y,
                    unit_2_action
                );
            }
            
            // Mark player as committed
            player.commit_moves();
            world.write_model(@player);
            
            // Record commitment in game
            game.record_move_commitment();
            world.write_model(@game);
            
            // Emit event
            world.emit_event(
                @MovesCommitted {
                    game_id,
                    player: caller,
                    turn_number: game.current_turn,
                    commitment_hash,
                    timestamp
                }
            );
            
            // Check if both players have committed
            if game.both_players_committed() {
                // Auto-advance to execution phase
                game.advance_to_execution();
                world.write_model(@game);
                
                world.emit_event(
                    @ReadyForExecution {
                        game_id,
                        turn_number: game.current_turn,
                        timestamp
                    }
                );
            }
        }

        fn auto_advance_if_ready(ref self: ContractState, game_id: u32) {
            let mut world = self.world_default();
            let timestamp = get_block_timestamp();
            
            // Get game
            let mut game: Game = world.read_model(game_id);
            
            // Check if both players committed and still in planning
            if game.current_phase == GamePhase::Planning && game.both_players_committed() {
                game.advance_to_execution();
                world.write_model(@game);
                
                world.emit_event(
                    @ReadyForExecution {
                        game_id,
                        turn_number: game.current_turn,
                        timestamp
                    }
                );
            }
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"rift_commanders")
        }

        fn validate_unit_move(
            ref self: ContractState,
            game_id: u32,
            unit: @Unit,
            target_x: u8,
            target_y: u8,
            action: ActionType,
        ) {
            // Basic validation - more detailed validation happens during execution
            
            match action {
                ActionType::Move => {
                    // Check if target is within movement range
                    assert(
                        unit.can_reach_position(target_x, target_y),
                        'Target out of movement range'
                    );
                },
                ActionType::Attack => {
                    // Check if target is within attack range
                    assert(
                        unit.can_attack_target(target_x, target_y),
                        'Target out of attack range'
                    );
                },
                ActionType::Defend => {
                    // Defend action: unit stays in place
                    // No position validation needed
                },
                ActionType::Special => {
                    // Special ability validation (could be range-based)
                    // For now, allow any position
                },
                ActionType::Wait => {
                    // Wait: do nothing
                    // No validation needed
                },
            }
        }
    }
}