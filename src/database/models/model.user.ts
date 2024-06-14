import { DataTypes, Model, Sequelize } from 'sequelize';

export default class UserModel extends Model {
  /* fields */

  declare displayName: string;

  declare promo: string;

  declare login: string;

  /* auto-generated fields */

  declare id: number;

  declare createdAt: Date;

  declare updatedAt: Date;

  declare discordId: string;

  declare cursus: string;

  declare verificationCode: number;

  declare verified: boolean;

  public static definition(sequelize: Sequelize) {
    UserModel.init(
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
        verified: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      },
      {
        tableName: 'user',
        sequelize,
      },
    );
  }

  public static associate() {}
}
