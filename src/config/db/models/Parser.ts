import { Schema, model } from 'mongoose';
import { KufarAd } from 'config/db/models/KufarAd';

const ParserSchema = new Schema(
  {
    kufar: {
      kufarAds: [{ type: Schema.Types.ObjectId, ref: KufarAd }],
      dataParser: {
        url: {
          type: String,
          trim: true,
          required: true,
        },
        typeUrlParser: {
          type: String,
          required: true,
        },
      },
    },
  },
  { versionKey: false },
);

export const Parser = model('Parser', ParserSchema);
