import { gql, useQuery } from "@apollo/client";
import { Search } from "./components/search/Search";
import { useEffect, useRef, useState } from "react";
import debounce from "lodash/debounce";

const searchEtfsQuery = gql`
  query SearchEtfsQuery($search: String!) {
    searchEtfs(search: $search) {
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

interface Etf {
  symbol: string;
  name: string;
  price: number;
  dividend_yield: string;
  expense_ratio: string;
}

const getTrueYield = (div_yield: string, expense: string) => {
  const yd: number = +div_yield.substring(0, div_yield.length - 2);
  const xp: number = +expense.substring(0, expense.length - 2);

  return yd - xp;
};

function App() {
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<string | null>(null);
  const [etf, setEtf] = useState<Etf | null>(null);

  const principalRef = useRef<HTMLInputElement>(null);
  const [yearly, setYearly] = useState<number | null>(null);
  const [monthly, setMonthly] = useState<number | null>(null);
  const [DRIP, setDRIP] = useState<boolean>(false);

  const { data, loading } = useQuery(searchEtfsQuery, {
    variables: { search },
  });

  // const { data: etfData, loading: loadingEtf } = useQuery(EtfQuery, {
  //   variables: { sym: search },
  // });

  useEffect(() => {
    console.log(selected);
    if (data && selected) {
      const filter = (data.searchEtfs as Array<Etf>).filter(
        (x: Etf) => x.name === selected
      );
      console.log(filter);
      setEtf(filter[0] || null);
    }
  }, [data, selected]);

  const handleCalc = () => {
    if (etf && principalRef.current?.value !== undefined) {
      const yearlyGain =
        (+principalRef.current?.value / etf.price) *
        ((getTrueYield(etf.dividend_yield, etf.expense_ratio) / 100.0) *
          etf.price) *
        ((principalRef.current?.value === undefined
          ? 0.0
          : +principalRef.current?.value) /
          1000.0);
      const monthlyGain = yearlyGain / 12;
      const DRIP = monthlyGain >= etf.price;

      setYearly(yearlyGain);
      setMonthly(monthlyGain);
      setDRIP(DRIP);
    }
  };

  const setSearchDebounced = debounce(setSearch, 500);

  return (
    <div className="flex w-full flex-col justify-around items-center mt-5">
      <Search
        loading={loading}
        data={data ? data.searchEtfs.map((x: any) => x.name) : []}
        initialTerm={search}
        selected={selected}
        updateSearchTerm={setSearchDebounced}
        setSelected={setSelected}
      ></Search>

      {etf !== null && (
        <div className="flex justify-between w-full">
          <div className="flex flex-col w-full justify-center items-center">
            <span>Name: {etf.name}</span>
            <span>Price: {etf.price}</span>
            <span>Full Yield: {etf.dividend_yield}</span>
            <span>Expense Ratio: {etf.expense_ratio}</span>
            <span>
              True Yield:{" "}
              {getTrueYield(etf.dividend_yield, etf.expense_ratio)
                .toFixed(2)
                .toString() + "%"}
            </span>
          </div>
          <div className="flex flex-col w-full justify-center items-center p-5">
            <div className="flex w-full justify-center items-center">
              <label className="m-2" htmlFor="principal">
                Enter Principal Amount
              </label>
              <input type="number" id="principal" ref={principalRef} min="0" />
            </div>
            <button
              className="p-2 bg-slate-600 border-l-amber-300 text-white"
              onClick={handleCalc}
            >
              Calculate
            </button>
            {yearly && monthly && (
              <div className="flex flex-col w-full justify-center items-center">
                <span>Yearly: ${yearly.toFixed(2)}</span>
                <span>Monthly: ${monthly.toFixed(2)}</span>
                <span>DRIP: {DRIP ? "YES" : "NO"}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
