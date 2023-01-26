interface IDetailProps {
  label: string;
  value: string;
}

const EtfDetail: React.FC<IDetailProps> = ({ label, value }) => {
  return (
    <div className="flex justify-between items-center w-full">
      <span>{label}</span> <span>{value}</span>
    </div>
  );
};

export default EtfDetail;
