import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineChevronRight } from "react-icons/hi2";
import { IonLabel, IonSegment, IonSegmentButton } from "@ionic/react";
import {
  reasonsToShowType,
  SalahNamesType,
  ReasonCountsByStatusType,
} from "../../types/types";
import ReasonsList from "./ReasonsList";

interface ReasonsCardProps {
  setReasonsToShow: React.Dispatch<React.SetStateAction<reasonsToShowType>>;
  setShowReasonsSheet: React.Dispatch<React.SetStateAction<boolean>>;
  reasonCountsByStatus: ReasonCountsByStatusType;
  salahStatusCounts: Record<keyof ReasonCountsByStatusType, number>;
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
  salahStatusCounts,
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
  const activeStatusCount = salahStatusCounts[activeStatus];
  const salahName = statsToShow === "All" ? "" : `${statsToShow} `;
  const statusDescription =
    activeStatus === "male-alone"
      ? `${salahName}Salah prayed alone`
      : activeStatus === "late"
        ? `${salahName}Salah performed late`
        : `missed ${salahName}Salah`;
  const emptyStateText =
    activeStatusCount === 0
      ? activeStatus === "male-alone"
        ? `No ${salahName}Salah prayed alone in this period`
        : activeStatus === "late"
          ? `No ${salahName}Salah performed late in this period`
          : `No missed ${salahName}Salah recorded in this period`
      : `No reasons were entered for ${statusDescription} in this period`;
  const subtitle =
    activeStatus === "male-alone"
      ? `Why you prayed ${salahName}Salah alone`
      : activeStatus === "late"
        ? `Why you prayed ${salahName}Salah late`
        : `Why you missed ${salahName}Salah`;

  return (
    <section className="mt-5 overflow-hidden text-sm bg-[var(--card-bg-color)] rounded-2xl">
      <section className="px-4 pt-1">
        <h2 className="mb-0 text-base font-semibold">Reasons</h2>
        <p className="mt-0.5 text-[0.8125rem] text-[var(--secondary-text-color)]">
          {subtitle}
        </p>
        <IonSegment
          className="mt-3 stats-period-segment ![--background:var(--sheet-option-bg)]"
          mode="ios"
          value={activeStatus}
          onIonChange={(e) => {
            setSelectedStatus(e.detail.value as keyof ReasonCountsByStatusType);
          }}
        >
          {statuses.map((status) => (
            <IonSegmentButton
              key={status}
              className="stats-period-segment-button !min-h-8"
              value={status}
            >
              <IonLabel>{statusLabels[status]}</IonLabel>
            </IonSegmentButton>
          ))}
        </IonSegment>
      </section>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeStatus}
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
              {emptyStateText}
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
        className={`flex items-center justify-between w-full px-4 py-3 font-medium text-blue-500 border-t border-[var(--app-border-color)] ${
          activeReasonCount > 3 ? "visible" : "invisible"
        }`}
      >
        <span>Show all {activeReasonCount} reasons</span>
        <HiOutlineChevronRight aria-hidden="true" />
      </button>
    </section>
  );
};

export default ReasonsCard;
