// src/models/Lote.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';

interface LoteAttributes {
  id: number;
  nome: string;
  ativo: boolean;
  criado_em: Date;
}

interface LoteCreationAttributes extends Omit<LoteAttributes, 'id' | 'criado_em'> {}

class Lote extends Model<LoteAttributes, LoteCreationAttributes> implements LoteAttributes {
  public id!: number;
  public nome!: string;
  public ativo!: boolean;
  public criado_em!: Date;

  public static associate(models: any) {
    Lote.hasMany(models.Boleto, { foreignKey: 'id_lote', as: 'Boletos' });
  }
}

Lote.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING(100),
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
    modelName: 'Lote',
    tableName: 'lotes',
    timestamps: false, // Estamos gerenciando createdAt manualmente
  }
);

export default Lote;