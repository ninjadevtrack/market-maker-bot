import { Model, model, Schema, Document } from "mongoose";

interface Attrs {
  value: number;
  wallet: {
    ADDRESS: string;
    PRIVATE_KEY: string;
  };
  token: string;
  amount_balance?: number;
  action: string; 
  is_sold_out?: boolean;
}

interface TradeModel extends Model<TradeDoc> {
  build(attrs: Attrs): TradeDoc;
}

interface TradeDoc extends Document {
  value: number;
  wallet: {
    ADDRESS: string;
    PRIVATE_KEY: string;
  };
  token: string;
  amount_balance?: number;
  action: string; 
  timestamp: Date;
  is_sold_out?: boolean;
}

const tradeSchema = new Schema(
  {
    value: { type: Number },
    token: { type: String },
    wallet: {
      ADDRESS: { type: String },
      PRIVATE_KEY: { type: String },
    },
    action: { type: String }, // make it from method used
    amount_balance: { type: Number, default: 0 },
    is_sold_out: { type: Boolean, default: false },
    timestamp: { type: Schema.Types.Date, default: Date.now },
  },
  {
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
      versionKey: false,
    },
  }
);

tradeSchema.statics.build = (attrs: Attrs) => {
  return new Trade(attrs);
};

const Trade = model<TradeDoc, TradeModel>("Trade", tradeSchema);
export { Trade, TradeDoc };
