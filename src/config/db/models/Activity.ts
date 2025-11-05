import { Schema, model } from 'mongoose';
import { uniqueArrayValidator } from 'config/db/validators/uniqueArrayValidator';

const ActivitySchema = new Schema(
  {
    userIdsSubscribedToChannel: {
      type: [Number],
      default: [],
      validate: uniqueArrayValidator,
    },
    alreadyRegisteredUserIds: {
      type: [Number],
      default: [],
      validate: uniqueArrayValidator,
    },
    blacklist: {
      type: [Number],
      default: [],
      validate: uniqueArrayValidator,
    },
  },
  {
    versionKey: false,
  },
);

export const Activity = model('Activity', ActivitySchema, 'activities');
