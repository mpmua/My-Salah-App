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
    <section className="px-5 py-1">
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
              className={`flex gap-3 py-3 ${
                index > 0
                  ? "border-t border-[var(--app-border-color)]"
                  : ""
              }`}
              key={key}
            >
              <span className="flex items-center justify-center w-8 h-8 text-xs font-semibold rounded-full shrink-0 bg-[var(--sheet-option-bg)]">
                {index + 1}
              </span>
              <div className="min-w-0 grow">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`font-semibold ${
                      partialOrFull === "partial"
                        ? "truncate"
                        : "break-words"
                    }`}
                  >
                    {key}
                  </p>
                  <div className="flex items-center gap-2 text-xs whitespace-nowrap">
                    <span className="opacity-60">
                      {value} {value > 1 ? "times" : "time"}
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: salahStatusColorsHexCodes[status] }}
                    >
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="relative h-2 mt-2 overflow-hidden bg-[var(--reasons-bar-bg)] rounded-md">
                  <span
                    aria-hidden="true"
                    style={{
                      width: `${Math.round(percentage)}%`,
                      backgroundColor: salahStatusColorsHexCodes[status],
                    }}
                    className="absolute inset-y-0 left-0 rounded-md"
                  />
                </div>
              </div>
            </section>
          );
        })}
    </section>
  );
};

export default ReasonsList;
