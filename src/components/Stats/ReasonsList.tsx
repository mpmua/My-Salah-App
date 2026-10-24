import { salahStatusColorsHexCodes } from "../../utils/constants";
import { ReasonCountsByStatusType } from "../../types/types";

interface ReasonsListProps {
  reasonCountsByStatus: ReasonCountsByStatusType;
  status: "male-alone" | "late" | "missed";
  partialOrFull: "partial" | "full";
}

const ReasonsList = ({
  reasonCountsByStatus,
  status,
  partialOrFull,
}: ReasonsListProps) => {
  const reasonsSum = Object.values(reasonCountsByStatus[status]).reduce(
    (acc, total) => acc + total,
    0,
  );

  return (
    <section className={partialOrFull === "partial" ? "px-4 py-1" : "px-5 py-1"}>
      {Object.entries(reasonCountsByStatus[status])
        .slice(
          0,
          partialOrFull === "partial"
            ? 3
            : Object.entries(reasonCountsByStatus[status]).length,
        )
        .map(([key, value], index) => {
          const percentage = (value / reasonsSum) * 100;

          return (
            <section
              className={`py-3 ${
                index > 0
                  ? "border-t border-[var(--app-border-color)]"
                  : ""
              }`}
              key={key}
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="min-w-0 text-[0.9375rem] font-medium break-words">
                  {key}
                </p>
                <p className="text-[0.8125rem] whitespace-nowrap text-[var(--secondary-text-color)]">
                  {value} {value > 1 ? "times" : "time"}
                  <span className="ml-1.5 font-semibold text-[var(--ion-text-color)]">
                    {percentage.toFixed(1)}%
                  </span>
                </p>
              </div>
              <div className="h-1.5 mt-2 overflow-hidden rounded-full bg-[var(--reasons-bar-bg)]">
                <span
                  aria-hidden="true"
                  style={{
                    width: `${Math.round(percentage)}%`,
                    backgroundColor: salahStatusColorsHexCodes[status],
                  }}
                  className="block h-full rounded-full"
                />
              </div>
            </section>
          );
        })}
    </section>
  );
};

export default ReasonsList;
