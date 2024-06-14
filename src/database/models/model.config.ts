import { DataTypes, Model, Sequelize } from 'sequelize';

export default class ConfigModel extends Model {
  /* auto-generated fields */

  declare id: number;

  declare createdAt: Date;

  declare updatedAt: Date;

  /* fields */

  declare data: Record<string, unknown>;

  public static definition(sequelize: Sequelize) {
    ConfigModel.init(
      {
        data: {
          type: DataTypes.JSONB,
          defaultValue: {},
          allowNull: false,
        },
      },
      {
        tableName: 'config',
        sequelize,
      },
    );
  }

  public static associate() {}
}
