interface ExpandableProps {
  label: string;
  Details?: React.ReactNode;
  Contents?: React.ReactNode;
  isExpanded?: boolean;
  onOpen?: (label: string | null) => void;
}

export default function Expandable({
  Details,
  Contents,
  isExpanded = false,
}: ExpandableProps) {
  return (
    <>
      {Details}
      <div className={`expandable ${isExpanded ? "open" : ""}`}>
        <div className="expandable-inner">
          <s-box>{Contents ?? <h1 className="m-2">No Content</h1>}</s-box>
        </div>
      </div>
    </>
  );
}
