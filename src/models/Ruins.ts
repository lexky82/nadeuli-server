import { DataTypes, Model } from "sequelize";
import sequelize from "../lib/sequelize";

class Ruins extends Model {
  public ID!: number;
  public MLSFC_NM!: string;
  public POI_ID!: number;
  public POI_NM!: string;
  public CL_CD!: number;
  public CL_NM!: string;
  public CTPRVN_NM!: string;
  public SIGNGU_NM!: string;
  public LEGALDONG_NM!: string;
  public LI_NM!: string;
  public LNBR_NO!: string;
  public RDNMADR_NM!: string;
  public BULD_NO!: string;
  public LC_LA!: number;
  public LC_LO!: number;
}

Ruins.init(
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    MLSFC_NM: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    POI_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    POI_NM: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    CL_CD: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    CL_NM: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    CTPRVN_NM: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    SIGNGU_NM: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    LEGALDONG_NM: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    LI_NM: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    LNBR_NO: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    RDNMADR_NM: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    BULD_NO: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    LC_LA: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    LC_LO: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Ruins",
    tableName: "ruins",
    timestamps: false,
  }
);

export default Ruins;
