import { Autocomplete, TextField } from "@mui/material";
import { useState } from "react";

interface ISearchUIProps {
  loading: boolean;
  data: any;
  selected: string | null;
  initialTerm: string;
  updateSearchTerm: (term: string) => void;
  setSelected: (sel: string) => void;
}

export const Search: React.FC<ISearchUIProps> = ({
  data,
  loading,
  initialTerm,
  selected,
  updateSearchTerm,
  setSelected,
}) => {
  const [term, setTerm] = useState(initialTerm);

  return (
    <Autocomplete
      className="w-[95%]"
      options={data || []}
      loading={loading}
      value={selected}
      onChange={(event: any, newValue: string | null) => {
        if (data.includes(newValue)) setSelected(newValue as string);
      }}
      inputValue={term}
      onInputChange={(e, newInputValue) => {
        updateSearchTerm(newInputValue);
        setTerm(newInputValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label="Search for ETFs" />
      )}
    />
  );
};
