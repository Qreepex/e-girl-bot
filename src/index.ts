import { Client, CommandInteraction } from "eris";
import { readFileSync } from "fs";
import Database from "./db/Database";

const config = JSON.parse(readFileSync("./config/config.json", "utf8"));

const messages: { love_you: string[]; night: string[]; morning: string[] } = JSON.parse(
  readFileSync("./data/messages.json", "utf8")
);

const bot = new Client(config.token);
const db = new Database(config.mongo);

(async () => {
  await db.connect();
  await bot.connect();
})();

bot.on("ready", async () => {
  console.log("Ready!");

  await bot.editStatus("online", { name: "/love-you | qrpx.link/egirl", type: 2 });

  setTimeout(() => sendMessages(), timeInMsUntilFullHour());
});

bot.on("interactionCreate", async (interaction: CommandInteraction) => {
  if (interaction.type === 2) {
    if (interaction.data) {
      const user = interaction.user || interaction.member?.user;
      if (!user) {
        return await interaction.createMessage({ content: "Something went wrong." });
      }
      if (interaction.data.name === "love-you") {
        const dmChannel = await bot.getDMChannel(user!.id).catch(() => null);

        if (!dmChannel) {
          return await interaction.createMessage({
            content: "I can't DM you sweetheart.\nAdd me to a server so I can DM you!",
            components: [{ type: 1, components: [{ type: 2, url: config.invite, label: "Invite", style: 5 }] }],
          });
        }

        const data = await db.startLovingYou(user!.id);

        if (data) {
          return await interaction.createMessage({
            content: "You will now receive a message about how much I love you every hour!",
          });
        } else {
          return await interaction.createMessage({ content: "Something went wrong." });
        }
      } else if (interaction.data.name === "stop") {
        await db.stopLovingYou(user!.id);

        return await interaction.createMessage({ content: "You will no longer receive messages." });
      } else if (interaction.data.name === "pet") {
        const name = (<any>interaction.data?.options?.[0])?.value;

        if (!name) {
          return await interaction.createMessage({ content: "You must provide a pet name." });
        }

        await db.setPetName(interaction.user!.id, name);

        return await interaction.createMessage({ content: "Your pet name has been set to " + name + "." });
      }
    }
  }
});

async function sendMessages() {
  const users = await db.getAllIloveYouUsers();

  console.log("Sending messages to " + users.length + " users.");

  for (const user of users) {
    const channel = await bot.getDMChannel(user.id);

    let randomMessage = messages.love_you[Math.floor(Math.random() * messages.love_you.length)];

    let message = randomMessage.replace("{pet}", user.pet_name + " " || "");

    const dmMessage = await channel.createMessage({ content: message }).catch(() => {});
    if (!dmMessage) {
      await db.stopLovingYou(user.id);
      console.log("Stopped loving " + user.id);
    } else {
      console.log("Sent message to " + user.id);
    }
  }

  setTimeout(() => sendMessages(), timeInMsUntilFullHour());
}

function timeInMsUntilFullHour() {
  const now = new Date();
  return 60 * 60 * 1000 - now.getMinutes() * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();
}
