import * as migration_20261119_034702_init from './20261119_034702_init';

export const migrations = [
  {
    up: migration_20261119_034702_init.up,
    down: migration_20261119_034702_init.down,
    name: '20261119_034702_init'
  },
];
