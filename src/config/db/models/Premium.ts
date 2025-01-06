import { Schema, model } from 'mongoose';
import { type IPremium, StatusPremium } from 'config/types';

const PremiumSchema = new Schema(
  {
    status: {
      type: String,
      enum: [StatusPremium.ACTIVE, StatusPremium.EXPIRED, StatusPremium.NONE],
      default: StatusPremium.NONE,
      required: true,
    },
    end_date: {
      type: Date,
      required: function (this: IPremium) {
        return this.status === StatusPremium.ACTIVE;
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Premium = model('Premium', PremiumSchema, 'premium');
