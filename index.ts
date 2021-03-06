// index.ts

import token from "./config.ts";
import handle from "./message_handler.ts";
import {
  Client,
  MESSAGE_CREATE,
  READY,
  RATELIMIT,
  HEARTBEAT,
  RESUMED,
  INVALID_SESSION,
  ev,
} from "./deps.ts";

const client = new Client({
  token,
});

console.log(`Running cordeno v${client.version}`);

for await (const ctx of client) {
  switch (ctx.event) {
    case ev.Ready: {
      const ready: READY = ctx;

      console.log("Cordeno is now ready!");
      console.log("Discord websocket API version is " + ready.gatewayVersion);

      // Sets client presence
      client.user.setPresence({
        status: "online",
        game: {
          name: "Desktop Automation",
          type: "playing",
        },
      });
      break;
    }
    case ev.Resumed: {
      const resumed: RESUMED = ctx;
      if (resumed.reconnectRequested) {
        console.log("Discord API requested a reconnect.");
        break;
      }
      console.log(`Resumed at: ${resumed.resumeTime}`);
      break;
    }
    case ev.InvalidSession: {
      const session: INVALID_SESSION = ctx;
      console.log(
        `An invalid session occured. Can resume from previous state?: ${session.canResume}`,
      );
      break;
    }
    case ev.Ratelimit: {
      const ratelimit: RATELIMIT = ctx;
      console.log(`A rate limit was hit for the route: ${ratelimit.route}`);
      // deno-fmt-ignore
      console.log(`The ratelimit will reset in ${Math.round(ratelimit.resetIn / 1000 * 10) / 10}s`);
      break;
    }

    case ev.Heartbeat: {
      const heartbeat: HEARTBEAT = ctx;
      // deno-fmt-ignore
      console.log(
        "Heartbeat recieved: \n" +
        `=>total: ${heartbeat.total}\n=>rate: ${Math.round(heartbeat.rate / 1000 * 10) / 10}s`
        );
      break;
    }
    case ev.Message: {
      const msg: MESSAGE_CREATE = ctx;
      if (msg.author.id !== client.user.id) {
        handle(msg)
        .then(async res => {
          console.log(res);
          if(res) await msg.reply("```js\n"+JSON.stringify(res)+"\n```");
        })
      }
      break;
    }
  }
}
