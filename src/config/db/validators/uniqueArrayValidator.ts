export const uniqueArrayValidator = {
  validator: function (arr: number[]) {
    return Array.isArray(arr) && new Set(arr).size === arr.length;
  },
  message: 'Массив должен содержать только уникальные значения.',
};
