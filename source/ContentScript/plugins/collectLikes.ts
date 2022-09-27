import { io, Socket } from "socket.io-client";
import { SocketMessages } from "../types";
import { getJWT, getOptions, onElRemove, waitForEl } from "../utils";

type TSongStat = {
  title: string;
  likes: number;
  dislikes: number;
  dj: string;
};

const getCurrentDancefloor = () => {
  const currentDancefloorRaw = sessionStorage.getItem("currentDancefloor");

  if (currentDancefloorRaw) {
    const currentDancefloor = JSON.parse(currentDancefloorRaw);
    if (currentDancefloor) {
      return currentDancefloor;
    }
  }

  return false;
};

export class CollectLikes {
  private connection: Socket;
  private roomCheckInterval: NodeJS.Timeout;
  private currentRoomId: string;
  private usersList: Map<string, string> = new Map();
  private lastSongsStats: TSongStat[] = [];
  private currentSongTitle = "";
  private currentSongDj = "";
  private likes: string[] = [];
  private dislikes: string[] = [];

  /**
   * Init current room listening process
   */
  init = () => {
    this.roomCheckInterval = setInterval(() => {
      this.checkForRoomChange();
    }, 5000);
  };

  /**
   * Check if current room has changed and in case reinit listening
   */
  checkForRoomChange = () => {
    const currentDancefloor = getCurrentDancefloor();
    if (currentDancefloor.state.config.slug !== this.currentRoomId) {
      this.currentRoomId = currentDancefloor.state.config.slug;
      this.initRoomListening(currentDancefloor.state.config.slug);
    }
  };

  /**
   * reset current room stats
   */
  resetStatsInfos() {
    this.lastSongsStats = [];
    this.currentSongTitle = "";
    this.currentSongDj = "";
    this.likes = [];
    this.dislikes = [];
  }

  /** reset all infos (except users cache) */
  reset() {
    if (this.roomCheckInterval) {
      clearInterval(this.roomCheckInterval);
    }
    this.resetStatsInfos();
  }

  restartSocketConnection = () => {
    if (this.connection && this.connection.connected) {
      this.connection.disconnect();
    }

    const currentDancefloor = getCurrentDancefloor();
    if (currentDancefloor) {
      this.connection = io(`${currentDancefloor.state.config.socketDomain}`, {
        // forceNew: true,
        // transports: ["polling"],
        path: currentDancefloor.state.config.socketPath,
        transportOptions: {
          polling: {
            extraHeaders: {
              authorization: `Bearer ${getJWT()}`,
              "X-TT-password": null,
            },
          },
        },
        reconnectionAttempts: 7,
        reconnectionDelay: 10000,
        reconnection: true,
      });

      // Collect errors
      this.connection.on("connect_error", (e) => {
        console.error("connect failed", e);
      });

      // Reject on retries exhausted (5000ms * 7 attempts)
      this.connection.io.on("reconnect", () => {
        console.log("SOCKET RECONNECTING", this.connection);
        this.connection.disconnect();
        this.restartSocketConnection();
      });

      this.connection.io.on("reconnect_failed", () => {
        console.error("Failed to reconnect");
        console.log(`Failed to connect after multiple attempts\n Server error message: `);
      });

      // Resolve on successful connection
      this.connection.on("connect", () => {
        console.log("SOCKET CONNECTED", this.connection);
        // log("Collect Likes enabled");
        this.handlePreviousPlayed();
        // this.getCurrentUsersInfos();
      });

      this.connection.on("disconnect", (...args) => {
        console.log("SOCKET DISCONNECTED", this.connection, args);
      });

      // https://tt.live/src/data/room/hooks.ts
      // this.connection.on(SocketMessages.userWasKickedFromRoom, (...args) => {
      //   console.log("userWasKickedFromRoom", args);
      // });
      this.connection.on(SocketMessages.sendInitialState, (...args) => {
        console.log(SocketMessages.sendInitialState, args);
        args[0].users.forEach((u: any) => {
          this.usersList.set(u[0], u[1].nickname);
        });
      });
      this.connection.on(SocketMessages.addAvatarToDancefloor, (...args) => {
        // Set current users list infos
        if (!this.usersList.has(args[0].userUuid)) {
          this.usersList.set(args[0].userUuid, args[0].nickname);
        }
      });
      // this.connection.on(SocketMessages.takeDjSeat, (...args) => {
      //   console.log("takeDjSeat", args);
      // });
      // this.connection.on(SocketMessages.leaveDjSeat, () => {
      //   console.log("leaveDjSeat");
      // });
      this.connection.on(SocketMessages.playNextSong, (...args) => {
        console.log(SocketMessages.playNextSong, args);
        if (this.currentSongTitle !== "") {
          // save song stats
          this.lastSongsStats.unshift({
            dislikes: this.dislikes.length,
            likes: this.likes.length,
            dj: this.currentSongDj,
            title: this.currentSongTitle,
          });
        }

        // reset current track stats
        this.currentSongTitle = args[0].song.trackName;
        this.currentSongDj = args[0].userUuid;
        this.likes = [];
        this.dislikes = [];
        this.refreshPreviousPlayedPanel();
      });
      // this.connection.on(SocketMessages.updateRoomConfig, () => {
      //   console.log("updateRoomConfig");
      // });
      // this.connection.on(SocketMessages.userDisconnected, () => {
      //   console.log("userDisconnected");
      // });
      this.connection.on(SocketMessages.sendSatisfaction, (...args) => {
        console.log(SocketMessages.sendSatisfaction, args);
        if (args[0].choice === "approve") {
          this.likes = this.likes.filter((l) => l !== args[0].userUuid);
          this.likes.push(args[0].userUuid);
          this.dislikes = this.dislikes.filter((l) => l !== args[0].userUuid);
        }
        if (args[0].choice === "disapprove") {
          this.dislikes = this.dislikes.filter((l) => l !== args[0].userUuid);
          this.dislikes.push(args[0].userUuid);
          this.likes = this.likes.filter((l) => l !== args[0].userUuid);
        }
      });
    }
  };

  /**
   * Connect to room socket for catching room events and handle them
   * @param roomId
   */
  initRoomListening = (roomId: string) => {
    this.currentRoomId = roomId;
    this.resetStatsInfos();
    this.restartSocketConnection();
  };

  // Handle panel refresh initialization with mount/unmount listeners
  handlePreviousPlayed() {
    this.refreshPreviousPlayedPanel();

    const getPanel = () => {
      const ul = document.querySelector("li[data-testid=song-listing-wrapper]:first-of-type");
      if (!ul) return null;
      return ul.closest("ul");
    };

    onElRemove(getPanel).then(() => {
      console.log("PREVIOUS PLAYED REMOVED");
      waitForEl(getPanel).then(() => {
        console.log("PREVIOUS PLAYED RESUMED");
        this.handlePreviousPlayed();
      });
    });
  }

  // Get user nickname from cached list
  getUserNickname(uuid: string) {
    return this.usersList.get(uuid) ?? "";
  }

  // Refresh the previous played panel adding stats + infos
  refreshPreviousPlayedPanel = async () => {
    const options = await getOptions();

    if (options.stats) {
      console.log("refreshPreviousPlayedPanel", this.lastSongsStats);

      const tracks = document.querySelectorAll<any>("li[data-testid=song-listing-wrapper]");
      if (tracks.length > 0) {
        tracks.forEach((el) => {
          const elTitle = el.ariaLabel;
          const stats = this.lastSongsStats.find((s) => elTitle.indexOf(s.title) === 0);

          if (stats) {
            const hasStats = el.querySelector(".ttle-stats");
            if (!hasStats) {
              const titleCol = el.querySelector("div :nth-child(2)");
              if (titleCol) {
                const nickname = this.getUserNickname(stats.dj);
                const nicknameHTML = nickname !== "" ? `<span class="ttle-stats__dj">${nickname}</span> | ` : "";

                const statsDiv = document.createElement("div");
                statsDiv.classList.add("ttle-stats");
                statsDiv.innerHTML = `${nicknameHTML}${stats.likes} 👍 - ${stats.dislikes} 👎`;
                titleCol.append(statsDiv);
              }
            }
          }
        });
      }
    } else {
      const statsElements = document.querySelectorAll(".ttle-stats");
      statsElements.forEach((el) => {
        el.remove();
      });
    }
  };
}
