// server/index.ts
import { app } from "./app";

const port = parseInt(process.env.PORT || "10000", 10);
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${port}`);
});
