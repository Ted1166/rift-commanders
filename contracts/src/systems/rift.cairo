use starknet::ContractAddress;
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
use rift_commanders::models::game::{Game, GameTrait};
use rift_commanders::models::battlefield::{
    Battlefield, BattlefieldTrait, Tile, TileTrait, 
    RiftEvent, RiftEventTrait, RiftPattern, TileType
};
use rift_commanders::models::moves::{MoveHistory, MoveHistoryTrait};

#[starknet::interface]
trait IRift<T> {
    fn trigger_rift(ref self: T, game_id: u32);
    fn manual_rift_trigger(
        ref self: T,
        game_id: u32,
        pattern: RiftPattern,
    );
}

#[dojo::contract]
mod rift {
    use super::{IRift, ContractAddress};
    use starknet::{get_caller_address, get_block_timestamp};
    use dojo::model::{ModelStorage, ModelValueStorage};
    use dojo::event::EventStorage;
    
    use rift_commanders::models::game::{Game, GameTrait};
    use rift_commanders::models::battlefield::{
        Battlefield, BattlefieldTrait, Tile, TileTrait,
        RiftEvent, RiftEventTrait, RiftPattern, TileType
    };
    use rift_commanders::models::moves::{MoveHistory, MoveHistoryTrait};

    // Events
    #[derive(Copy, Drop, Serde, Debug)]
    #[dojo::event]
    pub struct RiftTriggered {
        #[key]
        pub game_id: u32,
        pub turn_number: u8,
        pub pattern: RiftPattern,
        pub tiles_affected: u8,
        pub intensity: u8,
        pub timestamp: u64,
    }

    #[derive(Copy, Drop, Serde, Debug)]
    #[dojo::event]
    pub struct TilesSwapped {
        #[key]
        pub game_id: u32,
        pub tile1_x: u8,
        pub tile1_y: u8,
        pub tile2_x: u8,
        pub tile2_y: u8,
        pub tile1_type: TileType,
        pub tile2_type: TileType,
    }

    #[abi(embed_v0)]
    impl RiftImpl of IRift<ContractState> {
        fn trigger_rift(ref self: ContractState, game_id: u32) {
            let mut world = self.world_default();
            let timestamp = get_block_timestamp();
            
            // Get game and battlefield
            let game: Game = world.read_model(game_id);
            let mut battlefield: Battlefield = world.read_model(game_id);
            
            // Check if rift should trigger
            if !battlefield.should_trigger_rift(game.current_turn) {
                return;
            }
            
            // Determine rift pattern based on turn number
            let pattern = InternalImpl::determine_rift_pattern(game.current_turn, game.rift_seed);
            
            // Calculate intensity (increases with turn number)
            let intensity = InternalImpl::calculate_rift_intensity(game.current_turn);
            
            // Create rift event
            let mut rift_event = RiftEventTrait::new(
                game_id,
                game.current_turn,
                game.rift_seed,
                pattern,
                timestamp
            );
            
            // Execute rift based on pattern
            match pattern {
                RiftPattern::Random => {
                    InternalImpl::execute_random_rift(
                        ref self,
                        game_id,
                        game.rift_seed,
                        intensity,
                        ref rift_event
                    );
                },
                RiftPattern::Rotation => {
                    InternalImpl::execute_rotation_rift(
                        ref self,
                        game_id,
                        ref rift_event
                    );
                },
                RiftPattern::Mirror => {
                    InternalImpl::execute_mirror_rift(
                        ref self,
                        game_id,
                        ref rift_event
                    );
                },
                RiftPattern::Chaos => {
                    InternalImpl::execute_chaos_rift(
                        ref self,
                        game_id,
                        game.rift_seed,
                        ref rift_event
                    );
                },
                RiftPattern::Targeted => {
                    InternalImpl::execute_targeted_rift(
                        ref self,
                        game_id,
                        game.rift_seed,
                        ref rift_event
                    );
                },
            }
            
            // Update battlefield
            battlefield.trigger_rift(game.current_turn, intensity);
            world.write_model(@battlefield);
            
            // Update move history
            let mut move_history: MoveHistory = world.read_model((game_id, game.current_turn));
            move_history.trigger_rift();
            world.write_model(@move_history);
            
            // Save rift event
            world.write_model(@rift_event);
            
            // Emit event
            world.emit_event(
                @RiftTriggered {
                    game_id,
                    turn_number: game.current_turn,
                    pattern,
                    tiles_affected: rift_event.tiles_swapped * 2, // Each swap affects 2 tiles
                    intensity,
                    timestamp
                }
            );
        }

        fn manual_rift_trigger(
            ref self: ContractState,
            game_id: u32,
            pattern: RiftPattern,
        ) {
            let mut world = self.world_default();
            let timestamp = get_block_timestamp();
            
            // Get game
            let game: Game = world.read_model(game_id);
            let mut battlefield: Battlefield = world.read_model(game_id);
            
            // Create rift event
            let mut rift_event = RiftEventTrait::new(
                game_id,
                game.current_turn,
                game.rift_seed,
                pattern,
                timestamp
            );
            
            // Execute specified pattern
            match pattern {
                RiftPattern::Random => {
                    InternalImpl::execute_random_rift(
                        ref self,
                        game_id,
                        game.rift_seed,
                        50,
                        ref rift_event
                    );
                },
                RiftPattern::Rotation => {
                    InternalImpl::execute_rotation_rift(ref self, game_id, ref rift_event);
                },
                RiftPattern::Mirror => {
                    InternalImpl::execute_mirror_rift(ref self, game_id, ref rift_event);
                },
                RiftPattern::Chaos => {
                    InternalImpl::execute_chaos_rift(ref self, game_id, game.rift_seed, ref rift_event);
                },
                RiftPattern::Targeted => {
                    InternalImpl::execute_targeted_rift(ref self, game_id, game.rift_seed, ref rift_event);
                },
            }
            
            // Update battlefield
            battlefield.trigger_rift(game.current_turn, 75);
            world.write_model(@battlefield);
            world.write_model(@rift_event);
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"rift_commanders")
        }

        fn determine_rift_pattern(turn: u8, seed: u64) -> RiftPattern {
            // Use turn and seed to pseudo-randomly select pattern
            let pattern_value = (seed % 5 + turn.into()) % 5;
            
            if pattern_value == 0 {
                RiftPattern::Random
            } else if pattern_value == 1 {
                RiftPattern::Rotation
            } else if pattern_value == 2 {
                RiftPattern::Mirror
            } else if pattern_value == 3 {
                RiftPattern::Chaos
            } else {
                RiftPattern::Targeted
            }
        }

        fn calculate_rift_intensity(turn: u8) -> u8 {
            // Intensity increases with turn number
            let base_intensity = 30_u8;
            let turn_bonus = turn * 5;
            
            let total = base_intensity + turn_bonus;
            if total > 100 {
                100
            } else {
                total
            }
        }

        fn execute_random_rift(
            ref self: ContractState,
            game_id: u32,
            seed: u64,
            intensity: u8,
            ref rift_event: RiftEvent,
        ) {
            // Swap 2-4 random tile pairs based on intensity
            let swap_count = if intensity > 70 {
                4_u8
            } else if intensity > 40 {
                3_u8
            } else {
                2_u8
            };
            
            let mut swaps_done: u8 = 0;
            let mut current_seed = seed;
            
            loop {
                if swaps_done >= swap_count {
                    break;
                }
                
                // Generate pseudo-random coordinates - FIXED TYPE CASTING
                let tile1_x: u8 = (current_seed % 5).try_into().unwrap();
                current_seed = (current_seed * 1103515245 + 12345) % 2147483648;
                
                let tile1_y: u8 = (current_seed % 5).try_into().unwrap();
                current_seed = (current_seed * 1103515245 + 12345) % 2147483648;
                
                let tile2_x: u8 = (current_seed % 5).try_into().unwrap();
                current_seed = (current_seed * 1103515245 + 12345) % 2147483648;
                
                let tile2_y: u8 = (current_seed % 5).try_into().unwrap();
                current_seed = (current_seed * 1103515245 + 12345) % 2147483648;
                
                // Don't swap same tile with itself
                if tile1_x != tile2_x || tile1_y != tile2_y {
                    InternalImpl::swap_tiles(
                        ref self,
                        game_id,
                        tile1_x,
                        tile1_y,
                        tile2_x,
                        tile2_y,
                        ref rift_event
                    );
                    swaps_done += 1;
                }
            };
        }

        fn execute_rotation_rift(
            ref self: ContractState,
            game_id: u32,
            ref rift_event: RiftEvent,
        ) {
            // Rotate outer ring of tiles clockwise
            // Corner swaps: (0,0) -> (4,0) -> (4,4) -> (0,4) -> (0,0)
            InternalImpl::swap_tiles(ref self, game_id, 0, 0, 4, 0, ref rift_event);
            InternalImpl::swap_tiles(ref self, game_id, 4, 0, 4, 4, ref rift_event);
            InternalImpl::swap_tiles(ref self, game_id, 4, 4, 0, 4, ref rift_event);
            
            // Edge swaps
            InternalImpl::swap_tiles(ref self, game_id, 1, 0, 4, 1, ref rift_event);
            InternalImpl::swap_tiles(ref self, game_id, 2, 0, 4, 2, ref rift_event);
            InternalImpl::swap_tiles(ref self, game_id, 3, 0, 4, 3, ref rift_event);
        }

        fn execute_mirror_rift(
            ref self: ContractState,
            game_id: u32,
            ref rift_event: RiftEvent,
        ) {
            // Mirror left side to right side
            let mut y: u8 = 0;
            loop {
                if y >= 5 {
                    break;
                }
                
                // Swap left column with right column
                InternalImpl::swap_tiles(ref self, game_id, 0, y, 4, y, ref rift_event);
                InternalImpl::swap_tiles(ref self, game_id, 1, y, 3, y, ref rift_event);
                
                y += 1;
            };
        }

        fn execute_chaos_rift(
            ref self: ContractState,
            game_id: u32,
            seed: u64,
            ref rift_event: RiftEvent,
        ) {
            // Maximum chaos - swap 8 random pairs
            let mut swaps_done: u8 = 0;
            let mut current_seed = seed;
            
            loop {
                if swaps_done >= 8 {
                    break;
                }
                
                // FIXED TYPE CASTING
                let tile1_x: u8 = (current_seed % 5).try_into().unwrap();
                current_seed = (current_seed * 1103515245 + 12345) % 2147483648;
                
                let tile1_y: u8 = (current_seed % 5).try_into().unwrap();
                current_seed = (current_seed * 1103515245 + 12345) % 2147483648;
                
                let tile2_x: u8 = (current_seed % 5).try_into().unwrap();
                current_seed = (current_seed * 1103515245 + 12345) % 2147483648;
                
                let tile2_y: u8 = (current_seed % 5).try_into().unwrap();
                current_seed = (current_seed * 1103515245 + 12345) % 2147483648;
                
                if tile1_x != tile2_x || tile1_y != tile2_y {
                    InternalImpl::swap_tiles(
                        ref self,
                        game_id,
                        tile1_x,
                        tile1_y,
                        tile2_x,
                        tile2_y,
                        ref rift_event
                    );
                    swaps_done += 1;
                }
            };
        }

        fn execute_targeted_rift(
            ref self: ContractState,
            game_id: u32,
            seed: u64,
            ref rift_event: RiftEvent,
        ) {
            let mut world = self.world_default();

            // Find occupied tiles and swap them with random tiles
            let mut units_found: u8 = 0;
            let mut current_seed = seed;
            
            let mut x: u8 = 0;
            loop {
                if x >= 5 {
                    break;
                }
                
                let mut y: u8 = 0;
                loop {
                    if y >= 5 {
                        break;
                    }
                    
                    let tile: Tile = world.read_model((game_id, x, y));
                    
                    if tile.is_occupied && units_found < 3 {
                        // Swap this occupied tile with a random tile - FIXED TYPE CASTING
                        let target_x: u8 = (current_seed % 5).try_into().unwrap();
                        current_seed = (current_seed * 1103515245 + 12345) % 2147483648;
                        
                        let target_y: u8 = (current_seed % 5).try_into().unwrap();
                        current_seed = (current_seed * 1103515245 + 12345) % 2147483648;
                        
                        if x != target_x || y != target_y {
                            InternalImpl::swap_tiles(ref self, game_id, x, y, target_x, target_y, ref rift_event);
                            units_found += 1;
                            rift_event.units_affected += 1;
                        }
                    }
                    
                    y += 1;
                };
                
                x += 1;
            };
        }

        fn swap_tiles(
            ref self: ContractState,
            game_id: u32,
            x1: u8,
            y1: u8,
            x2: u8,
            y2: u8,
            ref rift_event: RiftEvent,
        ) {
            let mut world = self.world_default();

            // Get both tiles
            let mut tile1: Tile = world.read_model((game_id, x1, y1));
            let mut tile2: Tile = world.read_model((game_id, x2, y2));
            
            // Store original types for event
            let tile1_type = tile1.tile_type;
            let tile2_type = tile2.tile_type;
            
            // Swap tiles (only terrain types, not units)
            tile1.swap_with(ref tile2);
            
            // Save tiles
            world.write_model(@tile1);
            world.write_model(@tile2);
            
            // Record swap in rift event
            rift_event.record_swap(0); // Units don't move with terrain
            
            // Emit swap event
            world.emit_event(
                @TilesSwapped {
                    game_id,
                    tile1_x: x1,
                    tile1_y: y1,
                    tile2_x: x2,
                    tile2_y: y2,
                    tile1_type,
                    tile2_type
                }
            );
        }

        fn count_units_on_tiles(
            ref self: ContractState,
            game_id: u32,
            x1: u8,
            y1: u8,
            x2: u8,
            y2: u8,
        ) -> u8 {
            let mut world = self.world_default();

            let tile1: Tile = world.read_model((game_id, x1, y1));
            let tile2: Tile = world.read_model((game_id, x2, y2));
            
            let mut count: u8 = 0;
            if tile1.is_occupied {
                count += 1;
            }
            if tile2.is_occupied {
                count += 1;
            }
            
            count
        }
    }
}