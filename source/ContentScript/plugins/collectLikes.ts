import { io, Socket } from "socket.io-client";
import { SocketMessages } from "../types";
import { getJWT, getOptions, log, onElRemove, waitForEl } from "../utils";

type TSongStat = {
  title: string;
  likes: number;
  dislikes: number;
  dj: string;
};

export class CollectLikes {
  private connection: Socket;

  private usersList: Map<string, string> = new Map();

  private lastSongsStats: TSongStat[] = [
    {
      dislikes: 1,
      dj: "Test",
      likes: 2,
      title: "Fu Ge La",
    },
  ];

  private currentSongTitle = "";
  private currentSongDj = "";
  private likes: string[] = [];
  private dislikes: string[] = [];

  init = () => {
    const currentDancefloorRaw = sessionStorage.getItem("currentDancefloor");

    if (currentDancefloorRaw) {
      const currentDancefloor = JSON.parse(currentDancefloorRaw);

      if (currentDancefloor) {
        this.connection = io(`${currentDancefloor.state.config.socketDomain}`, {
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
          reconnectionDelay: 5000,
          reconnection: true,
        });

        // Collect errors
        this.connection.on("connect_error", (e) => {
          console.log("connect failed", e);
        });

        // Reject on retries exhausted (5000ms * 7 attempts)
        this.connection.io.on("reconnect_failed", () => {
          console.error("Failed to reconnect");
          console.log(`Failed to connect after multiple attempts\n Server error message: `);
        });

        // Resolve on successful connection
        this.connection.on("connect", () => {
          log("Collect Likes enabled");
          this.handlePreviousPlayed();
        });

        // https://tt.live/src/data/room/hooks.ts
        this.connection.on(SocketMessages.userWasKickedFromRoom, (...args) => {
          console.log("userWasKickedFromRoom", args);
        });
        this.connection.on(SocketMessages.sendInitialState, (...args) => {
          console.log(SocketMessages.sendInitialState, args);
        });
        this.connection.on(SocketMessages.addAvatarToDancefloor, (...args) => {
          // console.log(SocketMessages.addAvatarToDancefloor, args);

          if (!this.usersList.has(args[0].userUuid)) {
            this.usersList.set(args[0].userUuid, args[0].nickname);
          }

          console.log("addAvatarToDancefloor", this.usersList.entries());
        });
        this.connection.on(SocketMessages.takeDjSeat, (...args) => {
          console.log("takeDjSeat", args);
        });
        this.connection.on(SocketMessages.leaveDjSeat, () => {
          console.log("leaveDjSeat");
        });
        this.connection.on(SocketMessages.playNextSong, (...args) => {
          console.log("playNextSong", args);
          if (this.currentSongTitle !== "") {
            this.lastSongsStats.unshift({
              dislikes: this.dislikes.length,
              likes: this.likes.length,
              dj: this.currentSongDj,
              title: this.currentSongTitle,
            });

            console.log("UPDATED STATS by playNextSong", this.lastSongsStats);
          }
          this.currentSongTitle = args[0].song.trackName;
          this.currentSongDj = args[0].userUuid;
          this.likes = [];
          this.dislikes = [];
          this.refreshPreviousPlayedPanel();
        });
        this.connection.on(SocketMessages.updateRoomConfig, () => {
          console.log("updateRoomConfig");
        });
        this.connection.on(SocketMessages.userDisconnected, () => {
          console.log("userDisconnected");
        });
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

          console.log("UPDATED STATS by sendSatisfaction", this.currentSongTitle, this.likes, this.dislikes);
        });
      }
    }
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

  getUserNickname(uuid: string) {
    return this.usersList.get(uuid) ?? "";
  }

  // Refresh the previous played panel adding stats + infos
  refreshPreviousPlayedPanel = async () => {
    const options = await getOptions();

    if (options.stats) {
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
                const nickname = this.getUserNickname(this.currentSongDj);
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
