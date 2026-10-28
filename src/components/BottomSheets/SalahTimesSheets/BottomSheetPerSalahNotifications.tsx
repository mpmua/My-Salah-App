import { IonModal, IonRadio, IonRadioGroup, isPlatform } from "@ionic/react";

import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import {
  LocationsDataObjTypeArr,
  SalahNamesTypeAdhanLibrary,
  userPreferencesType,
} from "../../../types/types";
import {
  cancelNotifications,
  scheduleSalahNotifications,
  updateUserPrefs,
  upperCaseFirstLetter,
} from "../../../utils/helpers";

import {
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
} from "../../../utils/constants";
import { Capacitor } from "@capacitor/core";

interface BottomSheetPerSalahNotificationsProps {
  setShowSalahNotificationsSheet: React.Dispatch<React.SetStateAction<boolean>>;
  showSalahNotificationsSheet: boolean;
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  selectedSalah: SalahNamesTypeAdhanLibrary;
  setUserPreferences: React.Dispatch<React.SetStateAction<userPreferencesType>>;
  userPreferences: userPreferencesType;
  userLocations: LocationsDataObjTypeArr;
}

const BottomSheetPerSalahNotifications = ({
  setShowSalahNotificationsSheet,
  showSalahNotificationsSheet,
  dbConnection,
  selectedSalah,
  setUserPreferences,
  userPreferences,
  userLocations,
}: BottomSheetPerSalahNotificationsProps) => {
  const key: keyof userPreferencesType = `${selectedSalah}Notification`;

  return (
    <IonModal
      className="modal-fit-content"
      mode="ios"
      isOpen={showSalahNotificationsSheet}
      initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      breakpoints={MODAL_BREAKPOINTS}
      onDidDismiss={() => {
        setShowSalahNotificationsSheet(false);
      }}
      // style={{ "--height": "80vh" }}
    >
      {/* <IonContent > */}
      <section className="ion-content-scroll-host max-h-[var(--sheet-max-height)] overflow-y-auto px-5 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <h1 className="mb-4 font-bold leading-tight">
          {upperCaseFirstLetter(selectedSalah)} Notifications
        </h1>
        <IonRadioGroup
          value={userPreferences[key as keyof userPreferencesType]}
        >
          <div className="divide-y divide-[color:var(--sheet-divider-color)]">
            <div
              onClick={async () => {
                await updateUserPrefs(
                  dbConnection,
                  key,
                  "off",
                  setUserPreferences,
                );
                await cancelNotifications(selectedSalah);
              }}
            >
              <IonRadio
                mode={isPlatform("ios") ? "ios" : "md"}
                value="off"
                labelPlacement="start"
                justify="space-between"
                className="pointer-events-none w-full py-3.5 text-base font-semibold leading-snug [--color:var(--secondary-text-color)] [&::part(label)]:whitespace-normal"
              >
                <span>
                  Silent
                  <span className="mt-1 block text-sm font-normal leading-snug text-[var(--secondary-text-color)]">
                    No notifications
                  </span>
                </span>
              </IonRadio>
            </div>
            <div
              onClick={async () => {
                if (!userLocations) {
                  console.error("userLocations is undefined");
                  return;
                }

                await cancelNotifications(selectedSalah);

                await updateUserPrefs(
                  dbConnection,
                  key,
                  "on",
                  setUserPreferences,
                );

                await scheduleSalahNotifications(
                  userLocations,
                  selectedSalah,
                  userPreferences,
                  "on",
                );

                // await handleBatteryOptimisation();
              }}
            >
              <IonRadio
                mode={isPlatform("ios") ? "ios" : "md"}
                value="on"
                labelPlacement="start"
                justify="space-between"
                className="pointer-events-none w-full py-3.5 text-base font-semibold leading-snug [--color:var(--secondary-text-color)] [&::part(label)]:whitespace-normal"
              >
                <span>
                  On
                  <span className="mt-1 block text-sm font-normal leading-snug text-[var(--secondary-text-color)]">
                    Banner with system sound
                  </span>
                </span>
              </IonRadio>
            </div>
            {selectedSalah !== "sunrise" && (
              <div
                onClick={async () => {
                  if (!userLocations) {
                    console.error("userLocations is undefined");
                    return;
                  }

                  await cancelNotifications(selectedSalah);

                  await updateUserPrefs(
                    dbConnection,
                    key,
                    "adhan",
                    setUserPreferences,
                  );

                  await scheduleSalahNotifications(
                    userLocations,
                    selectedSalah,
                    userPreferences,
                    "adhan",
                  );

                  // await handleBatteryOptimisation();
                }}
              >
                <IonRadio
                  mode={isPlatform("ios") ? "ios" : "md"}
                  value="adhan"
                  labelPlacement="start"
                  justify="space-between"
                  className="pointer-events-none w-full py-3.5 text-base font-semibold leading-snug [--color:var(--secondary-text-color)] [&::part(label)]:whitespace-normal"
                >
                  <span>
                    Adhan
                    <span className="mt-1 block text-sm font-normal leading-snug text-[var(--secondary-text-color)]">
                      Adhan by Mishary Rashid Al-Afasy, with banner
                    </span>
                  </span>
                </IonRadio>
              </div>
            )}
          </div>
        </IonRadioGroup>
        {Capacitor.getPlatform() === "ios" && (
          <p className="mt-4 text-sm leading-snug text-[var(--secondary-text-color)]">
            On iPhone, the adhan only plays for up to 30 seconds.
          </p>
        )}
      </section>

      {/* </IonContent> */}
    </IonModal>
  );
};

export default BottomSheetPerSalahNotifications;
