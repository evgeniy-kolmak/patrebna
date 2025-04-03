import { Schema, model } from 'mongoose';
import { Premium } from 'config/db/models/Premium';
import { Referral } from 'config/db/models/Referral';

const ProfileSchema = new Schema(
  {
    username: {
      type: String,
    },
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    subscribeToChannel: {
      type: Boolean,
    },
    premium: { type: Schema.Types.ObjectId, ref: Premium },
    referrals: [{ type: Schema.Types.ObjectId, ref: Referral }],
  },
  { versionKey: false },
);

export const Profile = model('Profile', ProfileSchema);
