import { IonModal, IonRadio, IonRadioGroup, isPlatform } from "@ionic/react";

import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { userPreferencesType } from "../../../types/types";
import {
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
} from "../../../utils/constants";
import { updateUserPrefs } from "../../../utils/helpers";

// import { CalculationMethod } from "adhan";

interface BottomSheetPolarCircleSettingProps {
  triggerId: string;
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  setUserPreferences: React.Dispatch<React.SetStateAction<userPreferencesType>>;
  userPreferences: userPreferencesType;
}

const BottomSheetPolarCircleSetting = ({
  triggerId,
  dbConnection,
  setUserPreferences,
  userPreferences,
}: BottomSheetPolarCircleSettingProps) => {
  return (
    <IonModal
      className="modal-fit-content"
      mode="ios"
      trigger={triggerId}
      initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      breakpoints={MODAL_BREAKPOINTS}

      // className={`${isPlatform("ios") ? "" : "modal-height"}`}
      // presentingElement={presentingElement!}
      // style={{ "--height": "95vh" }}
      // expandToScroll={false}
    >
      {/* <IonContent> */}
      <section className="ion-content-scroll-host max-h-[var(--sheet-max-height)] overflow-y-auto px-5 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <h1 className="mb-1 font-bold leading-tight">
          Polar circle resolution
        </h1>
        <p className="mb-4 text-[0.9375rem] leading-relaxed text-[var(--secondary-text-color)]">
          This setting is intended for users in polar regions or with advanced
          knowledge of Salah calculation methods. For most users, it will not
          have any effect. Only change this if you understand how it works, as
          incorrect settings can affect your Salah times.
        </p>
        <IonRadioGroup value={userPreferences.polarCircleResolution}>
          <div className="divide-y divide-[color:var(--sheet-divider-color)]">
            <div
              onClick={async () => {
                await updateUserPrefs(
                  dbConnection,
                  "polarCircleResolution",
                  "Unresolved",
                  setUserPreferences,
                );
              }}
            >
              <IonRadio
                mode={isPlatform("ios") ? "ios" : "md"}
                value="Unresolved"
                labelPlacement="start"
                justify="space-between"
                className="pointer-events-none w-full py-3.5 text-base font-semibold leading-snug [--color:var(--secondary-text-color)] [&::part(label)]:whitespace-normal"
              >
                <span>
                  Unresolved (default)
                  <span className="mt-1 block text-sm font-normal leading-snug text-[var(--secondary-text-color)]">
                    Leaves sunrise and sunset Salah times undefined when they
                    can't be computed
                  </span>
                </span>
              </IonRadio>
            </div>
            <div
              onClick={async () => {
                await updateUserPrefs(
                  dbConnection,
                  "polarCircleResolution",
                  "AqrabBalad",
                  setUserPreferences,
                );
              }}
            >
              <IonRadio
                mode={isPlatform("ios") ? "ios" : "md"}
                value="AqrabBalad"
                labelPlacement="start"
                justify="space-between"
                className="pointer-events-none w-full py-3.5 text-base font-semibold leading-snug [--color:var(--secondary-text-color)] [&::part(label)]:whitespace-normal"
              >
                <span>
                  Closest city
                  <span className="mt-1 block text-sm font-normal leading-snug text-[var(--secondary-text-color)]">
                    Finds the closest location for which sunrise and sunset
                    Salah times can be computed
                  </span>
                </span>
              </IonRadio>
            </div>
            <div
              onClick={async () => {
                await updateUserPrefs(
                  dbConnection,
                  "polarCircleResolution",
                  "AqrabYaum",
                  setUserPreferences,
                );
              }}
            >
              <IonRadio
                mode={isPlatform("ios") ? "ios" : "md"}
                value="AqrabYaum"
                labelPlacement="start"
                justify="space-between"
                className="pointer-events-none w-full py-3.5 text-base font-semibold leading-snug [--color:var(--secondary-text-color)] [&::part(label)]:whitespace-normal"
              >
                <span>
                  Closest date
                  <span className="mt-1 block text-sm font-normal leading-snug text-[var(--secondary-text-color)]">
                    Finds the closest date (forward or backward) for which
                    sunrise and sunset Salah times can be computed
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

export default BottomSheetPolarCircleSetting;
