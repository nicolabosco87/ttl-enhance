import { io, Socket } from "socket.io-client";
import { SocketMessages } from "../types";
import { log } from "../utils";

const JWT_TOKEN = localStorage.getItem("token-storage");

type TSongStat = {
  title: string;
  likes: number;
  dislikes: number;
  dj: string;
};

export class CollectLikes {
  private connection: Socket;

  private lastSongsStats: TSongStat[] = [];

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
                authorization: `Bearer ${JWT_TOKEN}`,
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

          this.updatePreviousPlayed();
        });

        // https://tt.live/src/data/room/hooks.ts
        this.connection.on(SocketMessages.userWasKickedFromRoom, (...args) => {
          console.log("userWasKickedFromRoom", args);
        });
        this.connection.on(SocketMessages.sendInitialState, (...args) => {
          console.log(SocketMessages.sendInitialState, args);
        });
        this.connection.on(SocketMessages.addAvatarToDancefloor, (...args) => {
          console.log(SocketMessages.addAvatarToDancefloor, args);
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
          // this.currentSongTitle = args[0].song.trackName;
          this.likes = [];
          this.dislikes = [];
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

  updatePreviousPlayed = () => {
    setInterval(() => {
      const tracks = document.querySelectorAll<any>("li[data-testid=song-listing-wrapper]");
      if (tracks.length > 0) {
        tracks.forEach((el) => {
          const elTitle = el.ariaLabel;
          const stats = this.lastSongsStats.find((s) => elTitle.indexOf(s.title) === 0);

          if (stats) {
            const hasStats = el.querySelector(".tte-stats");
            if (!hasStats) {
              const titleCol = el.querySelector("div :nth-child(2)");
              if (titleCol) {
                const statsDiv = document.createElement("div");
                statsDiv.classList.add("tte-stats");
                statsDiv.innerHTML = `<span class="tte-stats">${stats.likes} 👍 - ${stats.dislikes} 👎</span>`;
                titleCol.append(statsDiv);
              }
            }
          }
        });
      }
    }, 1000);
  };
}
