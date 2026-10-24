import {
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
} from "../../utils/constants";
import {
  reasonsToShowType,
  ReasonCountsByStatusType,
  SalahNamesType,
} from "../../types/types";
import ReasonsList from "../Stats/ReasonsList";
import { IonContent, IonModal } from "@ionic/react";

interface BottomSheetReasonsProps {
  // triggerId: string;
  setShowReasonsSheet: React.Dispatch<React.SetStateAction<boolean>>;
  showReasonsSheet: boolean;
  reasonCountsByStatus: ReasonCountsByStatusType;
  status: reasonsToShowType;
  statsToShow: SalahNamesType | "All";
}

const BottomSheetReasons = ({
  // triggerId,
  reasonCountsByStatus,
  status,
  setShowReasonsSheet,
  showReasonsSheet,
  statsToShow,
}: BottomSheetReasonsProps) => {
  const salahName = statsToShow === "All" ? "" : `${statsToShow} `;

  return (
    <IonModal
      mode="ios"
      className="modal-height"
      isOpen={showReasonsSheet}
      onDidDismiss={() => {
        setShowReasonsSheet(false);
      }}
      // trigger={triggerId}
      initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      breakpoints={MODAL_BREAKPOINTS}
    >
      <IonContent className="[--background:var(--sheet-bg-color)]">
        {status && (
          <section className="pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
            <h1 className="px-5 mb-1 font-bold leading-tight">Reasons</h1>
            <p className="px-5 mb-4 text-[0.9375rem] leading-relaxed text-[var(--secondary-text-color)]">
              {status === "male-alone"
                ? `Why you prayed ${salahName}Salah alone`
                : status === "late"
                  ? `Why you prayed ${salahName}Salah late`
                  : status === "missed"
                    ? `Why you missed ${salahName}Salah`
                    : ""}
            </p>
            <ReasonsList
              reasonCountsByStatus={reasonCountsByStatus}
              status={status}
              partialOrFull="full"
            />
          </section>
        )}
      </IonContent>
    </IonModal>
  );
};

export default BottomSheetReasons;
