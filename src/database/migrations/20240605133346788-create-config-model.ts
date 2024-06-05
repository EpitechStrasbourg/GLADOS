import { DataTypes, QueryInterface, Sequelize } from "sequelize"

export default {
  up: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    queryInterface.createTable("config", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      config: {
        type: DataTypes.JSONB,
        defaultValue: {},
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    })
  },
  down: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    queryInterface.dropTable("config")
  },
}