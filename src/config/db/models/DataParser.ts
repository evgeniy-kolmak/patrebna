import { type IDataParserItem } from 'config/types';
import { Schema, model } from 'mongoose';

const DataParserSchema = new Schema(
  {
    urls: {
      type: [
        {
          id: {
            type: Number,
            required: true,
          },
          url: {
            type: String,
            trim: true,
            required: true,
          },
          typeUrlParser: {
            type: String,
            required: true,
          },
          isActive: {
            type: Boolean,
            required: true,
          },
        },
      ],
      validate: {
        validator: (value: IDataParserItem[]) => value.length <= 3,
        message: 'Коллекция ссылок не может содержать больше 3 объектов.',
      },
    },
  },
  { versionKey: false },
);

export const DataParser = model('DataParser', DataParserSchema);
