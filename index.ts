import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./router";
import dotenv from "dotenv";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
// подключает middleware для парсинга данных в формате URL-encoded, переданных в HTTP-запросах
// (обычно в теле запросов POST или PUT).
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api", router);

const start = async () => {
  try {
    app.listen(port, () => {
      return console.log(`Express is listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
