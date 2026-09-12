import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineChevronRight } from "react-icons/hi2";
import {
  reasonsToShowType,
  SalahNamesType,
  ReasonCountsByStatusType,
} from "../../types/types";
import { salahStatusColorsHexCodes } from "../../utils/constants";
import ReasonsList from "./ReasonsList";

interface ReasonsCardProps {
  setReasonsToShow: React.Dispatch<React.SetStateAction<reasonsToShowType>>;
  setShowReasonsSheet: React.Dispatch<React.SetStateAction<boolean>>;
  reasonCountsByStatus: ReasonCountsByStatusType;
  statuses: (keyof ReasonCountsByStatusType)[];
  statsToShow: SalahNamesType | "All";
}

const statusLabels: Record<keyof ReasonCountsByStatusType, string> = {
  "male-alone": "Alone",
  late: "Late",
  missed: "Missed",
};

const ReasonsCard = ({
  setReasonsToShow,
  setShowReasonsSheet,
  reasonCountsByStatus,
  statuses,
  statsToShow,
}: ReasonsCardProps) => {
  const [selectedStatus, setSelectedStatus] = useState<
    keyof ReasonCountsByStatusType
  >(statuses[0] ?? "late");

  const activeStatus = statuses.includes(selectedStatus)
    ? selectedStatus
    : statuses[0];

  if (!activeStatus) {
    return null;
  }

  const activeReasonCount = Object.keys(
    reasonCountsByStatus[activeStatus],
  ).length;
  const salahName = statsToShow === "All" ? "" : `${statsToShow} `;
  const heading =
    activeStatus === "male-alone"
      ? `Top Reasons For Praying ${salahName}Salah Alone`
      : activeStatus === "late"
        ? `Top Reasons For Praying ${salahName}Salah Late`
        : `Top Reasons For Missing ${salahName}Salah`;

  return (
    <section className="mt-5 overflow-hidden text-sm bg-[var(--card-bg-color)] rounded-2xl">
      <h2 className="px-4 pt-4 text-base font-semibold text-center min-h-20">
        {heading}
      </h2>

      <div
        role="tablist"
        aria-label="Reason status"
        className="flex px-4 mt-2 border-b border-[var(--app-border-color)]"
      >
        {statuses.map((status) => {
          const isSelected = status === activeStatus;

          return (
            <button
              key={status}
              id={`reasons-tab-${status}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={`reasons-panel-${status}`}
              onClick={() => setSelectedStatus(status)}
              style={
                isSelected
                  ? { color: salahStatusColorsHexCodes[status] }
                  : undefined
              }
              className={`relative flex-1 min-h-11 -mb-px font-medium ${
                isSelected ? "" : "opacity-60"
              }`}
            >
              {statusLabels[status]}
              {isSelected && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 w-16 h-0.5 -translate-x-1/2 rounded-full left-1/2"
                  style={{ backgroundColor: salahStatusColorsHexCodes[status] }}
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeStatus}
          id={`reasons-panel-${activeStatus}`}
          role="tabpanel"
          aria-labelledby={`reasons-tab-${activeStatus}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="min-h-44"
        >
          {activeReasonCount > 0 ? (
            <ReasonsList
              reasonCountsByStatus={reasonCountsByStatus}
              status={activeStatus}
              partialOrFull="partial"
            />
          ) : (
            <p className="flex items-center justify-center px-4 text-center min-h-40 opacity-60">
              No reasons entered for Salah which were{" "}
              {activeStatus === "male-alone"
                ? "prayed alone"
                : activeStatus === "late"
                  ? "performed late"
                  : "missed"}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        disabled={activeReasonCount <= 3}
        onClick={() => {
          setReasonsToShow(activeStatus);
          setShowReasonsSheet(true);
        }}
        className={`flex items-center justify-between w-full px-4 py-3 text-blue-500 border-t border-[var(--app-border-color)] ${
          activeReasonCount > 3 ? "visible" : "invisible"
        }`}
      >
        <span>Show all</span>
        <HiOutlineChevronRight aria-hidden="true" />
      </button>
    </section>
  );
};

export default ReasonsCard;
