import { IonModal, IonRadio, IonRadioGroup, isPlatform } from "@ionic/react";

import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { userPreferencesType } from "../../../types/types";
import {
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
} from "../../../utils/constants";
import { updateUserPrefs } from "../../../utils/helpers";

// import { CalculationMethod } from "adhan";

interface BottomSheetLatitudeRulesProps {
  triggerId: string;
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  setUserPreferences: React.Dispatch<React.SetStateAction<userPreferencesType>>;
  userPreferences: userPreferencesType;
}

const BottomSheetLatitudeRules = ({
  triggerId,
  dbConnection,
  setUserPreferences,
  userPreferences,
}: BottomSheetLatitudeRulesProps) => {
  return (
    <IonModal
      className="modal-fit-content"
      mode="ios"
      trigger={triggerId}
      initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      breakpoints={MODAL_BREAKPOINTS}
      // className={`${isPlatform("ios") ? "" : "modal-height"}`}
      // presentingElement={presentingElement!}
      // expandToScroll={false}
    >
      {/* <IonContent> */}
      <section className="ion-content-scroll-host max-h-[var(--sheet-max-height)] overflow-y-auto px-5 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <h1 className="mb-4 font-bold leading-tight">High latitude rule</h1>
        <IonRadioGroup value={userPreferences.highLatitudeRule}>
          <div className="divide-y divide-[color:var(--sheet-divider-color)]">
            <div
              onClick={async () => {
                await updateUserPrefs(
                  dbConnection,
                  "highLatitudeRule",
                  "middleofthenight",
                  setUserPreferences,
                );
              }}
            >
              <IonRadio
                mode={isPlatform("ios") ? "ios" : "md"}
                value="middleofthenight"
                labelPlacement="start"
                justify="space-between"
                className="pointer-events-none w-full py-3.5 text-base font-semibold leading-snug [--color:var(--secondary-text-color)] [&::part(label)]:whitespace-normal"
              >
                <span>
                  Middle of the night
                  <span className="mt-1 block text-sm font-normal leading-snug text-[var(--secondary-text-color)]">
                    Fajr will never be earlier than the middle of the night and
                    Isha will never be later than the middle of the night.
                  </span>
                </span>
              </IonRadio>
            </div>
            <div
              onClick={async () => {
                await updateUserPrefs(
                  dbConnection,
                  "highLatitudeRule",
                  "seventhofthenight",
                  setUserPreferences,
                );
              }}
            >
              <IonRadio
                mode={isPlatform("ios") ? "ios" : "md"}
                value="seventhofthenight"
                labelPlacement="start"
                justify="space-between"
                className="pointer-events-none w-full py-3.5 text-base font-semibold leading-snug [--color:var(--secondary-text-color)] [&::part(label)]:whitespace-normal"
              >
                <span>
                  Seventh of the night
                  <span className="mt-1 block text-sm font-normal leading-snug text-[var(--secondary-text-color)]">
                    Fajr will never be earlier than the beginning of the last
                    seventh of the night and Isha will never be later than the
                    end of the first seventh of the night. This is recommended
                    to use for locations above 48° latitude to prevent Salah
                    times that would be difficult to perform.
                  </span>
                </span>
              </IonRadio>
            </div>
            <div
              onClick={async () => {
                await updateUserPrefs(
                  dbConnection,
                  "highLatitudeRule",
                  "twilightangle",
                  setUserPreferences,
                );
              }}
            >
              <IonRadio
                mode={isPlatform("ios") ? "ios" : "md"}
                value="twilightangle"
                labelPlacement="start"
                justify="space-between"
                className="pointer-events-none w-full py-3.5 text-base font-semibold leading-snug [--color:var(--secondary-text-color)] [&::part(label)]:whitespace-normal"
              >
                <span>
                  Twilight angle
                  <span className="mt-1 block text-sm font-normal leading-snug text-[var(--secondary-text-color)]">
                    The night is divided into portions of roughly 1/3. The exact
                    value is derived by dividing the fajr/isha angles by 60.
                    This can be used to prevent difficult fajr and isha times at
                    certain locations.
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

export default BottomSheetLatitudeRules;
