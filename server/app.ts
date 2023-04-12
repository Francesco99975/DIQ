import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import console from "console";
import { IParameters, IYearCompund } from "./types";
import { generateCsv, generatePdf } from "./helpers";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit-table";

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

app.post("/csv", async (req, res, next) => {
  try {
    const data: IYearCompund[] = req.body.data;
    const timestamp = await generateCsv(data);

    const fileLocation = path.resolve(
      __dirname,
      `Compund_Report-${timestamp}.csv`
    );

    // Delete File After 10 minutes from server
    setTimeout(() => {
      try {
        fs.unlinkSync(fileLocation);
      } catch (error) {
        console.log(error);
      }
    }, 600000);

    return res.sendFile(fileLocation);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error while generating CSV", error });
  }
});

app.post("/pdf", async (req, res, next) => {
  try {
    const data: IYearCompund[] = req.body.data;
    const parameters: IParameters = req.body.parameters;

    let doc = new PDFDocument({ margin: 30, size: "A4", pdfVersion: "1.7" });
    doc.pipe(res.setHeader("Content-Type", "application/pdf"));
    const timestamp = await generatePdf(doc, data, parameters);
    doc.end();

    const fileLocation = path.resolve(
      __dirname,
      `Compund_Report-${timestamp}.pdf`
    );

    // Delete File After 10 minutes from server
    setTimeout(() => {
      try {
        fs.unlinkSync(fileLocation);
      } catch (error) {
        console.log(error);
      }
    }, 600000);

    return res.sendFile(fileLocation);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error while generating PDF", error });
  }
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
