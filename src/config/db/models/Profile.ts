import { Schema, model } from 'mongoose';
import { Premium } from 'config/db/models/Premium';
import { uniqueArrayValidator } from 'config/db/validators/uniqueArrayValidator';

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
    referrals: {
      type: [Number],
      default: [],
      validate: uniqueArrayValidator,
    },
  },
  { versionKey: false },
);

export const Profile = model('Profile', ProfileSchema);
