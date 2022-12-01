import app from "./src/index.js";
import * as db from "./src/data/db.js";

db.connect(process.env.DB_URI);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`TeenyURL API at http://localhost:${PORT}/`);
});
