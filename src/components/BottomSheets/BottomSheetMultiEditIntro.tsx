import { IonButton, IonModal } from "@ionic/react";
import { motion } from "framer-motion";
import { LuCheck } from "react-icons/lu";
import { useRef } from "react";
import {
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
  salahStatusColorsHexCodes,
} from "../../utils/constants";

interface BottomSheetMultiEditIntroProps {
  showMultiEditIntroSheet: boolean;
  setShowSingleCellHint: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMultiEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const exampleDays = [
  { day: "Mon", selected: [0, 2] },
  { day: "Sun", selected: [0, 2] },
  { day: "Sat", selected: [0] },
];

const selectionOrder = exampleDays.flatMap((item) =>
  item.selected.map((column) => `${item.day}-${column}`),
);

const BottomSheetMultiEditIntro = ({
  showMultiEditIntroSheet,
  setShowSingleCellHint,
  setIsMultiEditMode,
}: BottomSheetMultiEditIntroProps) => {
  const modal = useRef<HTMLIonModalElement>(null);

  return (
    <IonModal
      ref={modal}
      mode="ios"
      expandToScroll={false}
      className="modal-fit-content"
      isOpen={showMultiEditIntroSheet}
      onDidDismiss={() => {
        setShowSingleCellHint(true);
      }}
      initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      breakpoints={MODAL_BREAKPOINTS}
    >
      <section className="ion-content-scroll-host max-h-[var(--sheet-max-height)] overflow-y-auto px-5 pt-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-[var(--ion-text-color)]">
        <h1 className="mb-1.5 mt-0 text-[1.625rem] font-bold leading-tight">
          Update many Salah at once
        </h1>
        <p className="text-[0.9375rem] leading-relaxed text-[var(--secondary-text-color)]">
          Select several Salah, even across different days, and set them all in
          one go.
        </p>
        <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--secondary-text-color)]">
          Example
        </p>
        <div
          aria-hidden="true"
          className="rounded-2xl bg-[var(--sheet-group-bg)] px-3.5 py-4"
        >
          <div className="grid grid-cols-[2.75rem_repeat(5,1fr)] items-center justify-items-center gap-y-2.5">
            <span />
            {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map((salah) => (
              <span
                key={salah}
                className="text-[0.6875rem] text-[var(--secondary-text-color)]"
              >
                {salah}
              </span>
            ))}
            {exampleDays.map((item) => (
              <div key={item.day} className="contents">
                <span className="justify-self-start text-[0.8125rem] font-semibold">
                  {item.day}
                </span>
                {[0, 1, 2, 3, 4].map((column) => {
                  const isSelected = item.selected.includes(column);
                  const tickDelay =
                    0.5 + selectionOrder.indexOf(`${item.day}-${column}`) * 0.3;

                  return (
                    <motion.div
                      key={column}
                      initial={{
                        backgroundColor: "var(--multi-edit-tile-color)",
                      }}
                      animate={
                        isSelected
                          ? {
                              backgroundColor: salahStatusColorsHexCodes.group,
                            }
                          : undefined
                      }
                      transition={{ delay: 2.4, duration: 0.3 }}
                      className="relative flex size-9 items-center justify-center rounded-[0.625rem] border border-[var(--multi-edit-tile-border-color)]"
                    >
                      <motion.span
                        animate={isSelected ? { opacity: 0 } : undefined}
                        transition={{ delay: 2.4, duration: 0.3 }}
                        className="size-1.5 rounded-full bg-[var(--table-dot-icon-color)]"
                      />
                      {isSelected && (
                        <motion.span
                          animate={{ opacity: 0 }}
                          transition={{ delay: 2.4, duration: 0.3 }}
                          className="absolute -inset-px"
                        >
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: tickDelay, duration: 0.15 }}
                            className="absolute inset-0 rounded-[0.625rem] border-2 border-[var(--multi-edit-accent-color)]"
                          />
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: tickDelay }}
                            className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-[var(--multi-edit-accent-color)] text-[0.625rem] text-white"
                          >
                            <LuCheck />
                          </motion.span>
                        </motion.span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
          <p className="mx-auto mt-3.5 w-fit rounded-full bg-[var(--multi-edit-chip-color)] px-3.5 py-1.5 text-[0.8125rem] font-semibold text-[var(--multi-edit-chip-text-color)]">
            Set status for 5
          </p>
        </div>
        <IonButton
          expand="block"
          className="m-0 mt-6 font-semibold"
          onClick={() => {
            setIsMultiEditMode(true);
            modal.current?.dismiss();
          }}
        >
          Try it now
        </IonButton>
        <IonButton
          expand="block"
          fill="clear"
          className="m-0 mt-2 font-semibold [--color:var(--current-salah-color)]"
          onClick={() => modal.current?.dismiss()}
        >
          Maybe later
        </IonButton>
      </section>
    </IonModal>
  );
};

export default BottomSheetMultiEditIntro;
