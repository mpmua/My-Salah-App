import {
  IonModal,
  IonPicker,
  IonPickerColumn,
  IonPickerColumnOption,
  isPlatform,
} from "@ionic/react";

import { SQLiteDBConnection } from "@capacitor-community/sqlite";

import { useState } from "react";
import {
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
} from "../../../utils/constants";
import { userPreferencesType } from "../../../types/types";
import { updateUserPrefs } from "../../../utils/helpers";

interface BottomSheetCustomAnglesProps {
  setShowCustomAnglesSheet: React.Dispatch<React.SetStateAction<boolean>>;
  showCustomAnglesSheet: boolean;
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  setUserPreferences: React.Dispatch<React.SetStateAction<userPreferencesType>>;
  userPreferences: userPreferencesType;
  customAngleSalah: "fajrAngle" | "ishaAngle";
}

const BottomSheetCustomAngles = ({
  setShowCustomAnglesSheet,
  showCustomAnglesSheet,
  dbConnection,
  setUserPreferences,
  userPreferences,
  customAngleSalah,
}: BottomSheetCustomAnglesProps) => {
  const [increment, setIncrement] = useState(userPreferences[customAngleSalah]);

  const angleOptions = Array.from({ length: 181 }, (_, i) =>
    (7 + i / 10).toString(),
  );

  return (
    <IonModal
      className="modal-fit-content"
      mode="ios"
      isOpen={showCustomAnglesSheet}
      initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      breakpoints={MODAL_BREAKPOINTS}
      onWillPresent={() => {
        setIncrement(userPreferences[customAngleSalah]);
      }}
      onWillDismiss={async () => {
        // if (!customAdjustmentSalah) return;
        await updateUserPrefs(
          dbConnection,
          customAngleSalah,
          String(increment),
          setUserPreferences,
        );
        setIncrement("0");
      }}
      onDidDismiss={() => {
        setShowCustomAnglesSheet(false);
      }}
    >
      <section className="ion-content-scroll-host max-h-[var(--sheet-max-height)] overflow-y-auto px-5 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <h1 className="mb-1 font-bold leading-tight">
          {customAngleSalah === "fajrAngle" ? "Fajr angle" : "Isha angle"}
        </h1>
        <p className="mb-4 text-[0.9375rem] leading-relaxed text-[var(--secondary-text-color)]">
          The sun's angle below the horizon used for{" "}
          {customAngleSalah === "fajrAngle" ? "Fajr" : "Isha"}.
        </p>
        <IonPicker mode={isPlatform("ios") ? "ios" : "md"}>
          <IonPickerColumn
            value={increment}
            onIonChange={({ detail }) => {
              setIncrement(String(detail.value));
            }}
          >
            {angleOptions.map((item) => {
              return (
                <IonPickerColumnOption key={item} value={item}>
                  {item}°
                </IonPickerColumnOption>
              );
            })}
          </IonPickerColumn>
        </IonPicker>
        <p className="mt-4 text-center text-sm text-[var(--secondary-text-color)]">
          Saved when you close this sheet.
        </p>
      </section>
    </IonModal>
  );
};

export default BottomSheetCustomAngles;
