import { userPreferencesType } from "../../types/types";
import {
  defaultReasons,
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
} from "../../utils/constants";

import { LuPlus, LuX } from "react-icons/lu";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { VscDebugRestart } from "react-icons/vsc";
import { IonContent, IonModal } from "@ionic/react";
import { Keyboard, KeyboardResize } from "@capacitor/keyboard";
import { Capacitor } from "@capacitor/core";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import {
  showAlert,
  showConfirmMsg,
  showToast,
  updateUserPrefs,
} from "../../utils/helpers";

interface BottomSheetStartDateProps {
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  triggerId: string;
  setUserPreferences: React.Dispatch<React.SetStateAction<userPreferencesType>>;
  userPreferences: userPreferencesType;
  // presentingElement: HTMLElement | null;
}

const BottomSheetEditReasons = ({
  dbConnection,
  triggerId,
  setUserPreferences,
  userPreferences,
}: // presentingElement,
BottomSheetStartDateProps) => {
  const CHAR_LIMIT = 20;
  const [charCount, setCharCount] = useState(CHAR_LIMIT);
  const [newReasonInput, setNewReasonInput] = useState("");

  // const configureResize = async () => {
  //   await Keyboard.setResizeMode({ mode: KeyboardResize.None });
  // };

  useEffect(() => {
    async function configureResize() {
      await Keyboard.setResizeMode({ mode: KeyboardResize.None });
    }
    if (Capacitor.isNativePlatform()) {
      configureResize();
    }
  }, []);

  return (
    <IonModal
      mode="ios"
      className="modal-height"
      // presentingElement={presentingElement!}
      // style={{ "--height": "95vh" }}
      // expandToScroll={false}
      // className="modal-fit-content"
      onWillDismiss={() => {
        setNewReasonInput("");
      }}
      trigger={triggerId}
      initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      breakpoints={MODAL_BREAKPOINTS}
    >
      {/* <section className="mx-4 mt-10 mb-10"> */}
      <IonContent className="[--background:var(--sheet-bg-color)]">
        <section className="px-5 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          <h1 className="mb-1 font-bold leading-tight">Edit Reasons</h1>
          <p className="text-[0.9375rem] leading-relaxed text-[var(--secondary-text-color)]">
            Manage reasons used when logging Salah.
          </p>
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-[color:var(--sheet-input-border-color)] bg-[var(--sheet-bg-color)] p-1.5 pl-4">
            <input
              aria-label="reason"
              placeholder="Add a reason"
              className="min-w-0 flex-1 bg-transparent placeholder:text-[var(--secondary-text-color)]"
              onChange={(e) => {
                if (e.target.value.length > CHAR_LIMIT) return;
                setNewReasonInput(e.target.value);
                setCharCount(CHAR_LIMIT - e.target.value.length);
              }}
              type="text"
              dir="auto"
              maxLength={CHAR_LIMIT}
              value={newReasonInput}
            ></input>
            <button
              aria-label="Add reason"
              className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--ion-color-primary)] text-white ${
                newReasonInput.length === 0 ? "opacity-40" : ""
              }`}
              onClick={async () => {
                if (newReasonInput.length === 0) return;
                if (newReasonInput.includes(",")) {
                  showAlert("Invalid Reason", "Reasons cannot contain commas");
                  return;
                }
                if (
                  userPreferences.reasons.some(
                    (item) =>
                      item.toLocaleLowerCase() ===
                      newReasonInput.toLocaleLowerCase(),
                  )
                ) {
                  showAlert("Duplicate Reason", "This reason already exists");
                  return;
                }
                const updatedReasons = [
                  ...userPreferences.reasons,
                  newReasonInput,
                ];
                await updateUserPrefs(
                  dbConnection,
                  "reasons",
                  updatedReasons,
                  setUserPreferences,
                );
                setNewReasonInput("");
                setCharCount(CHAR_LIMIT);
                showToast(`${newReasonInput} added`, "short");
              }}
            >
              <LuPlus className="text-2xl" />
            </button>
          </div>
          {newReasonInput.length > 0 && (
            <motion.p
              layout
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={`mt-1.5 pl-1 text-xs ${
                charCount === 0
                  ? "text-red-500"
                  : "text-[var(--secondary-text-color)]"
              }`}
            >
              {`${charCount} characters left`}
            </motion.p>
          )}

          <ul className="mt-5 flex flex-wrap gap-x-2.5 gap-y-2">
            <AnimatePresence>
              {userPreferences.reasons
                .sort((a, b) => a.localeCompare(b))
                .map((reason) => (
                  <motion.li
                    className="flex h-8 items-center gap-1 rounded-full border border-[color:var(--sheet-divider-color)] bg-[var(--sheet-pill-bg)] pl-3.5 text-sm"
                    layout
                    initial={{ x: 0 }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%", opacity: 0 }}
                    transition={{
                      // delay: 0.1,
                      duration: 0.3,
                      layout: { duration: 0.2 },
                    }}
                    key={reason}
                  >
                    <p>{reason}</p>
                    <button
                      aria-label={`Remove ${reason}`}
                      className="flex size-7 items-center justify-center"
                      onClick={async () => {
                        const modifiedReasons = userPreferences.reasons.filter(
                          (item) => item !== reason,
                        );
                        await updateUserPrefs(
                          dbConnection,
                          "reasons",
                          modifiedReasons,
                          setUserPreferences,
                        );
                      }}
                    >
                      <span className="flex size-[1.125rem] items-center justify-center rounded-full bg-[var(--sheet-group-bg)]">
                        <LuX className="text-base" />
                      </span>
                    </button>
                  </motion.li>
                ))}
            </AnimatePresence>
          </ul>
          <button
            className="mt-6 flex w-full items-center gap-3 border-t border-solid border-[color:var(--sheet-divider-color)] pt-4 text-left"
            onClick={async () => {
              const reasonConfirmMsgRes = await showConfirmMsg(
                "Reset Reasons?",
                "This will reset all reasons to the app’s default reasons. Are you sure you want to proceed?",
              );
              if (!reasonConfirmMsgRes) return;
              await updateUserPrefs(
                dbConnection,
                "reasons",
                defaultReasons.split(","),
                setUserPreferences,
              );
              showToast("Default Reasons Restored", "short");
            }}
          >
            <VscDebugRestart className="shrink-0 text-2xl text-[var(--secondary-text-color)]" />
            <span>
              <span className="font-semibold leading-snug">
                Restore default reasons
              </span>
              <span className="mt-0.5 block text-sm leading-snug text-[var(--secondary-text-color)]">
                Replace with the original list of reasons.
              </span>
            </span>
          </button>
        </section>
      </IonContent>
      {/* </section> */}
    </IonModal>
  );
};

export default BottomSheetEditReasons;
