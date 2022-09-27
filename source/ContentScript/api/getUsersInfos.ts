import axios from "axios";
import { API_URL } from "../constants";
import { getJWT } from "../utils";

export const getUsersInfos = async (uuids: string[]): Promise<Map<string, string>> => {
  const authtoken = getJWT();

  if (!authtoken) return Promise.reject();

  const response = await axios.get(`${API_URL}/users/profiles`, {
    params: {
      users: uuids,
    },
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${authtoken}`,
    },
    //   paramsSerializer: params => {
    //     return qs.stringify(params)
    //   }
  });
  const res = await response.data;

  console.log(res);

  const usersInfos = new Map<string, string>();

  res.forEach((u: any) => {
    usersInfos.set(u.id, u.userProfile.nickname);
  });

  return res;
};
