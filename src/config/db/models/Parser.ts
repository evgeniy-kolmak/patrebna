import { Schema, model } from 'mongoose';
import { KufarAd } from 'config/db/models/KufarAd';
import { DataParser } from 'config/db/models/DataParser';

const ParserSchema = new Schema(
  {
    kufar: {
      kufarAds: [{ type: Schema.Types.ObjectId, ref: KufarAd }],
      dataParser: { type: Schema.Types.ObjectId, ref: DataParser },
    },
  },
  { versionKey: false },
);

export const Parser = model('Parser', ParserSchema);
