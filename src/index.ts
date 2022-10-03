import "dotenv/config";
import type { RESTError, RESTPatchAPICurrentUserJSONBody, RESTPatchAPICurrentUserResult } from "discord-api-types/v10";
import { RouteBases, Routes } from "discord-api-types/v10";
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

const userRoute = RouteBases.api + Routes.user();
const patchBody: RESTPatchAPICurrentUserJSONBody = { avatar: `data:image/png;base64,${base64Image}` };

superagent.patch(userRoute)
  .set("User-Agent", "Project Blurple Bot Image Synchronization (promise@projectblurple.com, 2.0.0)")
  .set("Authorization", `Bot ${TOKEN}`)
  .set("Content-Type", "application/json")
  .send(patchBody)
  .then(res => {
    const body = res.body as RESTError | RESTPatchAPICurrentUserResult;
    if ("code" in body) return error(`Error ${body.code}: ${body.message}`);
    console.log("Successfully updated avatar");
  })
  .catch((err: request.ResponseError) => {
    error(`Failed to update avatar: ${err.response?.text ?? "Unknown error"}`);
  });

function error(message: string) {
  console.error(message);
  process.exit(1);
}
