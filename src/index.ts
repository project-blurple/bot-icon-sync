import "dotenv/config";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import type request from "superagent";
import superagent from "superagent";

const { NAME = "", TOKEN = "" } = process.env;
if (!NAME || !TOKEN) throw new Error("Missing environment variables");

const lightPath = join(__dirname, "../icons", `${NAME} Light.png`);
const darkPath = join(__dirname, "../icons", `${NAME} Dark.png`);
if (!existsSync(lightPath) || !existsSync(darkPath)) throw new Error("Missing icons");

const base64Image = readFileSync(new Date().getHours() < 12 ? lightPath : darkPath, "base64");

superagent.patch("https://discord.com/api/v9/users/@me")
  .set("User-Agent", "Project Blurple Bot Image Synchronization (promise@projectblurple.com, 2.0.0)")
  .set("Authorization", `Bot ${TOKEN}`)
  .set("Content-Type", "application/json")
  .send({ avatar: `data:image/png;base64,${base64Image}` })
  .then(() => { console.log("Successfully updated avatar"); })
  .catch((err: request.ResponseError) => {
    console.error("Failed to update avatar:", err.response?.text);
    process.exit(1);
  });
