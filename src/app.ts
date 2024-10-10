import express, { Application } from "express";
import routes from "./routes";
import path from "path";
import session from "express-session";
import morgan from "morgan";
import cookieParser from "cookie-parser";

const app: Application = express();

app.use(cookieParser());
app.use(
  session({
    secret: "hidden_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use("/static", express.static(path.join(process.cwd(), "public")));
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", routes);
app.use("/api", routes);

export default app;
