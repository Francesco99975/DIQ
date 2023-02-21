import { gql, useQuery } from "@apollo/client";
import { Search } from "./components/search/Search";
import { FormEvent, useEffect, useRef, useState } from "react";
import debounce from "lodash/debounce";
import Input from "./components/UI/Input";
import Button from "./components/UI/Button";
import Asset from "./types/asset";
import AssetDetail from "./components/Asset/AssetDetail";
import Sample from "./components/Sample/Sample";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";

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

const searchDividendReitsQuery = gql`
  query SearchDividendReitsQuery($search: String!) {
    searchDividendReits(search: $search) {
      symbol
      name
      price
      dividend_yield
    }
  }
`;

const searchDividendStocksQuery = gql`
  query SearchDividendStocksQuery($search: String!) {
    searchDividendStocks(search: $search) {
      symbol
      name
      price
      dividend_yield
    }
  }
`;

const ASSET_TYPES = ["ETF", "REIT", "STOCK"];

const getTrueYield = (div_yield: string, expense: string) => {
  const yd: number = +div_yield.substring(0, div_yield.length - 1);
  const xp: number = +expense.substring(0, expense.length - 1);

  return (yd * 100 - xp * 100) / 100;
};

function App() {
  const [search, setSearch] = useState<string>("");
  // const [selected, setSelected] = useState<string | null>(null);
  const [asset, setCurrentAsset] = useState<Asset | null>(null);

  const principalRef = useRef<HTMLInputElement>(null);
  const [yearly, setYearly] = useState<number | null>(null);
  const [monthly, setMonthly] = useState<number | null>(null);
  const [quarterly, setQuarterly] = useState<number | null>(null);
  const [DRIP, setDRIP] = useState<boolean>(false);
  const [dripMulti, setDripMulti] = useState<number | null>(null);

  const { data: etfData, loading: etfLoading } = useQuery(
    searchDividendEtfsQuery,
    {
      variables: { search },
    }
  );

  const { data: reitData, loading: reitLoading } = useQuery(
    searchDividendReitsQuery,
    {
      variables: { search },
    }
  );

  const { data: stockData, loading: stockLoading } = useQuery(
    searchDividendStocksQuery,
    {
      variables: { search },
    }
  );

  const [assType, setAssType] = useState<string>(ASSET_TYPES[0]);

  useEffect(() => {
    setYearly(null);
    setMonthly(null);
    setQuarterly(null);
    setDRIP(false);
    setDripMulti(null);
  }, [assType, asset]);

  const handleAssetChange = (event: SelectChangeEvent<string>) => {
    setAssType(event.target.value);
  };

  const handleCalc = (event: FormEvent) => {
    event.preventDefault();
    if (asset && principalRef.current?.value !== undefined) {
      const stockAmount = Math.floor(
        +principalRef.current?.value / asset.price
      );
      const trueYield: number = asset.expense_ratio
        ? getTrueYield(asset.dividend_yield, asset.expense_ratio)
        : +asset.dividend_yield.substring(0, asset.dividend_yield.length - 1);
      const amountPerStock = asset.price * (trueYield / 100.0);
      const yearlyGain = stockAmount * amountPerStock;
      const monthlyGain = yearlyGain / 12;
      const quarterlyGain = yearlyGain / 4;
      const DRIP = monthlyGain >= asset.price;
      const multi = Math.floor(monthlyGain / asset.price);

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
      <h1 className="m-5 text-2xl text-green-700">
        Dividend Income Calculator
      </h1>
      <div className="flex flex-col md:flex-row w-full justify-center">
        <FormControl className="w-[95%] md:w-[25%] !m-2">
          <InputLabel id="asset_type">Asset Type</InputLabel>
          <Select
            labelId="asset_type_label"
            id="asset_type_select"
            value={assType}
            label="Age"
            onChange={handleAssetChange}
          >
            <MenuItem value={ASSET_TYPES[0]}>{ASSET_TYPES[0]}</MenuItem>
            <MenuItem value={ASSET_TYPES[1]}>{ASSET_TYPES[1]}</MenuItem>
            <MenuItem value={ASSET_TYPES[2]}>{ASSET_TYPES[2]}</MenuItem>
          </Select>
        </FormControl>

        {assType === ASSET_TYPES[0] && (
          <Search
            label="Search ETFs"
            loading={etfLoading}
            data={etfData ? etfData.searchDividendEtfs.map((x: any) => x) : []}
            initialTerm={search}
            updateSearchTerm={setSearchDebounced}
            setSelected={setCurrentAsset}
          ></Search>
        )}

        {assType === ASSET_TYPES[2] && (
          <Search
            label="Search Stocks"
            loading={stockLoading}
            data={
              stockData ? stockData.searchDividendStocks.map((x: any) => x) : []
            }
            initialTerm={search}
            updateSearchTerm={setSearchDebounced}
            setSelected={setCurrentAsset}
          ></Search>
        )}

        {assType === ASSET_TYPES[1] && (
          <Search
            label="Search Reits"
            loading={reitLoading}
            data={
              reitData ? reitData.searchDividendReits.map((x: any) => x) : []
            }
            initialTerm={search}
            updateSearchTerm={setSearchDebounced}
            setSelected={setCurrentAsset}
          ></Search>
        )}
      </div>

      {asset !== null ? (
        <div className="flex flex-col md:flex-row justify-between items-center w-full">
          <div className="flex flex-col w-[80%] justify-center items-center p-2 m-5 border-2 bg-lime-200 border-green-700 text-green-700 rounded-md">
            <h1>Information</h1>
            <AssetDetail label="Symbol" value={asset.symbol} />
            <AssetDetail label="Price" value={"$" + asset.price.toFixed(2)} />
            <AssetDetail label="Full Yield" value={asset.dividend_yield} />
            {asset.expense_ratio && (
              <AssetDetail label="Expense Ratio" value={asset.expense_ratio} />
            )}
            {asset.expense_ratio && (
              <AssetDetail
                label="True Yield"
                value={
                  getTrueYield(asset.dividend_yield, asset.expense_ratio)
                    .toFixed(2)
                    .toString() + "%"
                }
              />
            )}
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
              <AssetDetail label="Yearly" value={"$" + yearly.toFixed(2)} />
              <AssetDetail label="Monthly" value={"$" + monthly.toFixed(2)} />
              <AssetDetail
                label="Quarterly"
                value={"$" + quarterly.toFixed(2)}
              />
              <AssetDetail
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
            Search Assets to know how much dividend you can gain or punch in
            sample data
          </p>
          <Sample />
        </div>
      )}
    </>
  );
}

export default App;
