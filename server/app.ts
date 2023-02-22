import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import console from "console";

let result = dotenv.config();

if (result.error) console.log(result.error);

const PORT = process.env.PORT || 5000;

const app = express();
app.set("trust proxy", 1);

app.use(express.static(process.cwd() + "/dist/build"));

app.use(express.json());

app.get("/", (req, res, next) => {
  return res.sendFile(process.cwd() + "dist/build/index.html");
});

app.post("/graphql", async (req, res, next) => {
  try {
    const response = await axios.post(
      "https://finex3.p.rapidapi.com/",
      req.body,
      {
        headers: {
          "content-type": "application/json",
          "X-RapidAPI-Key": process.env.API_KEY,
          "X-RapidAPI-Host": process.env.API_HOST,
        },
      }
    );

    return res.status(200).json(response.data.data);
  } catch (error) {
    return res.status(400).json(error);
  }
});

app.listen(PORT, () => {
  console.log(`Listening on PORT: ${PORT}`);
});
