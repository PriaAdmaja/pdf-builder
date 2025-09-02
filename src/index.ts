import { Hono } from "hono";
import example from './pdf/example.js'
import { routes } from "./routes/index.js";

const PORT = 8000;
const welcomeStrings = "Welcome to PDF Builder!";

const app = new Hono();

app.get("/", (c) => {
  return c.text(welcomeStrings);
});

routes(app);

export default {
  port: PORT,
  fetch: app.fetch,
};
