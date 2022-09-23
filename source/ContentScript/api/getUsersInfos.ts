import axios from "axios";
import { API_URL } from "../constants";
import { getJWT } from "../utils";

export const getUsersInfos = async (uuids: string[]): Promise<Map<string, string>> => {
  const authtoken = getJWT();

  if (!authtoken) return new Map();

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  };

  const response = await axios.get(`${API_URL}/users/profiles`, {
    params: {
      users: [1, 2, 3],
    },
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authtoken,
    },
    //   paramsSerializer: params => {
    //     return qs.stringify(params)
    //   }
  });
  const res = (await response.json()) as ILoginRes;
};
