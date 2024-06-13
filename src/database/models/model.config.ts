import { DataTypes, Model, Sequelize } from "sequelize"

export default class ConfigModel extends Model {
  public id!: number
  public data!: Record<string, unknown>
  public createdAt!: Date
  public updatedAt!: Date

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
}
