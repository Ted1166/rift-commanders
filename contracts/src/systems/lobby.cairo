use starknet::ContractAddress;
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
use rift_commanders::models::game::{Game, GameTrait, GamePhase};
use rift_commanders::models::player::{Player, PlayerTrait};
use rift_commanders::models::unit::{Unit, UnitImpl, UnitType};
use rift_commanders::models::battlefield::{Battlefield, BattlefieldImpl, Tile, TileImpl, TileType};

#[starknet::interface]
trait ILobby<T> {
    fn create_game(ref self: T) -> u32;
    fn join_game(ref self: T, game_id: u32);
    fn start_game(ref self: T, game_id: u32);
    fn place_units(
        ref self: T,
        game_id: u32,
        commander_x: u8,
        commander_y: u8,
        warrior_x: u8,
        warrior_y: u8,
        archer_x: u8,
        archer_y: u8,
    );
}

#[dojo::contract]
mod lobby {
    use super::{ILobby, ContractAddress};
    use starknet::{get_caller_address, get_block_timestamp};
    use dojo::model::{ModelStorage, ModelValueStorage};
    use dojo::event::EventStorage;
    
    use rift_commanders::models::game::{Game, GameTrait, GamePhase};
    use rift_commanders::models::player::{Player, PlayerTrait};
    use rift_commanders::models::unit::{Unit, UnitImpl, UnitType};
    use rift_commanders::models::battlefield::{Battlefield, BattlefieldImpl, Tile, TileImpl, TileType};

    // Events
    #[derive(Copy, Drop, Serde, Debug)]
    #[dojo::event]
    pub struct GameCreated {
        #[key]
        pub game_id: u32,
        pub creator: ContractAddress,
        pub timestamp: u64,
    }

    #[derive(Copy, Drop, Serde, Debug)]
    #[dojo::event]
    pub struct PlayerJoined {
        #[key]
        pub game_id: u32,
        pub player: ContractAddress,
        pub player_number: u8,
    }

    #[derive(Copy, Drop, Serde, Debug)]
    #[dojo::event]
    pub struct GameStarted {
        #[key]
        pub game_id: u32,
        pub player1: ContractAddress,
        pub player2: ContractAddress,
        pub timestamp: u64,
    }

    #[derive(Copy, Drop, Serde, Debug)]
    #[dojo::event]
    pub struct UnitsPlaced {
        #[key]
        pub game_id: u32,
        pub player: ContractAddress,
    }

    #[abi(embed_v0)]
    impl LobbyImpl of ILobby<ContractState> {
        fn create_game(ref self: ContractState) -> u32 {
            let mut world = self.world_default();
            let caller = get_caller_address();
            let timestamp = get_block_timestamp();
            
            // Generate game ID from timestamp and caller
            let game_id: u32 = (timestamp % 1000000).try_into().unwrap();
            
            // Create game
            let game = GameTrait::new(game_id, caller, timestamp);
            world.write_model(@game);
            
            // Create player 1
            let player1 = PlayerTrait::new(game_id, caller, 1);
            world.write_model(@player1);
            
            // Initialize battlefield
            let battlefield = BattlefieldImpl::new(game_id);
            world.write_model(@battlefield);
            
            // Initialize all tiles as Normal
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
                    
                    let tile = TileImpl::new(game_id, x, y, TileType::Normal);
                    world.write_model(@tile);
                    
                    y += 1;
                };
                
                x += 1;
            };
            
            // Emit event
            world.emit_event(@GameCreated { game_id, creator: caller, timestamp });
            
            game_id
        }

        fn join_game(ref self: ContractState, game_id: u32) {
            let mut world = self.world_default();
            let caller = get_caller_address();
            
            // Get game
            let mut game: Game = world.read_model(game_id);
            
            // Validate game state
            assert(game.current_phase == GamePhase::Lobby, 'Game not in lobby phase');
            assert(!game.is_full(), 'Game is full');
            assert(caller != game.player1, 'Already in game');
            
            // Add player 2
            assert(game.add_player(caller), 'Failed to add player');
            world.write_model(@game);
            
            // Create player 2
            let player2 = PlayerTrait::new(game_id, caller, 2);
            world.write_model(@player2);
            
            // Emit event
            world.emit_event(@PlayerJoined { game_id, player: caller, player_number: 2 });
        }

        fn start_game(ref self: ContractState, game_id: u32) {
            let mut world = self.world_default();
            let caller = get_caller_address();
            let timestamp = get_block_timestamp();
            
            // Get game
            let mut game: Game = world.read_model(game_id);
            
            // Validate
            assert(game.is_creator(caller), 'Only creator can start');
            assert(game.is_full(), 'Need 2 players');
            assert(game.current_phase == GamePhase::Lobby, 'Game already started');
            
            // Start game
            assert(game.start_game(timestamp), 'Failed to start game');
            world.write_model(@game);
            
            // Emit event
            world.emit_event(
                @GameStarted {
                    game_id,
                    player1: game.player1,
                    player2: game.player2,
                    timestamp
                }
            );
        }

        fn place_units(
            ref self: ContractState,
            game_id: u32,
            commander_x: u8,
            commander_y: u8,
            warrior_x: u8,
            warrior_y: u8,
            archer_x: u8,
            archer_y: u8,
        ) {
            let mut world = self.world_default();
            let caller = get_caller_address();
            
            // Get game and validate
            let mut game: Game = world.read_model(game_id);
            assert(game.is_player(caller), 'Not a player in this game');
            assert(game.current_phase == GamePhase::Setup, 'Not in setup phase');
            
            // Get player
            let mut player: Player = world.read_model((game_id, caller));
            assert(!player.setup_complete, 'Units already placed');
            
            // Validate positions are in bounds
            assert(commander_x < 5 && commander_y < 5, 'Commander position invalid');
            assert(warrior_x < 5 && warrior_y < 5, 'Warrior position invalid');
            assert(archer_x < 5 && archer_y < 5, 'Archer position invalid');
            
            // Validate no position overlap
            assert(
                !(commander_x == warrior_x && commander_y == warrior_y),
                'Units cannot overlap'
            );
            assert(
                !(commander_x == archer_x && commander_y == archer_y),
                'Units cannot overlap'
            );
            assert(
                !(warrior_x == archer_x && warrior_y == archer_y),
                'Units cannot overlap'
            );
            
            // Validate starting zones (player 1 bottom half, player 2 top half)
            if player.player_number == 1 {
                assert(commander_y >= 3, 'Must place in your zone');
                assert(warrior_y >= 3, 'Must place in your zone');
                assert(archer_y >= 3, 'Must place in your zone');
            } else {
                assert(commander_y <= 1, 'Must place in your zone');
                assert(warrior_y <= 1, 'Must place in your zone');
                assert(archer_y <= 1, 'Must place in your zone');
            }
            
            // Create units
            let commander = UnitImpl::new(
                game_id, caller, 0, UnitType::Commander, commander_x, commander_y
            );
            let warrior = UnitImpl::new(
                game_id, caller, 1, UnitType::Warrior, warrior_x, warrior_y
            );
            let archer = UnitImpl::new(
                game_id, caller, 2, UnitType::Archer, archer_x, archer_y
            );
            
            world.write_model(@commander);
            world.write_model(@warrior);
            world.write_model(@archer);
            
            // Update tiles as occupied
            let mut tile_commander: Tile = world.read_model((game_id, commander_x, commander_y));
            tile_commander.occupy(caller, 0);
            world.write_model(@tile_commander);
            
            let mut tile_warrior: Tile = world.read_model((game_id, warrior_x, warrior_y));
            tile_warrior.occupy(caller, 1);
            world.write_model(@tile_warrior);
            
            let mut tile_archer: Tile = world.read_model((game_id, archer_x, archer_y));
            tile_archer.occupy(caller, 2);
            world.write_model(@tile_archer);
            
            // Mark player setup complete
            player.complete_setup();
            world.write_model(@player);
            
            // Check if both players are ready
            let player1: Player = world.read_model((game_id, game.player1));
            let player2: Player = world.read_model((game_id, game.player2));
            
            if player1.setup_complete && player2.setup_complete {
                // Both players ready - advance to planning phase
                game.advance_to_planning();
                world.write_model(@game);
            }
            
            // Emit event
            world.emit_event(@UnitsPlaced { game_id, player: caller });
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"rift_commanders")
        }
    }
}