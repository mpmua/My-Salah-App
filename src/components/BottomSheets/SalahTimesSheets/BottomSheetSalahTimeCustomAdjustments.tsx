import {
  IonModal,
  IonPicker,
  IonPickerColumn,
  IonPickerColumnOption,
  isPlatform,
} from "@ionic/react";

import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { useState } from "react";
import { userPreferencesType } from "../../../types/types";
import {
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
} from "../../../utils/constants";
import { formatNumberWithSign, updateUserPrefs } from "../../../utils/helpers";

interface BottomSheetSalahTimeCustomAdjustmentsProps {
  getDefaultAdjustments: () => {
    fajrAdjustment: number;
    dhuhrAdjustment: number;
    asrAdjustment: number;
    maghribAdjustment: number;
    ishaAdjustment: number;
  };
  setShowCustomAdjustmentsSheet: React.Dispatch<React.SetStateAction<boolean>>;
  showCustomAdjustmentsSheet: boolean;
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  setUserPreferences: React.Dispatch<React.SetStateAction<userPreferencesType>>;
  userPreferences: userPreferencesType;
  customAdjustmentSalah:
    | "fajrAdjustment"
    | "dhuhrAdjustment"
    | "asrAdjustment"
    | "maghribAdjustment"
    | "ishaAdjustment";
}

const BottomSheetSalahTimeCustomAdjustments = ({
  getDefaultAdjustments,
  showCustomAdjustmentsSheet,
  dbConnection,
  setUserPreferences,
  userPreferences,
  setShowCustomAdjustmentsSheet,
  customAdjustmentSalah,
}: BottomSheetSalahTimeCustomAdjustmentsProps) => {
  const [totalAdjustedValue, setTotalAdjustedValue] = useState("0");
  const [userAdjustedValue, setUserAdjustedValue] = useState<null | number>(
    null,
  );

  const salahMap = {
    fajrAdjustment: "Fajr",
    dhuhrAdjustment: "Dhuhr",
    asrAdjustment: "Asr",
    maghribAdjustment: "Maghrib",
    ishaAdjustment: "Isha",
  };

  const customAdjustmentsArr = [];
  for (let i = -60; i <= 60; i++) {
    customAdjustmentsArr.push(String(i));
  }

  return (
    <IonModal
      className="modal-fit-content"
      mode="ios"
      isOpen={showCustomAdjustmentsSheet}
      initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      breakpoints={MODAL_BREAKPOINTS}
      onWillPresent={() => {
        setTotalAdjustedValue(
          String(
            Number(userPreferences[customAdjustmentSalah]) +
              getDefaultAdjustments()[customAdjustmentSalah],
          ),
        );
      }}
      onWillDismiss={async () => {
        // console.log("customAdjustmentSalah: ", customAdjustmentSalah);
        // if (!customAdjustmentSalah) return;

        if (userAdjustedValue !== null) {
          await updateUserPrefs(
            dbConnection,
            customAdjustmentSalah,
            String(userAdjustedValue),
            setUserPreferences,
          );
        }
        setTotalAdjustedValue("0");
        setUserAdjustedValue(null);
      }}
      onDidDismiss={() => {
        setShowCustomAdjustmentsSheet(false);
      }}
    >
      <section className="ion-content-scroll-host max-h-[var(--sheet-max-height)] overflow-y-auto px-5 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <h1 className="mb-1 font-bold leading-tight">
          {salahMap[customAdjustmentSalah]} adjustment
        </h1>
        <p className="mb-4 text-[0.9375rem] leading-relaxed text-[var(--secondary-text-color)]">
          Minutes added to or taken off the calculated{" "}
          {salahMap[customAdjustmentSalah]} time.
        </p>
        <IonPicker mode={isPlatform("ios") ? "ios" : "md"}>
          <IonPickerColumn
            value={totalAdjustedValue}
            onIonChange={({ detail }) => {
              const userAdjustedValue =
                Number(detail.value) -
                getDefaultAdjustments()[customAdjustmentSalah];

              setTotalAdjustedValue(
                String(
                  userAdjustedValue +
                    getDefaultAdjustments()[customAdjustmentSalah],
                ),
              );

              setUserAdjustedValue(userAdjustedValue);
            }}
          >
            {customAdjustmentsArr.map((item) => {
              return (
                <IonPickerColumnOption key={item} value={item}>
                  {formatNumberWithSign(Number(item))} min
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

export default BottomSheetSalahTimeCustomAdjustments;
