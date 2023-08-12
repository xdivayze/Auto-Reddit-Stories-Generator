import { fromText, getTopPosts } from "./lib";

const snoowrap = require("snoowrap");
require("dotenv").config();

import * as fs from 'fs'

const SUBREDDIT = 'TrueOffMyChest'

const r = new snoowrap({
  userAgent: "Mozilla/5.0",
  clientSecret: process.env.reddit_secret,
  clientId: process.env.reddit_id,
  username: process.env.reddit_username,
  password: process.env.reddit_pass,
});

getTopPosts("day", SUBREDDIT, r)

fs.readdirSync('Data/Text').forEach((fileName) => {
  const file = fs.readFileSync(`Data/Text/${fileName}`, 'utf-8')
  const breaks = file.split("\n")
  const title = breaks[0]
  const body = breaks.filter((v,i) => i > 1).join(' ')
  fromText(body, title)
})