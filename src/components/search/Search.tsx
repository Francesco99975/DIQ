import { Autocomplete, TextField } from "@mui/material";
import { useState } from "react";
import Asset from "../../types/asset";

interface ISearchUIProps {
  loading: boolean;
  data: Array<Asset>;
  initialTerm: string;
  updateSearchTerm: (term: string) => void;
  setSelected: (sel: Asset) => void;
  label: string;
}

export const Search: React.FC<ISearchUIProps> = ({
  data,
  loading,
  initialTerm,
  updateSearchTerm,
  setSelected,
  label,
}) => {
  const [term, setTerm] = useState(initialTerm);

  return (
    <Autocomplete
      className="w-[95%] md:w-[75%] m-2"
      options={data.map((x) => x.name) || []}
      loading={loading}
      value={term}
      onChange={(event: any, newValue: string | null) => {
        if (data.map((x) => x.name).includes(newValue!))
          setSelected(data.find((x) => x.name === newValue!)!);
      }}
      inputValue={term}
      onInputChange={(e, newInputValue) => {
        updateSearchTerm(newInputValue);
        setTerm(newInputValue);
      }}
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
};
