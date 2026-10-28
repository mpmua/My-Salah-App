import { IonModal } from "@ionic/react";

import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { userPreferencesType } from "../../../types/types";
import {
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
} from "../../../utils/constants";

import MadhabOptions from "../../MadhabOptions";

// import { CalculationMethod } from "adhan";

interface BottomSheetMadhabOptionsProps {
  triggerId: string;
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  setUserPreferences: React.Dispatch<React.SetStateAction<userPreferencesType>>;
  userPreferences: userPreferencesType;
}

const BottomSheetMadhabOptions = ({
  triggerId,
  dbConnection,
  setUserPreferences,
  userPreferences,
}: BottomSheetMadhabOptionsProps) => {
  return (
    <IonModal
      className="modal-fit-content "
      mode="ios"
      trigger={triggerId}
      initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      breakpoints={MODAL_BREAKPOINTS}
      // className={`${isPlatform("ios") ? "" : "modal-height"}`}
      // presentingElement={presentingElement!}
      // style={{ "--height": "95vh" }}
      // expandToScroll={false}
    >
      <section className="ion-content-scroll-host max-h-[var(--sheet-max-height)] overflow-y-auto px-5 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <h1 className="mb-4 font-bold leading-tight">Madhab</h1>
        <MadhabOptions
          dbConnection={dbConnection}
          setUserPreferences={setUserPreferences}
          userPreferences={userPreferences}
        />
      </section>
    </IonModal>
  );
};

export default BottomSheetMadhabOptions;
