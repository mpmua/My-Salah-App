import { IonButton, IonModal } from "@ionic/react";
import { LuCalendar, LuListChecks } from "react-icons/lu";
import { useRef } from "react";
import {
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
} from "../../utils/constants";

interface BottomSheetSettingsTipsProps {
  showSettingsTipsSheet: boolean;
  setShowSettingsTipsSheet: React.Dispatch<React.SetStateAction<boolean>>;
}

const exampleSettings = [
  {
    icon: LuCalendar,
    label: "Change Start Date",
    description: "Set the date to start tracking",
  },
  {
    icon: LuListChecks,
    label: "Bulk update Salah",
    description: "Update years or decades of history at once",
  },
];

const BottomSheetSettingsTips = ({
  showSettingsTipsSheet,
  setShowSettingsTipsSheet,
}: BottomSheetSettingsTipsProps) => {
  const modal = useRef<HTMLIonModalElement>(null);

  return (
    <IonModal
      ref={modal}
      mode="ios"
      expandToScroll={false}
      className="modal-fit-content"
      isOpen={showSettingsTipsSheet}
      onDidDismiss={() => {
        setShowSettingsTipsSheet(false);
      }}
      initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      breakpoints={MODAL_BREAKPOINTS}
    >
      <section className="ion-content-scroll-host max-h-[var(--sheet-max-height)] overflow-y-auto px-5 pt-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-[var(--ion-text-color)]">
        <h1 className="mb-1.5 mt-0 text-[1.625rem] font-bold leading-tight">
          Good to know
        </h1>
        <p className="text-[0.9375rem] leading-relaxed text-[var(--secondary-text-color)]">
          You can change your start date and update a few days, years or even
          decades of history at once, any time, from the Settings page.
        </p>
        <div
          aria-hidden="true"
          className="mt-5 rounded-[1.125rem] bg-[var(--sheet-group-bg)] p-3.5"
        >
          <p className="mb-3 text-xs text-[var(--secondary-text-color)]">
            Settings
          </p>
          <div className="flex flex-col gap-3.5">
            {exampleSettings.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--sheet-bg-color)] text-[var(--secondary-text-color)]">
                  <item.icon className="text-lg" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.9375rem] font-semibold">{item.label}</p>
                  <p className="text-sm text-[var(--secondary-text-color)]">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <IonButton
          expand="block"
          className="m-0 mt-6 font-semibold"
          onClick={() => modal.current?.dismiss()}
        >
          Got it
        </IonButton>
      </section>
    </IonModal>
  );
};

export default BottomSheetSettingsTips;
