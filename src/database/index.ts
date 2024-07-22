import * as Models from '@/database/models';
import env from '@/env';
import { Sequelize } from 'sequelize';

export default async (sequelize: Sequelize) => {
  Object.values(Models).forEach((model) => {
    model.definition(sequelize);
  });

  Object.values(Models).forEach((model) => {
    model.associate();
  });

  return sequelize.authenticate();
};

export const sequelize = new Sequelize(
  `postgres://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`,
  {
    logging: env.SEQUELIZE_LOGGING,
  },
);
