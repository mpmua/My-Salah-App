import { userPreferencesType } from "../../types/types";
import {
  defaultReasons,
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
} from "../../utils/constants";

import { TiDelete } from "react-icons/ti";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { VscDebugRestart } from "react-icons/vsc";
import {
  IonContent,
  IonHeader,
  IonModal,
  IonToolbar,
  isPlatform,
} from "@ionic/react";
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
      className={`${isPlatform("ios") ? "" : "modal-height"}`}
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
      <IonHeader className="px-2 mt-5">
        <IonToolbar
          style={{
            "--background": "var(--card-bg-color)",
            "--border-width": "0",
            paddingBottom: "0",
          }}
        >
          <section className="flex justify-between w-full">
            {" "}
            <section className="flex">
              <input
                aria-label="reason"
                className="p-1 rounded-md text-[var(--ion-text-color)] bg-[var(--textarea-bg-color)]"
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
                className="px-2 ml-2 text-white bg-blue-600 rounded-md"
                onClick={async () => {
                  if (newReasonInput.length === 0) return;
                  if (newReasonInput.includes(",")) {
                    showAlert(
                      "Invalid Reason",
                      "Reasons cannot contain commas",
                    );
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
                Add
              </button>
            </section>
            <button
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
              <VscDebugRestart className="text-2xl" />
            </button>
          </section>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {newReasonInput.length > 0 && (
          <motion.p
            layout
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              color: charCount === 0 ? "red" : "var(--ion-text-color)",
            }}
            className="pl-5 text-xs bg-[var(--card-bg-color)]"
          >
            {`${charCount} characters left`}
          </motion.p>
        )}

        <ul
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          className="pt-3 px-2 bg-[var(--card-bg-color)]"
        >
          <AnimatePresence>
            {userPreferences.reasons
              .sort((a, b) => a.localeCompare(b))
              .map((reason) => (
                <motion.li
                  className={`flex justify-between items-center bg-[var(--card-bg-color)] px-2 py-4 my-3 rounded-lg`}
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
                  <p
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
                    <TiDelete className="text-2xl" />
                  </p>
                </motion.li>
              ))}
          </AnimatePresence>
        </ul>
      </IonContent>
      {/* </section> */}
    </IonModal>
  );
};

export default BottomSheetEditReasons;
