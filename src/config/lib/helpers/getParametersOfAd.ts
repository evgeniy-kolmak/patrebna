import {
  type AdParameters,
  type ParameterMap,
  type RawParam,
} from 'config/types';

export function getParametersOfAd(
  params: RawParam[],
  keys: AdParameters | AdParameters[],
): ParameterMap {
  const keyArray = Array.isArray(keys) ? keys : [keys];

  return keyArray.reduce<ParameterMap>((acc, k) => {
    const item = params.find((i) => i.p === k);
    if (!item) return acc;

    const vl = item.vl;
    const value =
      vl === '' || (Array.isArray(vl) && vl.every((v) => v === ''))
        ? item.v
        : vl;

    if (Array.isArray(value) && value.length === 1) {
      acc[k] = value[0];
    } else {
      acc[k] = value;
    }
    return acc;
  }, {});
}
