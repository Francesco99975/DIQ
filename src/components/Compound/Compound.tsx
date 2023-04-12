// import {
//   FormControl,
//   InputLabel,
//   MenuItem,
//   Select,
//   SelectChangeEvent,
// } from "@mui/material";
import axios from "axios";
import fileDownload from "js-file-download";
import { FormEvent, useEffect, useRef, useState } from "react";
import AssetDetail from "../Asset/AssetDetail";
import Button from "../UI/Button";
import Input from "../UI/Input";
import { numericFormatter } from "react-number-format";

interface ICompundProps {
  principal: number;
  stockPrice: number;
  dividendYield: number;
}

// enum DISTRIB_TYPE {
//   QUARTERLY,
//   MONTHLY,
// }

export const Compound: React.FC<ICompundProps> = ({
  principal,
  stockPrice,
  dividendYield,
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const extraRef = useRef<HTMLInputElement>(null);
  const divVarRef = useRef<HTMLInputElement>(null);
  const appriciationVarRef = useRef<HTMLInputElement>(null);
  const compoundingYearsRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);

  //   const [12, setDistrib] = useState<DISTRIB_TYPE>(
  //     DISTRIB_TYPE.MONTHLY
  //   );

  const [totalContrib, setTotalContrib] = useState<number[]>([]);
  const [cumDividends, setCumDividends] = useState<number[]>([]);
  const [finalBalance, setFinalBalance] = useState<number[]>([]);
  const [totalReturn, setTotalReturn] = useState<number[]>([]);

  useEffect(() => {
    formRef.current?.reset();
    setTotalContrib([]);
    setCumDividends([]);
    setFinalBalance([]);
    setTotalReturn([]);
  }, [principal, stockPrice, dividendYield]);

  const calculate = () => {
    if (
      extraRef.current?.value !== undefined &&
      divVarRef.current?.value !== undefined &&
      appriciationVarRef.current?.value !== undefined &&
      compoundingYearsRef.current?.value !== undefined
    ) {
      setTotalContrib([]);
      setCumDividends([]);
      setFinalBalance([]);
      setTotalReturn([]);
      const extra = +extraRef.current.value;
      const divVar = +divVarRef.current.value;
      const appVar = +appriciationVarRef.current.value;
      const compoundingYears = +compoundingYearsRef.current.value;

      //   const 12 = DISTRIB_TYPE.MONTHLY ? 12 : 4;

      let cum = 0;
      let balance = principal;
      let divInc = 0;
      let appInc = 0;
      let contrib = extra / 12;

      let cumulatingContrib = 0;

      for (let month = 1; month <= compoundingYears * 12; ++month) {
        const stockAmount = (balance * (1 + appInc / 100.0)) / stockPrice;
        const amountPerStock = stockPrice * ((dividendYield + divInc) / 100.0);

        let dividendGain = (stockAmount * amountPerStock) / 12;
        cum += dividendGain;
        balance += dividendGain + contrib;

        divInc += divVar / 12;
        appInc += appVar / 12;

        cumulatingContrib += month !== 1 ? contrib : principal + contrib;

        if (month % 12 === 0) {
          handleYear(month / 12, extra, balance, cumulatingContrib, cum);
        }
      }
    }
  };

  const handleYear = (
    year: number,
    extra: number,
    bal: number,
    cumContr: number,
    cumDivs: number
  ) => {
    let yearReturn =
      ((bal - (principal + extra * year)) / (principal + extra * year)) * 100;

    setTotalContrib((state) => [...state, cumContr]); // Your Contributions
    setCumDividends((state) => [...state, cumDivs]); // Your Total Dividend Gains
    setFinalBalance((state) => [...state, bal]); // Final Balance
    setTotalReturn((state) => [...state, yearReturn]); // Return Percentage
  };

  const handleCompund = (event: FormEvent) => {
    event.preventDefault();
    calculate();
  };

  const formatData = () => {
    let data = [];
    let format = {
      decimalScale: 2,
      thousandSeparator: ",",
      fixedDecimalScale: true,
      prefix: "$",
    };
    for (let index = 0; index < finalBalance.length; index++) {
      data.push({
        year: (index + 1).toString(),
        contributions: numericFormatter(totalContrib[index].toString(), format),
        profits: numericFormatter(cumDividends[index].toString(), format),
        balance: numericFormatter(finalBalance[index].toString(), format),
        intret: totalReturn[index].toFixed(2) + "%",
      });
    }

    return data;
  };

  const handleCSV = async () => {
    try {
      setLoading(true);
      const data = formatData();

      const response = await axios.post(
        "/csv",
        { data },
        { responseType: "blob" }
      );

      fileDownload(
        response.data,
        `Compund_Report-${Date.now().toString()}.csv`
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePDF = async () => {
    try {
      setLoading(true);
      const data = formatData();

      const response = await axios.post(
        "/pdf",
        { data },
        { responseType: "blob" }
      );

      fileDownload(
        response.data,
        `Compund_Report-${Date.now().toString()}.pdf`
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  //   const handleDistribChange = (event: SelectChangeEvent<DISTRIB_TYPE>) => {
  //     setDistrib(event.target.value as DISTRIB_TYPE);
  //     calculate();
  //   };

  const tableBodyBuilder = () => {
    let htmlTableBody: JSX.Element[] = [];
    for (let index = 0; index < finalBalance.length; index++) {
      htmlTableBody.push(
        <tr key={index}>
          <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <AssetDetail value={totalContrib[index]} />
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <AssetDetail value={cumDividends[index]} />
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <AssetDetail value={finalBalance[index]} />
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <AssetDetail value={totalReturn[index].toFixed(2) + "%"} />{" "}
          </td>
        </tr>
      );
    }

    return htmlTableBody;
  };

  return (
    <div className="flex flex-col w-full justify-center items-center p-2 m-5 border-2 bg-yellow-500 border-yellow-800 text-black rounded-md">
      <h1 className="text-lg underline">Calculate Compounding Dividends</h1>
      <form
        ref={formRef}
        onSubmit={handleCompund}
        className="flex flex-col w-full justify-center items-center p-5"
      >
        {/* <FormControl className="w-[95%] md:w-[25%] !m-2">
          <InputLabel id="asset_type">Distribtion Period</InputLabel>
          <Select
            labelId="dist_type_label"
            id="dist_type_select"
            value={12}
            label="Distribtion Period"
            onChange={handleDistribChange}
          >
            <MenuItem value={DISTRIB_TYPE.MONTHLY}>Monthly</MenuItem>
            <MenuItem value={DISTRIB_TYPE.QUARTERLY}>Quarterly</MenuItem>
          </Select>
        </FormControl> */}

        <Input
          id="extra"
          type="number"
          min="0"
          step=".01"
          label="Enter Extra Annual Contribution"
          ref={extraRef}
          defaultValue="0"
        />

        <Input
          id="divvar"
          type="number"
          min="0"
          step=".01"
          label="Enter Expected Annual Dividend Amount Increase % (per year)"
          ref={divVarRef}
          defaultValue="0"
        />

        <Input
          id="appvar"
          type="number"
          min="0"
          step=".01"
          label="Enter Expected Annual Share Price Appreciation % (per year):"
          ref={appriciationVarRef}
          defaultValue="0"
        />

        <Input
          id="cmpyr"
          type="number"
          min="1"
          step="1"
          label="Enter compounding Years"
          ref={compoundingYearsRef}
          defaultValue="1"
        />

        <Button
          className=" border-2 border-yellow-800 text-yellow-800"
          type="submit"
        >
          Calculate
        </Button>
      </form>

      {totalContrib.length > 0 &&
      cumDividends.length > 0 &&
      finalBalance.length > 0 &&
      totalReturn.length > 0 ? (
        <>
          <div className="flex flex-col w-[95%] justify-center items-center p-2 m-5 border-2 bg-yellow-500 border-yellow-800">
            <Button
              className="rounded-b-md p-3 text-lg bg-green-500 text-white"
              type="button"
              onClick={handleCSV}
              disabled={loading}
            >
              Export to CSV
            </Button>

            <Button
              className="rounded-b-md p-3 text-lg bg-red-600 text-white"
              type="button"
              onClick={handlePDF}
              disabled={loading}
            >
              Export to PDF
            </Button>
          </div>

          <div className="w-[95%] overflow-auto p-2 m-5 border-2 bg-yellow-500 border-yellow-300 text-black rounded-lg shadow hidden md:block">
            <table className="min-w-full divide-y divide-yellow-700">
              <thead className="bg-yellow-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                    YEAR
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                    CONTRIBUTIONS
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                    PROFITS
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                    BALANCE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                    RETURN (%)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-yellow-500 divide-y divide-yellow-700">
                {tableBodyBuilder().map((row) => row)}
              </tbody>
            </table>
          </div>

          {finalBalance.map((_, index) => {
            return (
              <div className="flex flex-col w-[95%] justify-center items-center p-2 m-5 border-2 bg-yellow-500 border-yellow-300 text-black rounded-md md:hidden">
                <h1 className="text-lg underline">
                  Results (YEAR {index + 1})
                </h1>
                <AssetDetail
                  label="Contributions"
                  value={totalContrib[index]}
                />
                <AssetDetail label="Profits" value={cumDividends[index]} />
                <AssetDetail
                  label="Final Balance"
                  value={finalBalance[index]}
                />
                <AssetDetail
                  label="Total Return"
                  value={totalReturn[index].toFixed(2) + "%"}
                />
              </div>
            );
          })}
        </>
      ) : (
        <div className="flex flex-col w-[80%] justify-center items-center p-2 m-5 border-2 bg-yellow-500 border-yellow-300 text-black rounded-md">
          <p className="text-center">Results will be displayed here</p>
        </div>
      )}
    </div>
  );
};
