import { Schema, model } from 'mongoose';

const ReferralSchema = new Schema(
  {
    userId: { type: Number, required: true, unique: true },
  },
  { versionKey: false },
);

export const Referral = model('Referral', ReferralSchema);
