import { Hono } from "hono";
import { routes } from "./routes/index.js";
import z from "zod";

const PORT = 8000;
const welcomeStrings = "Welcome to PDF Builder!";

const app = new Hono();

app.get("/", (c) => {
  return c.text(welcomeStrings);
});

routes(app);

app.onError((error, c) => {

  if (error instanceof z.ZodError) {
    const errors = z.flattenError(error)

    return c.json({ error: errors, message: 'ZodError' }, 400)
  }

  console.error(error)
  return c.json(
    { error, message: error.message || 'Custom Error Message' },
    500,
  )
})

export default {
  port: PORT,
  fetch: app.fetch,
};
