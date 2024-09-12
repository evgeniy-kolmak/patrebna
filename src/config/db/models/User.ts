import { Schema, model } from 'mongoose';
import { Profile } from 'config/db/models/Profile';
import { Parser } from 'config/db/models/Parser';

const UserSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    profiles: { type: Schema.Types.ObjectId, ref: Profile },
    parsers: { type: Schema.Types.ObjectId, ref: Parser },
  },
  { versionKey: false },
);

export const User = model('User', UserSchema);
