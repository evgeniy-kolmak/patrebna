import { Schema, model } from 'mongoose';

const uniqueArrayValidator = {
  validator: function (arr: number[]) {
    return Array.isArray(arr) && new Set(arr).size === arr.length;
  },
  message: 'Массив должен содержать только уникальные значения.',
};

const ActivitySchema = new Schema(
  {
    userIdsSubscribedToChannel: {
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
