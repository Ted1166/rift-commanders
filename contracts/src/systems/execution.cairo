use starknet::ContractAddress;
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
use rift_commanders::models::game::{Game, GameTrait, GamePhase};
use rift_commanders::models::player::{Player, PlayerTrait};
use rift_commanders::models::unit::{Unit, UnitTrait, UnitType};
use rift_commanders::models::moves::{
    PlannedMove, PlannedMoveTrait, ExecutedMove, ExecutedMoveTrait, 
    MoveHistory, MoveHistoryTrait, ActionType
};
use rift_commanders::models::battlefield::{Tile, TileTrait};
use rift_commanders::models::combat::{
    CombatResult, CombatResultTrait, TurnSummary, TurnSummaryTrait,
    KillEvent, KillEventTrait
};

#[starknet::interface]
trait IExecution<TContractState> {
    fn execute_turn(ref self: TContractState, game_id: u32);
    fn resolve_combat(
        ref self: TContractState,
        game_id: u32,
        attacker_owner: ContractAddress,
        attacker_unit_id: u8,
        defender_owner: ContractAddress,
        defender_unit_id: u8,
    ) -> u8;
}

#[dojo::contract]
mod execution {
    use super::{IExecution, ContractAddress};
    use starknet::{get_caller_address, get_block_timestamp};
    use dojo::model::{ModelStorage, ModelValueStorage};
    use dojo::event::EventStorage;
    use core::num::traits::Zero;
    
    use rift_commanders::models::game::{Game, GameTrait, GamePhase};
    use rift_commanders::models::player::{Player, PlayerTrait};
    use rift_commanders::models::unit::{Unit, UnitTrait, UnitType};
    use rift_commanders::models::moves::{
        PlannedMove, PlannedMoveTrait, ExecutedMove, ExecutedMoveTrait,
        MoveHistory, MoveHistoryTrait, ActionType
    };
    use rift_commanders::models::battlefield::{Tile, TileTrait};
    use rift_commanders::models::combat::{
        CombatResult, CombatResultTrait, TurnSummary, TurnSummaryTrait,
        KillEvent, KillEventTrait
    };

    // Events
    #[derive(Copy, Drop, Serde, Debug)]
    #[dojo::event]
    pub struct TurnExecuted {
        #[key]
        pub game_id: u32,
        pub turn_number: u8,
        pub total_combats: u8,
        pub units_killed: u8,
        pub timestamp: u64,
    }

    #[derive(Copy, Drop, Serde, Debug)]
    #[dojo::event]
    pub struct UnitMoved {
        #[key]
        pub game_id: u32,
        pub owner: ContractAddress,
        pub unit_id: u8,
        pub from_x: u8,
        pub from_y: u8,
        pub to_x: u8,
        pub to_y: u8,
    }

    #[derive(Copy, Drop, Serde, Debug)]
    #[dojo::event]
    pub struct CombatOccurred {
        #[key]
        pub game_id: u32,
        pub attacker: ContractAddress,
        pub attacker_unit_id: u8,
        pub defender: ContractAddress,
        pub defender_unit_id: u8,
        pub damage: u8,
        pub defender_killed: bool,
    }

    #[derive(Copy, Drop, Serde, Debug)]
    #[dojo::event]
    pub struct UnitKilled {
        #[key]
        pub game_id: u32,
        pub victim: ContractAddress,
        pub victim_unit_id: u8,
        pub killer: ContractAddress,
        pub killer_unit_id: u8,
        pub was_commander: bool,
    }

    #[derive(Copy, Drop, Serde, Debug)]
    #[dojo::event]
    pub struct GameEnded {
        #[key]
        pub game_id: u32,
        pub winner: ContractAddress,
        pub loser: ContractAddress,
        pub reason: felt252,
        pub timestamp: u64,
    }

    #[abi(embed_v0)]
    impl ExecutionImpl of IExecution<ContractState> {
        fn execute_turn(ref self: ContractState, game_id: u32) {
            let mut world = self.world_default();
            let timestamp = get_block_timestamp();
            
            // Get game
            let mut game: Game = world.read_model(game_id);
            assert(game.current_phase == GamePhase::Execution, 'Not in execution phase');
            assert(game.is_active(), 'Game not active');
            
            // Get players
            let mut player1: Player = world.read_model((game_id, game.player1));
            let mut player2: Player = world.read_model((game_id, game.player2));
            
            // Create turn summary
            let mut turn_summary = TurnSummaryTrait::new(
                game_id,
                game.current_turn,
                game.player1,
                game.player2,
                timestamp
            );
            
            // Create move history
            let mut move_history = MoveHistoryTrait::new(game_id, game.current_turn);
            
            // Step 1: Execute all movement actions
            InternalImpl::execute_movements(
                ref self,
                game_id,
                game.player1,
                game.player2,
                game.current_turn,
                timestamp,
                ref move_history
            );
            
            // Step 2: Execute all attack actions
            let combat_count = InternalImpl::execute_attacks(
                ref self,
                game_id,
                game.player1,
                game.player2,
                game.current_turn,
                timestamp,
                ref turn_summary,
                ref move_history,
                ref player1,
                ref player2
            );
            
            // Step 3: Apply terrain effects (lava damage, healing, etc.)
            InternalImpl::apply_terrain_effects(
                ref self,
                game_id,
                game.player1,
                game.player2,
                ref player1,
                ref player2,
                ref turn_summary
            );
            
            // Step 4: Reset unit turn flags
            InternalImpl::reset_all_units(ref self, game_id, game.player1, game.player2);
            
            // Step 5: Update player health totals
            let p1_health = InternalImpl::calculate_total_health(ref self, game_id, game.player1);
            let p2_health = InternalImpl::calculate_total_health(ref self, game_id, game.player2);
            turn_summary.update_health_totals(p1_health, p2_health);
            
            // Step 6: Reset player move commitments for next turn
            player1.reset_move_commitment();
            player2.reset_move_commitment();
            world.write_model(@player1);
            world.write_model(@player2);
            
            // Step 7: Check for game end conditions
            let game_ended = InternalImpl::check_game_end(
                ref self,
                game_id,
                ref game,
                @player1,
                @player2,
                timestamp
            );
            
            if !game_ended {
                let new_seed = game.generate_rift_seed(timestamp);
                game.complete_turn(new_seed);
                world.write_model(@game);
            }
            
            turn_summary.end_turn(timestamp);
            world.write_model(@turn_summary);
            world.write_model(@move_history);
            
            world.emit_event(
                @TurnExecuted {
                    game_id,
                    turn_number: game.current_turn,
                    total_combats: combat_count,
                    units_killed: turn_summary.units_killed_this_turn,
                    timestamp
                }
            );
        }

        fn resolve_combat(
            ref self: ContractState,
            game_id: u32,
            attacker_owner: ContractAddress,
            attacker_unit_id: u8,
            defender_owner: ContractAddress,
            defender_unit_id: u8,
        ) -> u8 {
            let mut world = self.world_default();
            
            // Get units
            let mut attacker: Unit = world.read_model((game_id, attacker_owner, attacker_unit_id));
            let mut defender: Unit = world.read_model((game_id, defender_owner, defender_unit_id));
            
            // Check both are alive
            if !attacker.is_alive || !defender.is_alive {
                return 0;
            }
            
            // Get terrain bonus for attacker
            let attacker_tile: Tile = world.read_model((game_id, attacker.position_x, attacker.position_y));
            let terrain_bonus = attacker_tile.get_tile_attack_bonus();
            
            // Calculate damage
            let base_damage = attacker.get_effective_attack() + terrain_bonus;
            let defender_defense = defender.get_effective_defense();
            
            let actual_damage = if base_damage > defender_defense {
                base_damage - defender_defense
            } else {
                1 
            };
            
            // Apply damage
            let health_before = defender.health;
            let damage_dealt = defender.take_damage(actual_damage);
            
            // Update attacker
            attacker.total_damage_dealt += damage_dealt.into();
            attacker.has_attacked_this_turn = true;
            
            // Check if defender died
            if !defender.is_alive {
                attacker.kills += 1;
            }
            
            // Save units
            world.write_model(@attacker);
            world.write_model(@defender);
            
            damage_dealt
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"rift_commanders")
        }

        fn execute_movements(
            ref self: ContractState,
            game_id: u32,
            player1: ContractAddress,
            player2: ContractAddress,
            turn_number: u8,
            timestamp: u64,
            ref move_history: MoveHistory,
        ) {
            // Execute player 1 movements
            Self::execute_player_movements(
                ref self,
                game_id,
                player1,
                turn_number,
                timestamp,
                ref move_history,
                true
            );
            
            // Execute player 2 movements
            Self::execute_player_movements(
                ref self,
                game_id,
                player2,
                turn_number,
                timestamp,
                ref move_history,
                false
            );
        }

        fn execute_player_movements(
            ref self: ContractState,
            game_id: u32,
            player: ContractAddress,
            turn_number: u8,
            timestamp: u64,
            ref move_history: MoveHistory,
            is_player1: bool,
        ) {
            let mut world = self.world_default();

            let mut unit_id: u8 = 0;
            loop {
                if unit_id >= 3 {
                    break;
                }
                
                // Get planned move
                let planned_move: PlannedMove = world.read_model((game_id, player, unit_id));
                
                // Only process Move actions
                if planned_move.is_move_action() {
                    let mut unit: Unit = world.read_model((game_id, player, unit_id));
                    
                    if unit.is_alive {
                        let old_x = unit.position_x;
                        let old_y = unit.position_y;
                        let (target_x, target_y) = planned_move.get_target_position();
                        
                        // Validate and execute move
                        if unit.can_reach_position(target_x, target_y) {
                            // Clear old tile
                            let mut old_tile: Tile = world.read_model((game_id, old_x, old_y));
                            old_tile.vacate();
                            world.write_model(@old_tile);
                            
                            // Check if new tile is available
                            let mut new_tile: Tile = world.read_model((game_id, target_x, target_y));
                            
                            if !new_tile.is_occupied && new_tile.is_walkable() {
                                // Move unit
                                unit.move_to(target_x, target_y);
                                world.write_model(@unit);
                                
                                // Occupy new tile
                                new_tile.occupy(player, unit_id);
                                world.write_model(@new_tile);
                                
                                // Record executed move
                                let mut executed = ExecutedMoveTrait::new(
                                    game_id,
                                    turn_number,
                                    player,
                                    unit_id,
                                    old_x,
                                    old_y,
                                    target_x,
                                    target_y,
                                    ActionType::Move,
                                    timestamp
                                );
                                executed.mark_successful();
                                world.write_model(@executed);
                                
                                // Update history
                                if is_player1 {
                                    move_history.record_player1_move(ActionType::Move);
                                } else {
                                    move_history.record_player2_move(ActionType::Move);
                                }
                                
                                // Emit event
                                world.emit_event(
                                    @UnitMoved {
                                        game_id,
                                        owner: player,
                                        unit_id,
                                        from_x: old_x,
                                        from_y: old_y,
                                        to_x: target_x,
                                        to_y: target_y
                                    }
                                );
                            }
                        }
                    }
                }
                
                unit_id += 1;
            };
        }

        fn execute_attacks(
            ref self: ContractState,
            game_id: u32,
            player1: ContractAddress,
            player2: ContractAddress,
            turn_number: u8,
            timestamp: u64,
            ref turn_summary: TurnSummary,
            ref move_history: MoveHistory,
            ref player1_data: Player,
            ref player2_data: Player,
        ) -> u8 {
            let mut combat_id: u8 = 0;
            let mut total_kills: u32 = 0;
            
            // Process player 1 attacks
            combat_id = Self::process_player_attacks(
                ref self,
                game_id,
                player1,
                player2,
                turn_number,
                timestamp,
                combat_id,
                ref turn_summary,
                ref move_history,
                ref player1_data,
                ref player2_data,
                ref total_kills,
                true
            );
            
            // Process player 2 attacks
            combat_id = Self::process_player_attacks(
                ref self,
                game_id,
                player2,
                player1,
                turn_number,
                timestamp,
                combat_id,
                ref turn_summary,
                ref move_history,
                ref player2_data,
                ref player1_data,
                ref total_kills,
                false
            );
            
            combat_id
        }

        fn process_player_attacks(
            ref self: ContractState,
            game_id: u32,
            attacker_player: ContractAddress,
            defender_player: ContractAddress,
            turn_number: u8,
            timestamp: u64,
            mut combat_id: u8,
            ref turn_summary: TurnSummary,
            ref move_history: MoveHistory,
            ref attacker_data: Player,
            ref defender_data: Player,
            ref total_kills: u32,
            is_player1: bool,
        ) -> u8 {
            let mut world = self.world_default();

            let mut unit_id: u8 = 0;
            loop {
                if unit_id >= 3 {
                    break;
                }
                
                let planned_move: PlannedMove = world.read_model((game_id, attacker_player, unit_id));
                
                if planned_move.is_attack_action() {
                    let attacker: Unit = world.read_model((game_id, attacker_player, unit_id));
                    
                    if attacker.is_alive {
                        let (target_x, target_y) = planned_move.get_target_position();
                        
                        // Find defender at target position
                        let defender_unit = Self::find_unit_at_position(
                            ref self,
                            game_id,
                            defender_player,
                            target_x,
                            target_y
                        );
                        
                        if defender_unit.is_some() {
                            let defender_id = defender_unit.unwrap();
                            
                            // Create combat result
                            let mut combat_result = CombatResultTrait::new(
                                game_id,
                                turn_number,
                                combat_id,
                                attacker_player,
                                unit_id,
                                defender_player,
                                defender_id,
                                attacker.position_x,
                                attacker.position_y,
                                target_x,
                                target_y,
                                timestamp
                            );
                            
                            // Resolve combat using the interface function
                            let damage = ExecutionImpl::resolve_combat(
                                ref self,
                                game_id,
                                attacker_player,
                                unit_id,
                                defender_player,
                                defender_id
                            );
                            
                            let defender: Unit = world.read_model((game_id, defender_player, defender_id));
                            let was_killed = !defender.is_alive;
                            
                            // Record combat
                            turn_summary.record_combat(damage, was_killed);
                            
                            if is_player1 {
                                move_history.record_player1_move(ActionType::Attack);
                                attacker_data.record_damage_dealt(damage.into());
                                defender_data.record_damage_taken(damage.into());
                            } else {
                                move_history.record_player2_move(ActionType::Attack);
                                attacker_data.record_damage_dealt(damage.into());
                                defender_data.record_damage_taken(damage.into());
                            }
                            
                            // Handle kill
                            if was_killed {
                                let was_commander = defender.is_commander();
                                
                                // Update player stats
                                defender_data.unit_killed(was_commander);
                                turn_summary.record_unit_death(!is_player1);
                                
                                // Clear tile
                                let mut tile: Tile = world.read_model((game_id, target_x, target_y));
                                tile.vacate();
                                world.write_model(@tile);
                                
                                // Create kill event
                                let kill_event = KillEventTrait::new(
                                    game_id,
                                    total_kills,
                                    attacker_player,
                                    unit_id,
                                    defender_player,
                                    defender_id,
                                    was_commander,
                                    turn_number,
                                    target_x,
                                    target_y,
                                    damage,
                                    timestamp
                                );
                                world.write_model(@kill_event);
                                
                                total_kills += 1;
                                
                                // Emit event
                                world.emit_event(
                                    @UnitKilled {
                                        game_id,
                                        victim: defender_player,
                                        victim_unit_id: defender_id,
                                        killer: attacker_player,
                                        killer_unit_id: unit_id,
                                        was_commander
                                    }
                                );
                            }
                            
                            world.write_model(@combat_result);
                            
                            // Emit combat event
                            world.emit_event(
                                @CombatOccurred {
                                    game_id,
                                    attacker: attacker_player,
                                    attacker_unit_id: unit_id,
                                    defender: defender_player,
                                    defender_unit_id: defender_id,
                                    damage,
                                    defender_killed: was_killed
                                }
                            );
                            
                            combat_id += 1;
                        }
                    }
                }
                
                unit_id += 1;
            };
            
            combat_id
        }

        fn apply_terrain_effects(
            ref self: ContractState,
            game_id: u32,
            player1: ContractAddress,
            player2: ContractAddress,
            ref player1_data: Player,
            ref player2_data: Player,
            ref turn_summary: TurnSummary,
        ) {
            Self::apply_player_terrain_effects(
                ref self, game_id, player1, ref player1_data, ref turn_summary, true
            );
            Self::apply_player_terrain_effects(
                ref self, game_id, player2, ref player2_data, ref turn_summary, false
            );
        }

        fn apply_player_terrain_effects(
            ref self: ContractState,
            game_id: u32,
            player: ContractAddress,
            ref player_data: Player,
            ref turn_summary: TurnSummary,
            is_player1: bool,
        ) {
            let mut world = self.world_default();

            let mut unit_id: u8 = 0;
            loop {
                if unit_id >= 3 {
                    break;
                }
                
                let mut unit: Unit = world.read_model((game_id, player, unit_id));
                
                if unit.is_alive {
                    let tile: Tile = world.read_model((game_id, unit.position_x, unit.position_y));
                    
                    // Apply lava damage
                    let lava_damage = tile.get_tile_effect_damage();
                    if lava_damage > 0 {
                        let actual_damage = unit.take_damage(lava_damage);
                        player_data.record_damage_taken(actual_damage.into());
                        turn_summary.record_combat(actual_damage, !unit.is_alive);
                        
                        if !unit.is_alive {
                            let was_commander = unit.is_commander();
                            player_data.unit_killed(was_commander);
                            turn_summary.record_unit_death(is_player1);
                            
                            // Clear tile
                            let mut tile_mut: Tile = world.read_model((game_id, unit.position_x, unit.position_y));
                            tile_mut.vacate();
                            world.write_model(@tile_mut);
                        }
                    }
                    
                    // Apply healing
                    let heal_amount = tile.get_tile_effect_heal();
                    if heal_amount > 0 {
                        unit.heal(heal_amount);
                    }
                    
                    world.write_model(@unit);
                }
                
                unit_id += 1;
            };
        }

        fn reset_all_units(
            ref self: ContractState,
            game_id: u32,
            player1: ContractAddress,
            player2: ContractAddress,
        ) {
            Self::reset_player_units(ref self, game_id, player1);
            Self::reset_player_units(ref self, game_id, player2);
        }

        fn reset_player_units(
            ref self: ContractState,
            game_id: u32,
            player: ContractAddress,
        ) {
            let mut world = self.world_default();

            let mut unit_id: u8 = 0;
            loop {
                if unit_id >= 3 {
                    break;
                }
                
                let mut unit: Unit = world.read_model((game_id, player, unit_id));
                unit.reset_turn_actions();
                world.write_model(@unit);
                
                unit_id += 1;
            };
        }

        fn calculate_total_health(
            ref self: ContractState,
            game_id: u32,
            player: ContractAddress,
        ) -> u16 {
            let mut world = self.world_default();

            let mut total: u16 = 0;
            let mut unit_id: u8 = 0;
            
            loop {
                if unit_id >= 3 {
                    break;
                }
                
                let unit: Unit = world.read_model((game_id, player, unit_id));
                if unit.is_alive {
                    total += unit.health.into();
                }
                
                unit_id += 1;
            };
            
            total
        }

        fn find_unit_at_position(
            ref self: ContractState,
            game_id: u32,
            player: ContractAddress,
            x: u8,
            y: u8,
        ) -> Option<u8> {
            let mut world = self.world_default();

            let mut unit_id: u8 = 0;
            loop {
                if unit_id >= 3 {
                    break Option::None;
                }
                
                let unit: Unit = world.read_model((game_id, player, unit_id));
                if unit.is_alive && unit.is_at_position(x, y) {
                    break Option::Some(unit_id);
                }
                
                unit_id += 1;
            }
        }

        fn check_game_end(
            ref self: ContractState,
            game_id: u32,
            ref game: Game,
            player1: @Player,
            player2: @Player,
            timestamp: u64,
        ) -> bool {
            let mut world = self.world_default();

            // Check if either player lost their commander or all units
            let p1_defeated = player1.is_defeated();
            let p2_defeated = player2.is_defeated();
            
            if p1_defeated || p2_defeated {
                let winner = if p1_defeated { game.player2 } else { game.player1 };
                let loser = if p1_defeated { game.player1 } else { game.player2 };
                let reason = if p1_defeated {
                    'Commander killed or no units'
                } else {
                    'Commander killed or no units'
                };
                
                game.end_game(winner, timestamp);
                world.write_model(@game);
                
                world.emit_event(
                    @GameEnded {
                        game_id,
                        winner,
                        loser,
                        reason,
                        timestamp
                    }
                );
                
                return true;
            }
            
            false
        }
    }
}