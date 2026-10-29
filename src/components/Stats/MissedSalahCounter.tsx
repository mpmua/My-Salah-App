import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { SalahByDateObjType, userPreferencesType } from "../../types/types";

import { LuHistory } from "react-icons/lu";
import Joyride, { CallBackProps } from "react-joyride";
import { getMissedSalahCount, updateUserPrefs } from "../../utils/helpers";

interface MissedSalahCounterProps {
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  setUserPreferences: React.Dispatch<React.SetStateAction<userPreferencesType>>;
  isMultiEditMode: boolean;
  setShowMissedSalahsSheet: React.Dispatch<React.SetStateAction<boolean>>;
  missedSalahList: SalahByDateObjType;
  userPreferences: userPreferencesType;
}

const MissedSalahCounter = ({
  dbConnection,
  isMultiEditMode,
  setShowMissedSalahsSheet,
  missedSalahList,
  setUserPreferences,
  userPreferences,
}: MissedSalahCounterProps) => {
  const joyRideMissedSalahCounterToolTip = [
    {
      target: ".missed-salah-counter",
      content: "Tap this circle to see all your missed salah and complete them",
      disableBeacon: true,
    },
  ];

  const handleJoyRideCompletion = async (data: CallBackProps) => {
    if (data.status === "ready") {
      await updateUserPrefs(
        dbConnection,
        "isMissedSalahToolTipShown",
        "1",
        setUserPreferences,
      );
    }
  };

  return (
    <>
      <Joyride
        disableOverlay={true}
        disableOverlayClose={true}
        run={userPreferences.isMissedSalahToolTipShown === "0"}
        locale={{
          last: "Done",
          next: "Next",
          back: "Back",
        }}
        hideCloseButton={true}
        disableScrolling={true}
        callback={handleJoyRideCompletion}
        styles={{
          options: {
            backgroundColor: "#27272a",
            arrowColor: "#27272a",
            textColor: "#fff",
            zIndex: 10000,
          },
          buttonNext: {
            backgroundColor: "#2563eb",
            color: "#fff",
            borderRadius: "5px",
            padding: "8px 12px",
          },
          buttonBack: {
            backgroundColor: "#f44336",
            color: "#fff",
            borderRadius: "5px",
            padding: "8px 12px",
          },
        }}
        steps={joyRideMissedSalahCounterToolTip}
        continuous
      />
      <div
        onClick={() => {
          if (isMultiEditMode) {
            return;
          }
          setShowMissedSalahsSheet(true);
        }}
        style={{ position: "relative", display: "inline-block" }}
      >
        <div className="missed-salah-counter flex h-[30px] items-center gap-[5px] rounded-full bg-[var(--missed-counter-bg)] pl-[9px] pr-[11px] text-sm font-semibold text-[var(--missed-counter-text)]">
          <LuHistory aria-hidden="true" className="text-lg" />
          {/* <p className="text-xs text-white">99</p> */}
          <span>
            {getMissedSalahCount(missedSalahList) < 100
              ? getMissedSalahCount(missedSalahList)
              : "99+"}
          </span>
        </div>
      </div>
    </>
  );
};

export default MissedSalahCounter;
