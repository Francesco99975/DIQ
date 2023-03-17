import { Search } from "./components/search/Search";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
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
import axios from "axios";
import { Compound } from "./components/Compound/Compound";

const searchDividendEtfsQuery = `query SearchDividendEtfsQuery($search: String!) {
    searchDividendEtfs(search: $search) {
      symbol
      name
      price
      dividend_yield
      expense_ratio
    }
  }`;

const searchDividendReitsQuery = `query SearchDividendReitsQuery($search: String!) {
    searchDividendReits(search: $search) {
      symbol
      name
      price
      dividend_yield
    }
  }`;

const searchDividendStocksQuery = `query SearchDividendStocksQuery($search: String!) {
    searchDividendStocks(search: $search) {
      symbol
      name
      price
      dividend_yield
    }
  }`;

const ASSET_TYPES = ["ETF", "REIT", "STOCK"];

const getTrueYield = (div_yield: string, expense: string) => {
  const yd: number = +div_yield.substring(0, div_yield.length - 1);
  const xp: number = +expense.substring(0, expense.length - 1);

  return (yd * 100 - xp * 100) / 100;
};

function App() {
  const [asset, setCurrentAsset] = useState<Asset | null>(null);
  const [assType, setAssType] = useState<string>(ASSET_TYPES[0]);

  const principalRef = useRef<HTMLInputElement>(null);

  const [yearly, setYearly] = useState<number | null>(null);
  const [monthly, setMonthly] = useState<number | null>(null);
  const [quarterly, setQuarterly] = useState<number | null>(null);
  const [DRIP, setDRIP] = useState<boolean>(false);
  const [dripMulti, setDripMulti] = useState<number | null>(null);
  const [DRIPQ, setDRIPQ] = useState<boolean>(false);
  const [dripMultiQ, setDripMultiQ] = useState<number | null>(null);

  const [searchEtf, setSearchEtf] = useState<string>("");
  const [searchReit, setSearchReit] = useState<string>("");
  const [searchStock, setSearchStock] = useState<string>("");

  const [etfData, setEtfData] = useState<any>(undefined);
  const [reitData, setReitData] = useState<any>(undefined);
  const [stockData, setStockData] = useState<any>(undefined);

  const [etfLoading, setEtfLoading] = useState(false);
  const [reitLoading, setReitLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);

  const getEtfData = useCallback(async () => {
    try {
      setEtfLoading(true);
      const res = await axios.post("/graphql", {
        query: searchDividendEtfsQuery,
        variables: { search: searchEtf },
      });
      setEtfData(res.data);
      setEtfLoading(false);
    } catch (error) {
      setEtfData(null);
      setEtfLoading(false);
    }
  }, [searchEtf]);

  const getReitData = useCallback(async () => {
    try {
      setReitLoading(true);
      const res = await axios.post("/graphql", {
        query: searchDividendReitsQuery,
        variables: { search: searchReit },
      });
      setReitData(res.data);
      setReitLoading(false);
    } catch (error) {
      setReitData(null);
      setReitLoading(false);
    }
  }, [searchReit]);

  const getStockData = useCallback(async () => {
    try {
      setStockLoading(true);
      const res = await axios.post("/graphql", {
        query: searchDividendStocksQuery,
        variables: { search: searchStock },
      });
      setStockData(res.data);
      setStockLoading(false);
    } catch (error) {
      setStockData(null);
      setStockLoading(false);
    }
  }, [searchStock]);

  useEffect(() => {
    getEtfData();
  }, [searchEtf, getEtfData]);

  useEffect(() => {
    getReitData();
  }, [searchReit, getReitData]);

  useEffect(() => {
    getStockData();
  }, [searchStock, getStockData]);

  useEffect(() => {
    setYearly(null);
    setMonthly(null);
    setQuarterly(null);
    setDRIP(false);
    setDripMulti(null);
    setDRIPQ(false);
    setDripMultiQ(null);
  }, [assType, asset]);

  const handleAssetChange = (event: SelectChangeEvent<string>) => {
    setAssType((state) => {
      switch (state) {
        case ASSET_TYPES[0]:
          setSearchEtf("");
          break;
        case ASSET_TYPES[1]:
          setSearchReit("");
          break;
        case ASSET_TYPES[2]:
          setSearchStock("");
          break;
        default:
          break;
      }
      return event.target.value;
    });
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
      const DRIPQ = monthlyGain * 4 >= asset.price;
      const multiQ = Math.floor((monthlyGain * 4) / asset.price);

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
            initialTerm={searchEtf}
            updateSearchTerm={debounce(setSearchEtf, 500)}
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
            initialTerm={searchStock}
            updateSearchTerm={debounce(setSearchStock, 500)}
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
            initialTerm={searchReit}
            updateSearchTerm={debounce(setSearchReit, 500)}
            setSelected={setCurrentAsset}
          ></Search>
        )}
      </div>

      {asset !== null ? (
        <div className="flex flex-col w-full items-center">
          <div className="flex flex-col md:flex-row justify-between items-center w-full">
            <div className="flex flex-col w-[80%] justify-center items-center p-2 m-5 border-2 bg-lime-200 border-green-700 text-green-700 rounded-md">
              <h1 className="text-lg underline">Information</h1>
              <AssetDetail label="Symbol" value={asset.symbol} />
              <AssetDetail label="Price" value={asset.price} />
              <AssetDetail
                label="Full Dividend Yield"
                value={asset.dividend_yield}
              />
              {asset.expense_ratio && (
                <AssetDetail
                  label="Expense Ratio"
                  value={asset.expense_ratio}
                />
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

            {yearly &&
            monthly &&
            quarterly &&
            dripMulti !== null &&
            dripMultiQ !== null ? (
              <div className="flex flex-col w-[80%] justify-center items-center p-2 m-5 border-2 bg-blue-300 border-blue-700 text-blue-700 rounded-md">
                <h1 className="text-lg underline">Results</h1>
                <AssetDetail label="Yearly" value={yearly} />
                <AssetDetail label="Monthly" value={monthly} />
                <AssetDetail label="Quarterly" value={monthly} />
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
            ) : (
              <div className="flex flex-col w-[80%] justify-center items-center p-2 m-5 border-2 bg-blue-300 border-blue-700 text-blue-700 rounded-md">
                <p className="text-center">Results will be displayed here</p>
              </div>
            )}
          </div>
          {yearly &&
            monthly &&
            quarterly &&
            dripMulti !== null &&
            dripMultiQ !== null && (
              <Compound
                principal={+principalRef.current?.value!}
                stockPrice={asset.price}
                dividendYield={
                  asset.expense_ratio
                    ? getTrueYield(asset.dividend_yield, asset.expense_ratio)
                    : +asset.dividend_yield.substring(
                        0,
                        asset.dividend_yield.length - 1
                      )
                }
              ></Compound>
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
