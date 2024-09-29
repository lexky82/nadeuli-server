import app from "./app";
import syncDatabase from "./lib/sync";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  syncDatabase();
  console.log(`Server is running on http://localhost:${PORT}`);
});
