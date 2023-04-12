import { NumericFormat } from "react-number-format";

interface IDetailProps {
  label?: string;
  value: number | string;
}

const AssetDetail: React.FC<IDetailProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center w-full">
      {label ? <span>{label} </span> : ""}
      {typeof value === "number" ? (
        <NumericFormat
          value={value}
          thousandSeparator=","
          decimalScale={2}
          fixedDecimalScale
          prefix="$"
          displayType="text"
        ></NumericFormat>
      ) : (
        <span>{value}</span>
      )}
    </div>
  );
};

export default AssetDetail;
