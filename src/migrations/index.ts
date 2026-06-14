import * as migration_20260613_121742 from './20260613_121742';
import * as migration_20260614_095031 from './20260614_095031';

export const migrations = [
  {
    up: migration_20260613_121742.up,
    down: migration_20260613_121742.down,
    name: '20260613_121742',
  },
  {
    up: migration_20260614_095031.up,
    down: migration_20260614_095031.down,
    name: '20260614_095031'
  },
];
