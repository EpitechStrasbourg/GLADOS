import { QueryInterface, Sequelize, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    queryInterface.createTable('user', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      login: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      cursus: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },
  down: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    // Delete your modifications here.
  }
}