import axios from 'axios';
import { ITrack } from '../tasks/trackEvropochta';
import { compareLengthPathPackages, truncateString } from '../utils';

export async function addTracks(
  message: string,
): Promise<ITrack | IDataApiError> {
  await compareLengthPathPackages(await getDataForTrackNumber(message));
  return await getDataForTrackNumber(message);
}

export async function getDataForTrackNumber(
  trackNumber: string,
): Promise<ITrack | IDataApiError> {
  let dataApi: IDataApi[] = [];
  try {
    const { data } = await axios.get(
      `https://evropochta.by/api/track.json/?number=${trackNumber}`,
    );
    dataApi = data.data;
  } catch (error) {
    console.error(error);
  }

  const { error, errorMessage } = await isErrorDataApi(dataApi);
  if (error) {
    return { error, errorMessage };
  } else {
    const dataTrack: ITrack = {
      trackNumber,
      infoPoint: truncateString(dataApi[0].InfoTrack, 120),
      lengthPath: dataApi.length,
    };
    return dataTrack;
  }
}

export async function isErrorDataApi(data: IDataApi[]): Promise<IDataApiError> {
  const dataError: IDataApiError = {
    error: !!data[0].Error,
    errorMessage: data[0].ErrorDescription,
  };
  return dataError;
}

export interface IDataApi {
  Timex: string;
  InfoTrack: string;
  IsChooseDeliveryTime: string;
  CheckxFrom: string;
  CheckxTo: string;
  Info: string;
  Error: string;
  ErrorDescription: string;
}

export interface IDataApiError {
  error: boolean;
  errorMessage: string;
}
