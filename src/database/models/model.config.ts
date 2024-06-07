import { DataTypes, Model, Sequelize } from "sequelize"

export default class ConfigModel extends Model {
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
        tableName: "config",
        sequelize,
      }
    )
  }

  public static associate() {}

  /* fields */

  public data!: Record<string, any>

  /* auto-generated fields */

  public id!: number

  public createdAt!: Date

  public updatedAt!: Date
}
