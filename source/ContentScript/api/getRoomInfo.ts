import axios from "axios";
import { API_ROOMS_URL } from "../constants";
import { getJWT } from "../utils";

type RoomDetail = {
  id: number;
  name: string;
  description: string;
  vibe: string;
  djType: "EVERYONE";
  musicProviderKeys: string[];
  numberOfDjs: number;
  usersInRoomUuids: string[];
  friendInRoomUuids: string[];
  slug: string;
  roomSize: number;
  entryFee: number;
  freeEntries: number;
  password: string;
  type: "PUBLIC";
  domain: string;
  socketDomain: string;
  socketPath: string;
  provisionedRoomProductId: string;
  createdAt: string;
  updatedAt: string;
  isPasswordProtected: true;
  numberOfUsersInRoom: number;
  numberOfActiveDjs: number;
  song: {
    artistName: string;
    duration: number;
    genre: string;
    id: string;
    isrc: string;
    musicProvider: string;
    trackName: string;
    trackUrl: string;
    soundCloudPrivateSongSecret: string;
  };
  debugCommunication: true;
  promoted: true;
  neverSuspended: true;
  roomServerId: string;
  roomRoles: [
    {
      id: number;
      roomId: number;
      room: {
        id: number;
        name: string;
        debugCommunication: true;
        description: string;
        vibe: string;
        djType: "EVERYONE";
        musicProviderKeys: ["apple"];
        numberOfDjs: number;
        slug: string;
        roomSize: number;
        entryFee: number;
        freeEntries: number;
        password: string;
        type: "PUBLIC";
        domain: string;
        socketDomain: string;
        design: "DEFAULT";
        roomServerId: number;
        roomServer: {
          id: number;
          provisionedRoomProductId: string;
          roomToken: string;
          serverCapacity: number;
          loadBalancer: {
            id: number;
            loadBalancerToken: string;
            provisionedLoadBalancerProductId: string;
            roomServers: string[];
            createdAt: "2022-09-26T13:56:13.670Z";
            updatedAt: "2022-09-26T13:56:13.670Z";
          };
          loadBalancerId: number;
          createdAt: "2022-09-26T13:56:13.670Z";
          updatedAt: "2022-09-26T13:56:13.670Z";
        };
        promoted: true;
        neverSuspended: true;
        createdAt: "2022-09-26T13:56:13.670Z";
        socketPath: string;
        updatedAt: "2022-09-26T13:56:13.670Z";
        pinnedMessages: any[];
        lastTimeSuspended: "2022-09-26T13:56:13.670Z";
        isLive: true;
        guestPassword: string;
        posterUrl: string;
        uuid: string;
      };
      userUuid: string;
      role: "moderator";
      expirationTime: "2022-09-26T13:56:13.670Z";
      createdAt: "2022-09-26T13:56:13.670Z";
      updatedAt: "2022-09-26T13:56:13.670Z";
    }
  ];
  pinnedMessages: any[];
  lastTimeSuspended: "2022-09-26T13:56:13.670Z";
  design: "DEFAULT";
  isLive: true;
  posterUrl: string;
  uuid: string;
  isGuestPasswordProtected: true;
};

export const getRoomInfos = async (slug: string): Promise<RoomDetail> => {
  const authtoken = getJWT();

  if (!authtoken) return Promise.reject();

  const response = await axios.get(`${API_ROOMS_URL}/rooms/${slug}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${authtoken}`,
    },
    //   paramsSerializer: params => {
    //     return qs.stringify(params)
    //   }
  });
  return await response.data;
};
