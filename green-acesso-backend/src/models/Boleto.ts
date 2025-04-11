// src/models/Boleto.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import Lote from './Lote';

interface BoletoAttributes {
  id: number;
  nome_sacado: string;
  id_lote: number;
  valor: number;
  linha_digitavel: string;
  ativo: boolean;
  criado_em: Date;
}

interface BoletoCreationAttributes extends Omit<BoletoAttributes, 'id' | 'criado_em'> {}

class Boleto extends Model<BoletoAttributes, BoletoCreationAttributes> implements BoletoAttributes {
  public id!: number;
  public nome_sacado!: string;
  public id_lote!: number;
  public valor!: number;
  public linha_digitavel!: string;
  public ativo!: boolean;
  public criado_em!: Date;

  public static associate(models: any) {
    Boleto.belongsTo(models.Lote, { foreignKey: 'id_lote', as: 'Lote' });
  }
}

Boleto.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome_sacado: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    id_lote: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Lote, key: 'id' },
    },
    valor: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    linha_digitavel: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    criado_em: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Boleto',
    tableName: 'boletos',
    timestamps: false,
  }
);

export default Boleto;