import { FormEvent, useRef, useState } from "react";
import AssetDetail from "../Asset/AssetDetail";
import { Compound } from "../Compound/Compound";
import Button from "../UI/Button";
import Input from "../UI/Input";

const Sample = () => {
  const smp_price = useRef<HTMLInputElement>(null);
  const smp_yield = useRef<HTMLInputElement>(null);
  const smp_principal = useRef<HTMLInputElement>(null);

  const [yearly, setYearly] = useState<number | null>(null);
  const [monthly, setMonthly] = useState<number | null>(null);
  const [quarterly, setQuarterly] = useState<number | null>(null);
  const [DRIP, setDRIP] = useState<boolean>(false);
  const [dripMulti, setDripMulti] = useState<number | null>(null);
  const [DRIPQ, setDRIPQ] = useState<boolean>(false);
  const [dripMultiQ, setDripMultiQ] = useState<number | null>(null);

  const isValid = (
    sp: string | undefined,
    sy: string | undefined,
    spr: string | undefined
  ) => {
    return sp !== undefined && sy !== undefined && spr !== undefined;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (
      isValid(
        smp_price.current?.value,
        smp_yield.current?.value,
        smp_principal.current?.value
      )
    ) {
      const stockAmount = Math.floor(
        +smp_principal.current?.value! / +smp_price.current?.value!
      );
      const amountPerStock =
        +smp_price.current?.value! * (+smp_yield.current?.value! / 100.0);

      const yearlyGain = stockAmount * amountPerStock;

      const monthlyGain = yearlyGain / 12;
      const quarterlyGain = yearlyGain / 4;
      const DRIP = monthlyGain >= +smp_price.current?.value!;
      const multi = Math.floor(monthlyGain / +smp_price.current?.value!);
      const DRIPQ = monthlyGain * 4 >= +smp_price.current?.value!;
      const multiQ = Math.floor((monthlyGain * 4) / +smp_price.current?.value!);

      setYearly(yearlyGain);
      setMonthly(monthlyGain);
      setQuarterly(quarterlyGain);
      setDRIP(DRIP);
      setDripMulti(multi);
      setDRIPQ(DRIPQ);
      setDripMultiQ(multiQ);
    }
  };
  return (
    <div className="flex flex-col w-full justify-center items-center p-2">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full justify-center items-center p-2"
      >
        <Input
          id="smp_price"
          type="number"
          min="0"
          step=".01"
          label="Enter Sample Price"
          ref={smp_price}
        />
        <Input
          id="smp_yield"
          type="number"
          min="0"
          step=".01"
          label="Enter Sample Yield Percentage"
          ref={smp_yield}
        />
        <Input
          id="smp_principal"
          type="number"
          min="0"
          step=".01"
          label="Enter Sample Principal"
          ref={smp_principal}
        />
        <Button
          className=" border-2 border-green-700 text-green-700"
          type="submit"
        >
          Calculate
        </Button>
      </form>

      {yearly &&
      monthly &&
      quarterly &&
      dripMulti !== null &&
      dripMultiQ !== null ? (
        <>
          <div className="flex flex-col w-[80%] justify-center items-center p-2 m-5 border-2 bg-blue-300 border-blue-700 text-blue-700 rounded-md">
            <h1 className="text-lg underline">Results</h1>
            <AssetDetail label="Yearly" value={yearly} />
            <AssetDetail label="Monthly" value={monthly} />
            <AssetDetail label="Quarterly" value={quarterly} />
            <AssetDetail
              label="DRIP"
              value={
                (DRIP ? "YES" : "NO") +
                (dripMulti > 0 ? "(x" + dripMulti + ")" : "")
              }
            />
            <AssetDetail
              label="Quarterly DRIP"
              value={
                (DRIPQ ? "YES" : "NO") +
                (dripMultiQ > 0 ? "(x" + dripMultiQ + ")" : "")
              }
            />
          </div>

          <Compound
            symbol="SAMPLE"
            principal={+smp_principal.current?.value!}
            stockPrice={+smp_price.current?.value!}
            dividendYield={+smp_yield.current?.value!}
          ></Compound>
        </>
      ) : (
        <div className="flex flex-col w-[80%] justify-center items-center p-2 m-5 border-2 bg-blue-300 border-blue-700 text-blue-700 rounded-md">
          <p className="text-center">Results will be displayed here</p>
        </div>
      )}
    </div>
  );
};

export default Sample;
