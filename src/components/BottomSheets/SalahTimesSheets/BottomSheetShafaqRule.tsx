import { IonModal, IonRadio, IonRadioGroup, isPlatform } from "@ionic/react";

import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { userPreferencesType } from "../../../types/types";
import {
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
} from "../../../utils/constants";
import { updateUserPrefs } from "../../../utils/helpers";

// import { CalculationMethod } from "adhan";

interface BottomSheetShafaqRulesProps {
  setShowShafaqRulesSheet: React.Dispatch<React.SetStateAction<boolean>>;
  showShafaqRulesSheet: boolean;
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  setUserPreferences: React.Dispatch<React.SetStateAction<userPreferencesType>>;
  userPreferences: userPreferencesType;
}

const BottomSheetShafaqRules = ({
  //   triggerId,
  setShowShafaqRulesSheet,
  showShafaqRulesSheet,
  dbConnection,
  setUserPreferences,
  userPreferences,
}: BottomSheetShafaqRulesProps) => {
  return (
    <IonModal
      className="modal-fit-content"
      mode="ios"
      isOpen={showShafaqRulesSheet}
      //   trigger={triggerId}
      initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      breakpoints={MODAL_BREAKPOINTS}
      onDidDismiss={() => {
        setShowShafaqRulesSheet(false);
      }}
      // className={`${isPlatform("ios") ? "" : "modal-height"}`}
      // presentingElement={presentingElement!}
      // style={{ "--height": "95vh" }}
      // expandToScroll={false}
    >
      <section className="ion-content-scroll-host max-h-[var(--sheet-max-height)] overflow-y-auto px-5 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <h1 className="mb-1 font-bold leading-tight">Shafaq rule</h1>
        <p className="mb-4 text-[0.9375rem] leading-relaxed text-[var(--secondary-text-color)]">
          Shafaq is used to determine what type of twilight to use in order to
          determine the time for Isha.
        </p>
        <IonRadioGroup value={userPreferences.shafaqRule}>
          <div className="divide-y divide-[color:var(--sheet-divider-color)]">
            <div
              onClick={async () => {
                await updateUserPrefs(
                  dbConnection,
                  "shafaqRule",
                  "general",
                  setUserPreferences,
                );
              }}
            >
              <IonRadio
                mode={isPlatform("ios") ? "ios" : "md"}
                value="general"
                labelPlacement="start"
                justify="space-between"
                className="pointer-events-none w-full py-3.5 text-base font-semibold leading-snug [--color:var(--secondary-text-color)] [&::part(label)]:whitespace-normal"
              >
                <span>
                  General
                  <span className="mt-1 block text-sm font-normal leading-snug text-[var(--secondary-text-color)]">
                    General is a combination of Ahmer and Abyad. This is the
                    default value and will provide more reasonable times for
                    locations at higher latitudes.
                  </span>
                </span>
              </IonRadio>
            </div>
            <div
              onClick={async () => {
                await updateUserPrefs(
                  dbConnection,
                  "shafaqRule",
                  "ahmer",
                  setUserPreferences,
                );
              }}
            >
              <IonRadio
                mode={isPlatform("ios") ? "ios" : "md"}
                value="ahmer"
                labelPlacement="start"
                justify="space-between"
                className="pointer-events-none w-full py-3.5 text-base font-semibold leading-snug [--color:var(--secondary-text-color)] [&::part(label)]:whitespace-normal"
              >
                <span>
                  Ahmer
                  <span className="mt-1 block text-sm font-normal leading-snug text-[var(--secondary-text-color)]">
                    Ahmer means the twilight is the red glow in the sky. Used by
                    the Shafi, Maliki, and Hanbali madhabs. This generally
                    produces an earlier Isha time.
                  </span>
                </span>
              </IonRadio>
            </div>
            <div
              onClick={async () => {
                await updateUserPrefs(
                  dbConnection,
                  "shafaqRule",
                  "abyad",
                  setUserPreferences,
                );
              }}
            >
              <IonRadio
                mode={isPlatform("ios") ? "ios" : "md"}
                value="abyad"
                labelPlacement="start"
                justify="space-between"
                className="pointer-events-none w-full py-3.5 text-base font-semibold leading-snug [--color:var(--secondary-text-color)] [&::part(label)]:whitespace-normal"
              >
                <span>
                  Abyad
                  <span className="mt-1 block text-sm font-normal leading-snug text-[var(--secondary-text-color)]">
                    Abyad means the twilight is the white glow in the sky. Used
                    by the Hanafi madhab. This generally produces a later Isha
                    time.
                  </span>
                </span>
              </IonRadio>
            </div>
          </div>
        </IonRadioGroup>
      </section>
      {/* </IonContent> */}
    </IonModal>
  );
};

export default BottomSheetShafaqRules;
