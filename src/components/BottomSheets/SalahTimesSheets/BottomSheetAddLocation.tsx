import { IonModal } from "@ionic/react";

import { SQLiteDBConnection } from "@capacitor-community/sqlite";

import {
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
} from "../../../utils/constants";
import { LocationsDataObjTypeArr } from "../../../types/types";

import AddLocationOptions from "../../AddLocationOptions";

interface BottomSheetAddLocationProps {
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  setShowAddLocationSheet: React.Dispatch<React.SetStateAction<boolean>>;
  showAddLocationSheet?: boolean;
  setUserLocations: React.Dispatch<
    React.SetStateAction<LocationsDataObjTypeArr>
  >;
  userLocations: LocationsDataObjTypeArr;
  setShowLocationFailureToast: React.Dispatch<React.SetStateAction<boolean>>;
  setShowLocationAddedToast: React.Dispatch<React.SetStateAction<boolean>>;
}

const BottomSheetAddLocation = ({
  dbConnection,
  setShowAddLocationSheet,
  showAddLocationSheet,
  setUserLocations,
  userLocations,
  setShowLocationFailureToast,
  setShowLocationAddedToast,
}: BottomSheetAddLocationProps) => {
  return (
    <IonModal
      className="modal-fit-content"
      // style={{ "--height": "80vh" }}
      mode="ios"
      isOpen={showAddLocationSheet}
      // trigger={triggerId}
      initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      breakpoints={MODAL_BREAKPOINTS}
      // className={`${isPlatform("ios") ? "" : "modal-height"}`}
      // expandToScroll={false}
      onDidDismiss={() => {
        setShowAddLocationSheet(false);
        // setShowAddLocationForm(false);
      }}
    >
      {/* {showAddLocationSheet && ( */}
      <AddLocationOptions
        dbConnection={dbConnection}
        setUserLocations={setUserLocations}
        userLocations={userLocations}
        setShowLocationFailureToast={setShowLocationFailureToast}
        setShowLocationAddedToast={setShowLocationAddedToast}
        setShowAddLocationSheet={setShowAddLocationSheet}
      />
      {/* // )}  */}
    </IonModal>
  );
};

export default BottomSheetAddLocation;
