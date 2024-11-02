import { Schema, model } from 'mongoose';

const KufarAdSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    img_url: { type: String, required: true },
    description: { type: String, trim: true },
    price: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now, expires: '7d' },
  },
  { versionKey: false },
);

export const KufarAd = model('KufarAd', KufarAdSchema);
