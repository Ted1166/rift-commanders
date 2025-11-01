import type { ControllerOptions } from '@cartridge/controller';
import { dojoConfig } from './config';

export const getCartridgeOptions = (): ControllerOptions => {
  return {
    rpcUrl: dojoConfig.rpcUrl,
    policies: [
      {
        target: dojoConfig.worldAddress,
        method: 'create_game',
      },
      {
        target: dojoConfig.worldAddress,
        method: 'join_game',
      },
      {
        target: dojoConfig.worldAddress,
        method: 'place_units',
      },
      {
        target: dojoConfig.worldAddress,
        method: 'commit_moves',
      },
      {
        target: dojoConfig.worldAddress,
        method: 'execute_turn',
      },
    ],
  } as ControllerOptions;
};