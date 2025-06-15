const fs = require("fs");
const path = require("path");
const https = require("https");

const STATUS_FILE = path.join(__dirname, "../../STATUS.JSON");
const API_URL = "https://m3-chat.vercel.app/api/status";

function fetchStatus() {
  return new Promise((resolve, reject) => {
    https
      .get(API_URL, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            resolve(json.online === true);
          } catch (e) {
            resolve(false); // Treat parse error as "offline"
          }
        });
      })
      .on("error", () => resolve(false));
  });
}

async function updateStatusFile() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toISOString();
  const online = await fetchStatus();

  let data = [];
  if (fs.existsSync(STATUS_FILE)) {
    try {
      const raw = fs.readFileSync(STATUS_FILE, "utf8");
      data = JSON.parse(raw);
    } catch (e) {
      console.warn("Failed to parse STATUS.JSON, resetting...");
    }
  }

  let day = data.find((d) => d.date === date);
  if (!day) {
    day = { date, checks: [] };
    data.push(day);
  }

  day.checks.push({ time, online });

  fs.writeFileSync(STATUS_FILE, JSON.stringify(data, null, 2));
}

updateStatusFile();
