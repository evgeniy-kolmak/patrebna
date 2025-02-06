import { Schema, model } from 'mongoose';
import { KufarAd } from 'config/db/models/KufarAd';
import { DataParser } from 'config/db/models/DataParser';

const ParserSchema = new Schema(
  {
    kufar: {
      kufarAds: {
        type: [
          {
            urlId: { type: Number, required: true },
            ads: [{ type: Schema.Types.ObjectId, ref: KufarAd }],
          },
        ],
        validate: [
          {
            validator: (value: unknown[]) => value.length <= 3,
            message: 'Поле "kufarAds" не может содержать больше 3 элементов.',
          },
        ],
      },
      dataParser: { type: Schema.Types.ObjectId, ref: DataParser },
    },
  },
  { versionKey: false },
);

export const Parser = model('Parser', ParserSchema);
