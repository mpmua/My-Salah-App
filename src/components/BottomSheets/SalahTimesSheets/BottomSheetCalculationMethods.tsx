import { IonModal } from "@ionic/react";

import { SQLiteDBConnection } from "@capacitor-community/sqlite";

import {
  LocationsDataObjTypeArr,
  userPreferencesType,
} from "../../../types/types";
import {
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
} from "../../../utils/constants";

import { useState } from "react";

import CalculationMethodOptions from "../../CalculationMethodOptions";

interface BottomSheetCalculationMethodsProps {
  triggerId: string;
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  setUserPreferences: React.Dispatch<React.SetStateAction<userPreferencesType>>;
  userPreferences: userPreferencesType;
  userLocations: LocationsDataObjTypeArr;
}

const BottomSheetCalculationMethods = ({
  triggerId,
  dbConnection,
  setUserPreferences,
  userPreferences,
  userLocations,
}: BottomSheetCalculationMethodsProps) => {
  const [segmentOption, setSegmentOption] = useState<"manual" | "country">(
    "country",
  );

  return (
    <IonModal
      style={{ "--height": "80vh" }}
      className="modal-height"
      mode="ios"
      trigger={triggerId}
      initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      breakpoints={MODAL_BREAKPOINTS}
    >
      <CalculationMethodOptions
        dbConnection={dbConnection}
        setSegmentOption={setSegmentOption}
        segmentOption={segmentOption}
        setUserPreferences={setUserPreferences}
        userPreferences={userPreferences}
        userLocations={userLocations}
      >
        <h1 className="mb-1 font-bold leading-tight">Calculation method</h1>
        <p className="mb-5 text-[0.9375rem] leading-relaxed text-[var(--secondary-text-color)]">
          Choose how your daily Salah times are calculated.
        </p>
      </CalculationMethodOptions>
    </IonModal>
  );
};

export default BottomSheetCalculationMethods;
