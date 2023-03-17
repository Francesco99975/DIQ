// import {
//   FormControl,
//   InputLabel,
//   MenuItem,
//   Select,
//   SelectChangeEvent,
// } from "@mui/material";
import { FormEvent, useRef, useState } from "react";
import AssetDetail from "../Asset/AssetDetail";
import Button from "../UI/Button";
import Input from "../UI/Input";

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
  const extraRef = useRef<HTMLInputElement>(null);
  const divVarRef = useRef<HTMLInputElement>(null);
  const appriciationVarRef = useRef<HTMLInputElement>(null);
  const compoundingYearsRef = useRef<HTMLInputElement>(null);

  //   const [12, setDistrib] = useState<DISTRIB_TYPE>(
  //     DISTRIB_TYPE.MONTHLY
  //   );

  const [totalContrib, setTotalContrib] = useState<number>(0);
  const [cumDividends, setCumDividends] = useState<number>(0);
  const [finalBalance, setFinalBalance] = useState<number>(0);
  const [totalReturn, setTotalReturn] = useState<number>(0);

  const calculate = () => {
    if (
      extraRef.current?.value !== undefined &&
      divVarRef.current?.value !== undefined &&
      appriciationVarRef.current?.value !== undefined &&
      compoundingYearsRef.current?.value !== undefined
    ) {
      const extra = +extraRef.current.value;
      const divVar = +divVarRef.current.value;
      const appVar = +appriciationVarRef.current.value;
      const compoundingYears = +compoundingYearsRef.current.value;

      setTotalContrib(principal + extra * compoundingYears); // Your Contributions

      //   const 12 = DISTRIB_TYPE.MONTHLY ? 12 : 4;

      let cum = 0;
      let balance = principal;
      let divInc = 0;
      let appInc = 0;
      let contrib = extra / 12;

      for (let i = 0; i < compoundingYears * 12; ++i) {
        const stockAmount = (balance * (1 + appInc / 100.0)) / stockPrice;
        const amountPerStock = stockPrice * ((dividendYield + divInc) / 100.0);

        let dividendGain = (stockAmount * amountPerStock) / 12;
        cum += dividendGain;
        balance += dividendGain + contrib;

        divInc += divVar / 12;
        appInc += appVar / 12;
      }

      setCumDividends(cum); // Your Total Dividend Gains
      setFinalBalance(balance); // Final Balance
      setTotalReturn(
        ((balance - (principal + extra * compoundingYears)) /
          (principal + extra * compoundingYears)) *
          100
      ); // Return Percentage
    }
  };

  const handleCompund = (event: FormEvent) => {
    event.preventDefault();
    calculate();
  };

  //   const handleDistribChange = (event: SelectChangeEvent<DISTRIB_TYPE>) => {
  //     setDistrib(event.target.value as DISTRIB_TYPE);
  //     calculate();
  //   };

  return (
    <div className="flex flex-col w-[80%] justify-center items-center p-2 m-5 border-2 bg-yellow-500 border-yellow-300 text-black rounded-md">
      <form
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
        />

        <Input
          id="divvar"
          type="number"
          min="0"
          step=".01"
          label="Enter Expected Annual Dividend Amount Increase % (per year)"
          ref={divVarRef}
        />

        <Input
          id="appvar"
          type="number"
          min="0"
          step=".01"
          label="Enter Expected Annual Share Price Appreciation % (per year):"
          ref={appriciationVarRef}
        />

        <Input
          id="cmpyr"
          type="number"
          min="1"
          step="1"
          label="Enter compounding Years"
          ref={compoundingYearsRef}
        />

        <Button
          className=" border-2 border-yellow-700 text-yellow-700"
          type="submit"
        >
          Calculate
        </Button>
      </form>

      {totalContrib && cumDividends && finalBalance && totalReturn ? (
        <>
          <div className="flex flex-col w-[95%] justify-center items-center p-2 m-5 border-2 bg-yellow-500 border-yellow-300 text-black rounded-md">
            <h1>Results</h1>
            <AssetDetail
              label="Contributions"
              value={"$" + totalContrib.toFixed(2)}
            />
            <AssetDetail
              label="Profits"
              value={"$" + cumDividends.toFixed(2)}
            />
            <AssetDetail
              label="Final Balance"
              value={"$" + finalBalance.toFixed(2)}
            />
            <AssetDetail
              label="Total Return"
              value={totalReturn.toFixed(2) + "%"}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col w-[80%] justify-center items-center p-2 m-5 border-2 bg-yellow-500 border-yellow-300 text-black rounded-md">
          <p className="text-center">Results will be displayed here</p>
        </div>
      )}
    </div>
  );
};
