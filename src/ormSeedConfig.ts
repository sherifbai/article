import ormconfig from './ormconfig';

const ormSeedConfig = {
  ...ormconfig,
  migrations: [__dirname + '/seeds/**/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/seeds',
  },
};

export default ormSeedConfig;
