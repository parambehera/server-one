import { app } from "./app.js";
import connectDB from "./db/index.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("application listen on port", process.env.PORT);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!", err);
  });
