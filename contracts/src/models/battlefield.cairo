use starknet::ContractAddress;

// Battlefield grid state and terrain
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Battlefield {
    #[key]
    pub game_id: u32,
    pub grid_size: u8,  // 5x5 = 5
    pub last_rift_turn: u8,
    pub rift_intensity: u8,  // How chaotic the rift was (0-100)
    pub total_rifts_triggered: u8,
    pub hazard_tiles_count: u8,
}

// Individual tile state on the battlefield
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Tile {
    #[key]
    pub game_id: u32,
    #[key]
    pub x: u8,
    #[key]
    pub y: u8,
    pub tile_type: TileType,
    pub is_occupied: bool,
    pub occupant_owner: ContractAddress,
    pub occupant_unit_id: u8,
    pub was_rift_swapped: bool,  // Was this tile affected by last rift?
    pub swap_target_x: u8,  // If swapped, where did it swap with?
    pub swap_target_y: u8,
}

// Rift event tracking
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct RiftEvent {
    #[key]
    pub game_id: u32,
    #[key]
    pub turn_number: u8,
    pub rift_seed: u64,  // Random seed used for this rift
    pub tiles_swapped: u8,  // How many tile pairs swapped
    pub units_affected: u8,  // How many units were on swapped tiles
    pub swap_pattern: RiftPattern,
    pub triggered_at: u64,
}

// Tile types with different effects
#[derive(Serde, Copy, Drop, Introspect, PartialEq, Debug, DojoStore, Default)]
pub enum TileType {
    #[default]
    Normal,     // Standard tile, no effects
    Lava,       // Deals damage to units ending turn here
    Wall,       // Impassable terrain
    Portal,     // Teleports unit to paired portal
    Boost,      // Increases attack power temporarily
    Heal,       // Regenerates health slowly
}

// Rift swap patterns
#[derive(Serde, Copy, Drop, Introspect, PartialEq, Debug, DojoStore, Default)]
pub enum RiftPattern {
    #[default]
    Random,     // Completely random tile swaps
    Rotation,   // Rotates sections of the battlefield
    Mirror,     // Mirrors one side to the other
    Chaos,      // Multiple random swaps
    Targeted,   // Swaps tiles with units on them
}

#[generate_trait]
pub impl BattlefieldImpl of BattlefieldTrait {
    #[inline(always)]
    fn new(game_id: u32) -> Battlefield {
        Battlefield {
            game_id,
            grid_size: 5,
            last_rift_turn: 0,
            rift_intensity: 0,
            total_rifts_triggered: 0,
            hazard_tiles_count: 0,
        }
    }

    #[inline(always)]
    fn trigger_rift(ref self: Battlefield, turn_number: u8, intensity: u8) {
        self.last_rift_turn = turn_number;
        self.rift_intensity = intensity;
        self.total_rifts_triggered += 1;
    }

    #[inline(always)]
    fn should_trigger_rift(self: @Battlefield, turn_number: u8) -> bool {
        // Rift triggers every 2-3 turns
        if *self.total_rifts_triggered == 0 {
            return turn_number >= 2;  // First rift at turn 2
        }
        
        let turns_since_last = turn_number - *self.last_rift_turn;
        turns_since_last >= 2
    }

    #[inline(always)]
    fn add_hazard_tile(ref self: Battlefield) {
        self.hazard_tiles_count += 1;
    }

    #[inline(always)]
    fn remove_hazard_tile(ref self: Battlefield) {
        if self.hazard_tiles_count > 0 {
            self.hazard_tiles_count -= 1;
        }
    }

    #[inline(always)]
    fn get_total_tiles(self: @Battlefield) -> u8 {
        let grid: u8 = *self.grid_size;
        grid * grid
    }

    #[inline(always)]
    fn is_hazardous(self: @Battlefield) -> bool {
        *self.hazard_tiles_count > 5  // More than 5 hazard tiles = dangerous battlefield
    }

    #[inline(always)]
    fn get_rift_frequency(self: @Battlefield) -> u8 {
        if *self.total_rifts_triggered == 0 {
            return 0;
        }
        
        // Fixed: Dereference before division
        let last_turn: u8 = *self.last_rift_turn;
        let total_rifts: u8 = *self.total_rifts_triggered;
        
        last_turn / total_rifts
    }
}

#[generate_trait]
pub impl TileImpl of TileTrait {
    #[inline(always)]
    fn new(game_id: u32, x: u8, y: u8, tile_type: TileType) -> Tile {
        Tile {
            game_id,
            x,
            y,
            tile_type,
            is_occupied: false,
            occupant_owner: starknet::contract_address_const::<0>(),
            occupant_unit_id: 255,  // 255 = no unit
            was_rift_swapped: false,
            swap_target_x: 0,
            swap_target_y: 0,
        }
    }

    #[inline(always)]
    fn occupy(ref self: Tile, owner: ContractAddress, unit_id: u8) -> bool {
        if self.is_occupied {
            return false;  // Already occupied
        }
        
        if self.tile_type == TileType::Wall {
            return false;  // Can't occupy walls
        }
        
        self.is_occupied = true;
        self.occupant_owner = owner;
        self.occupant_unit_id = unit_id;
        true
    }

    #[inline(always)]
    fn vacate(ref self: Tile) {
        self.is_occupied = false;
        self.occupant_owner = starknet::contract_address_const::<0>();
        self.occupant_unit_id = 255;
    }

    #[inline(always)]
    fn swap_with(ref self: Tile, ref other: Tile) {
        // Swap tile types
        let temp_type = self.tile_type;
        self.tile_type = other.tile_type;
        other.tile_type = temp_type;
        
        // Mark as swapped
        self.was_rift_swapped = true;
        other.was_rift_swapped = true;
        
        // Record swap targets
        self.swap_target_x = other.x;
        self.swap_target_y = other.y;
        other.swap_target_x = self.x;
        other.swap_target_y = self.y;
        
        // Note: Units don't move with tiles, just terrain swaps
    }

    #[inline(always)]
    fn clear_rift_state(ref self: Tile) {
        self.was_rift_swapped = false;
        self.swap_target_x = 0;
        self.swap_target_y = 0;
    }

    #[inline(always)]
    fn is_walkable(self: @Tile) -> bool {
        *self.tile_type != TileType::Wall
    }

    #[inline(always)]
    fn is_hazardous(self: @Tile) -> bool {
        *self.tile_type == TileType::Lava
    }

    #[inline(always)]
    fn is_beneficial(self: @Tile) -> bool {
        *self.tile_type == TileType::Heal || *self.tile_type == TileType::Boost
    }

    #[inline(always)]
    fn get_tile_effect_damage(self: @Tile) -> u8 {
        match *self.tile_type {
            TileType::Lava => 10,  // 10 damage per turn on lava
            _ => 0,
        }
    }

    #[inline(always)]
    fn get_tile_effect_heal(self: @Tile) -> u8 {
        match *self.tile_type {
            TileType::Heal => 5,  // 5 HP regen per turn
            _ => 0,
        }
    }

    #[inline(always)]
    fn get_tile_attack_bonus(self: @Tile) -> u8 {
        match *self.tile_type {
            TileType::Boost => 5,  // +5 attack on boost tiles
            _ => 0,
        }
    }

    #[inline(always)]
    fn is_occupied_by(self: @Tile, owner: ContractAddress, unit_id: u8) -> bool {
        *self.is_occupied && *self.occupant_owner == owner && *self.occupant_unit_id == unit_id
    }

    #[inline(always)]
    fn get_position(self: @Tile) -> (u8, u8) {
        (*self.x, *self.y)
    }

    #[inline(always)]
    fn is_corner_tile(self: @Tile) -> bool {
        // Check if tile is in one of the four corners (0,0), (4,0), (0,4), (4,4)
        (*self.x == 0 || *self.x == 4) && (*self.y == 0 || *self.y == 4)
    }

    #[inline(always)]
    fn is_center_tile(self: @Tile) -> bool {
        *self.x == 2 && *self.y == 2  // Middle of 5x5 grid
    }

    #[inline(always)]
    fn is_edge_tile(self: @Tile) -> bool {
        *self.x == 0 || *self.x == 4 || *self.y == 0 || *self.y == 4
    }

    #[inline(always)]
    fn distance_to_center(self: @Tile) -> u8 {
        let center_x = 2_u8;
        let center_y = 2_u8;
        
        let dx = if *self.x > center_x { *self.x - center_x } else { center_x - *self.x };
        let dy = if *self.y > center_y { *self.y - center_y } else { center_y - *self.y };
        
        dx + dy
    }

    #[inline(always)]
    fn is_adjacent_to(self: @Tile, x: u8, y: u8) -> bool {
        let dx = if *self.x > x { *self.x - x } else { x - *self.x };
        let dy = if *self.y > y { *self.y - y } else { y - *self.y };
        
        (dx + dy) == 1
    }
}

#[generate_trait]
pub impl RiftEventImpl of RiftEventTrait {
    #[inline(always)]
    fn new(
        game_id: u32,
        turn_number: u8,
        rift_seed: u64,
        swap_pattern: RiftPattern,
        triggered_at: u64,
    ) -> RiftEvent {
        RiftEvent {
            game_id,
            turn_number,
            rift_seed,
            tiles_swapped: 0,
            units_affected: 0,
            swap_pattern,
            triggered_at,
        }
    }

    #[inline(always)]
    fn record_swap(ref self: RiftEvent, units_on_tiles: u8) {
        self.tiles_swapped += 1;
        self.units_affected += units_on_tiles;
    }

    #[inline(always)]
    fn get_chaos_level(self: @RiftEvent) -> u8 {
        // Calculate how chaotic the rift was (0-100)
        let base_chaos = *self.tiles_swapped * 10;
        let unit_chaos = *self.units_affected * 15;
        
        let total = base_chaos + unit_chaos;
        if total > 100 {
            100
        } else {
            total
        }
    }

    #[inline(always)]
    fn was_destructive(self: @RiftEvent) -> bool {
        *self.units_affected >= 4  // Affected 4+ units = destructive
    }

    #[inline(always)]
    fn was_minor(self: @RiftEvent) -> bool {
        *self.tiles_swapped <= 2  // Only 2 or fewer swaps = minor rift
    }

    #[inline(always)]
    fn get_pattern_description(self: @RiftEvent) -> felt252 {
        match *self.swap_pattern {
            RiftPattern::Random => 'Random chaos erupted',
            RiftPattern::Rotation => 'Reality rotated',
            RiftPattern::Mirror => 'Battlefield mirrored',
            RiftPattern::Chaos => 'Total chaos unleashed',
            RiftPattern::Targeted => 'Strategic rift struck',
        }
    }
}

// Helper functions for battlefield calculations
#[generate_trait]
pub impl BattlefieldCalculationsImpl of BattlefieldCalculationsTrait {
    #[inline(always)]
    fn calculate_tile_index(x: u8, y: u8, grid_size: u8) -> u8 {
        y * grid_size + x
    }

    #[inline(always)]
    fn get_coordinates_from_index(index: u8, grid_size: u8) -> (u8, u8) {
        let x = index % grid_size;
        let y = index / grid_size;
        (x, y)
    }

    #[inline(always)]
    fn is_valid_position(x: u8, y: u8, grid_size: u8) -> bool {
        x < grid_size && y < grid_size
    }

    #[inline(always)]
    fn get_surrounding_tiles(x: u8, y: u8, grid_size: u8) -> Array<(u8, u8)> {
        let mut surrounding = ArrayTrait::new();
        
        // North
        if y > 0 {
            surrounding.append((x, y - 1));
        }
        
        // South
        if y < grid_size - 1 {
            surrounding.append((x, y + 1));
        }
        
        // West
        if x > 0 {
            surrounding.append((x - 1, y));
        }
        
        // East
        if x < grid_size - 1 {
            surrounding.append((x + 1, y));
        }
        
        surrounding
    }

    #[inline(always)]
    fn calculate_strategic_value(x: u8, y: u8) -> u8 {
        // Center tiles are more valuable
        let center_x = 2_u8;
        let center_y = 2_u8;
        
        let dx = if x > center_x { x - center_x } else { center_x - x };
        let dy = if y > center_y { y - center_y } else { center_y - y };
        let distance = dx + dy;
        
        // Closer to center = higher value
        if distance == 0 {
            100  // Center is most valuable
        } else {
            100 - (distance * 15)  // Decrease value by distance
        }
    }
}