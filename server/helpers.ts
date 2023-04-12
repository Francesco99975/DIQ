import path from "path";
import fs from "fs";
import { IYearCompund } from "./types";
import * as csv from "csv-writer";
import PDFDocument from "pdfkit-table";

export const generateCsv = async (data: IYearCompund[]) => {
  const timestamp = Date.now().toString();
  const writer = csv.createObjectCsvWriter({
    path: path.resolve(__dirname, `Compund_Report-${timestamp}.csv`),
    header: [
      { id: "year", title: "YEAR" },
      { id: "contributions", title: "CONTRIBUTIONS" },
      { id: "profits", title: "PROFITS" },
      { id: "balance", title: "BALANCE" },
      { id: "intret", title: "RETURN (%)" },
    ],
  });

  await writer.writeRecords(data);
  return timestamp;
};

export const generatePdf = async (data: IYearCompund[], doc: PDFDocument) => {
  const timestamp = Date.now().toString();

  doc.pipe(
    fs.createWriteStream(
      path.resolve(__dirname, `Compund_Report-${timestamp}.pdf`)
    )
  );

  // table
  const table = {
    title: `${data.length} Years Compund Report`,
    subtitle: `Generated on ${new Date(+timestamp).toLocaleString("en-US", {
      dateStyle: "long",
      timeStyle: "long",
    })}`,
    headers: [
      { label: "YEAR", columnColor: "#EAB308", headerColor: "#CA8A04" },
      {
        label: "CONTRIBUTIONS",
        columnColor: "#FDE047",
        headerColor: "#CA8A04",
      },
      { label: "PROFITS", columnColor: "#EAB308", headerColor: "#CA8A04" },
      { label: "BALANCE", columnColor: "#FDE047", headerColor: "#CA8A04" },
      { label: "RETURN (%)", columnColor: "#EAB308", headerColor: "#CA8A04" },
    ],
    rows: data.map((year) => [
      year.year,
      year.contributions,
      year.profits,
      year.balance,
      year.intret,
    ]),
  };

  // the magic (async/await)
  await doc.table(table, {
    width: 300,
    columnsSize: [100, 100, 100, 100, 100],
    divider: {
      header: { disabled: false, width: 2, opacity: 1 },
      horizontal: { disabled: false, width: 0.5, opacity: 0.5 },
    },
  });

  return timestamp;
};
