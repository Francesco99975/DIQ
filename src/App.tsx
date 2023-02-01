import { gql, useQuery } from "@apollo/client";
import { Search } from "./components/search/Search";
import { FormEvent, useEffect, useRef, useState } from "react";
import debounce from "lodash/debounce";
import Input from "./components/UI/Input";
import Button from "./components/UI/Button";
import Etf from "./types/etf";
import EtfDetail from "./components/Etf/EtfDetail";
import Sample from "./components/Sample/Sample";

const searchDividendEtfsQuery = gql`
  query SearchDividendEtfsQuery($search: String!) {
    searchDividendEtfs(search: $search) {
      symbol
      name
      price
      dividend_yield
      expense_ratio
    }
  }
`;

// const EtfQuery = gql`
//   query Etf($sym: String!) {
//     etf(sym: $sym) {
//       symbol
//       name
//       price
//       dividend_yield
//       expense_ratio
//     }
//   }
// `;

const getTrueYield = (div_yield: string, expense: string) => {
  const yd: number = +div_yield.substring(0, div_yield.length - 1);
  const xp: number = +expense.substring(0, expense.length - 1);

  return (yd * 100 - xp * 100) / 100;
};

function App() {
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<string | null>(null);
  const [etf, setEtf] = useState<Etf | null>(null);

  const principalRef = useRef<HTMLInputElement>(null);
  const [yearly, setYearly] = useState<number | null>(null);
  const [monthly, setMonthly] = useState<number | null>(null);
  const [quarterly, setQuarterly] = useState<number | null>(null);
  const [DRIP, setDRIP] = useState<boolean>(false);
  const [dripMulti, setDripMulti] = useState<number | null>(null);

  const { data, loading } = useQuery(searchDividendEtfsQuery, {
    variables: { search },
  });

  // const { data: etfData, loading: loadingEtf } = useQuery(EtfQuery, {
  //   variables: { sym: search },
  // });

  useEffect(() => {
    if (data && selected) {
      const filter = (data.searchDividendEtfs as Array<Etf>).filter(
        (x: Etf) => x.name === selected
      );

      setEtf(filter[0] || null);
      setYearly(null);
      setMonthly(null);
      setQuarterly(null);
      setDRIP(false);
      setDripMulti(null);
    }
  }, [data, selected]);

  const handleCalc = (event: FormEvent) => {
    event.preventDefault();
    if (etf && principalRef.current?.value !== undefined) {
      const stockAmount = Math.floor(+principalRef.current?.value / etf.price);
      const amountPerStock =
        etf.price *
        (getTrueYield(etf.dividend_yield, etf.expense_ratio) / 100.0);
      const yearlyGain = stockAmount * amountPerStock;
      const monthlyGain = yearlyGain / 12;
      const quarterlyGain = yearlyGain / 4;
      const DRIP = monthlyGain >= etf.price;
      const multi = Math.floor(monthlyGain / etf.price);

      setYearly(yearlyGain);
      setMonthly(monthlyGain);
      setQuarterly(quarterlyGain);
      setDRIP(DRIP);
      setDripMulti(multi);
    }
  };

  const setSearchDebounced = debounce(setSearch, 500);

  return (
    <>
      <h1 className="m-5 text-2xl text-green-700">ETF Dividend Calculator</h1>
      <Search
        loading={loading}
        data={data ? data.searchDividendEtfs.map((x: any) => x.name) : []}
        initialTerm={search}
        selected={selected}
        updateSearchTerm={setSearchDebounced}
        setSelected={setSelected}
      ></Search>

      {etf !== null ? (
        <div className="flex flex-col md:flex-row justify-between items-center w-full">
          <div className="flex flex-col w-[80%] justify-center items-center p-2 m-5 border-2 bg-lime-200 border-green-700 text-green-700 rounded-md">
            <h1>Information</h1>
            <EtfDetail label="Symbol" value={etf.symbol} />
            <EtfDetail label="Price" value={"$" + etf.price.toFixed(2)} />
            <EtfDetail label="Full Yield" value={etf.dividend_yield} />
            <EtfDetail label="Expense Ratio" value={etf.expense_ratio} />
            <EtfDetail
              label="True Yield"
              value={
                getTrueYield(etf.dividend_yield, etf.expense_ratio)
                  .toFixed(2)
                  .toString() + "%"
              }
            />
          </div>

          <form
            onSubmit={handleCalc}
            className="flex flex-col w-full justify-center items-center p-5"
          >
            <Input
              id="principal"
              type="number"
              min="0"
              step=".01"
              label="Enter Principal Amount"
              ref={principalRef}
            />
            <Button
              className=" border-2 border-green-700 text-green-700"
              type="submit"
            >
              Calculate
            </Button>
          </form>

          {yearly && monthly && quarterly && dripMulti !== null ? (
            <div className="flex flex-col w-[80%] justify-center items-center p-2 m-5 border-2 bg-blue-300 border-blue-700 text-blue-700 rounded-md">
              <h1>Results</h1>
              <EtfDetail label="Yearly" value={"$" + yearly.toFixed(2)} />
              <EtfDetail label="Monthly" value={"$" + monthly.toFixed(2)} />
              <EtfDetail label="Quarterly" value={"$" + quarterly.toFixed(2)} />
              <EtfDetail
                label="DRIP"
                value={
                  (DRIP ? "YES" : "NO") +
                  (dripMulti > 0 ? "(x" + dripMulti + ")" : "")
                }
              />
            </div>
          ) : (
            <div className="flex flex-col w-[80%] justify-center items-center p-2 m-5 border-2 bg-blue-300 border-blue-700 text-blue-700 rounded-md">
              <p className="text-center">Results will be displayed here</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col w-[80%] justify-center items-center p-2 m-5 border-2 bg-lime-200 border-green-700 text-green-700 rounded-md">
          <p className="text-center">
            Search Etfs to know how much dividend you can gain or punch in
            sample data
          </p>
          <Sample />
        </div>
      )}
    </>
  );
}

export default App;
