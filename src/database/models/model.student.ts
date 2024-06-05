import { DataTypes, Model, Sequelize } from "sequelize"

export default class Student extends Model {
  public static definition(sequelize: Sequelize) {
    Student.init(
      {
        discordId: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        login: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        cursus: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        verificationCode: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        tableName: "student",
        sequelize,
      }
    )
  }

  public static associate() {}

  /* fields */

  public displayName!: string

  public promo!: string

  public login!: string

  /* auto-generated fields */

  public id!: number

  public createdAt!: Date

  public updatedAt!: Date
}
