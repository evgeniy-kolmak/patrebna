import { Schema, model } from 'mongoose';

const ProfileSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
    },
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    premium: {
      type: Number,
    },
  },
  { versionKey: false },
);

export const Profile = model('Profile', ProfileSchema);
