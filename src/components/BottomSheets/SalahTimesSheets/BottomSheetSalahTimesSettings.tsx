import {
  IonContent,
  IonModal,
  IonIcon,
  IonToggle,
  isPlatform,
} from "@ionic/react";
import { chevronForwardOutline } from "ionicons/icons";
import {
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
  prayerCalculationMethodLabels,
} from "../../../utils/constants";

import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import {
  LocationsDataObjTypeArr,
  userPreferencesType,
} from "../../../types/types";

import { useState } from "react";
import BottomSheetCalculationMethods from "./BottomSheetCalculationMethods";
import BottomSheetLatitudeRules from "./BottomSheetLatitudeRules";
import BottomSheetCustomAngles from "./BottomSheetCustomAngles";
import BottomSheetSalahTimeCustomAdjustments from "./BottomSheetSalahTimeCustomAdjustments";
import BottomSheetShafaqRules from "./BottomSheetShafaqRule";
import BottomSheetMadhabOptions from "./BottomSheetMadhabOptions";
import BottomSheetPolarCircleSetting from "./BottomSheetPolarCircleSetting";
import {
  formatNumberWithSign,
  updateUserPrefs,
  upperCaseFirstLetter,
} from "../../../utils/helpers";
import { CalculationMethod } from "adhan";

interface BottomSheetSalahTimesSettingsProps {
  setShowSalahTimesSettingsSheet: React.Dispatch<React.SetStateAction<boolean>>;
  showSalahTimesSettingsSheet: boolean;
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  setUserPreferences: React.Dispatch<React.SetStateAction<userPreferencesType>>;
  userPreferences: userPreferencesType;
  userLocations: LocationsDataObjTypeArr;

  // calculateActiveLocationSalahTimes: () => Promise<void>;
}

const BottomSheetSalahTimesSettings = ({
  setShowSalahTimesSettingsSheet,
  showSalahTimesSettingsSheet,
  dbConnection,
  setUserPreferences,
  userPreferences,
  userLocations,
}: // calculateActiveLocationSalahTimes,
BottomSheetSalahTimesSettingsProps) => {
  // const [selectedCalculationMethod, setSelectedCalculationMethod] =
  //   useState<CalculationMethodsType | null>(
  //     userPreferences.prayerCalculationMethod
  //   );

  const [customAdjustmentSalah, setCustomAdjustmentSalah] = useState<
    | "fajrAdjustment"
    | "dhuhrAdjustment"
    | "asrAdjustment"
    | "maghribAdjustment"
    | "ishaAdjustment"
  >("fajrAdjustment");

  const [customAngleSalah, setCustomAngleSalah] = useState<
    "fajrAngle" | "ishaAngle"
  >("fajrAngle");

  const [showCustomAdjustmentsSheet, setShowCustomAdjustmentsSheet] =
    useState<boolean>(false);
  const [showCustomAnglesSheet, setShowCustomAnglesSheet] =
    useState<boolean>(false);
  const [showShafaqRulesSheet, setShowShafaqRulesSheet] = useState(false);

  // const methodObj = CalculationMethod["Egyptian"]().highLatitudeRule;
  // console.log("methodObj: ", methodObj);

  // var params = CalculationMethod.UmmAlQura();
  // console.log(params);

  // console.log(HighLatitudeRule.recommended());

  const latitudeRuleValues = {
    middleofthenight: "Middle of the Night",
    seventhofthenight: "Seventh of the Night",
    twilightangle: "Twilight Angle",
  };

  const polarCircleResolutionValues = {
    Unresolved: "Unresolved (default)",
    AqrabBalad: "Closest City",
    AqrabYaum: "Closest Date",
  };

  const getDefaultAdjustments = () => {
    if (!userPreferences.prayerCalculationMethod) {
      // console.error(
      //   "Calculation method does not exist, discontinuing getDefaultAdjustments function",
      // );
      return {
        fajrAdjustment: 0,
        dhuhrAdjustment: 0,
        asrAdjustment: 0,
        maghribAdjustment: 0,
        ishaAdjustment: 0,
      };
    }

    // console.log("getDefaultAdjustments function has run");

    const params = CalculationMethod[userPreferences.prayerCalculationMethod]();

    const obj: {
      fajrAdjustment: number;
      dhuhrAdjustment: number;
      asrAdjustment: number;
      maghribAdjustment: number;
      ishaAdjustment: number;
    } = {
      fajrAdjustment: params.methodAdjustments.fajr,
      dhuhrAdjustment: params.methodAdjustments.dhuhr,
      asrAdjustment: params.methodAdjustments.asr,
      maghribAdjustment: params.methodAdjustments.maghrib,
      ishaAdjustment: params.methodAdjustments.isha,
    };

    return obj;
  };

  return (
    <IonModal
      mode="ios"
      isOpen={showSalahTimesSettingsSheet}
      className="modal-height"
      // presentingElement={presentingElement!}
      // style={{ "--height": "95vh" }}
      // expandToScroll={false}
      // className="modal-fit-content"
      onDidDismiss={() => {
        setShowSalahTimesSettingsSheet(false);
      }}
      onWillDismiss={() => {}}
      initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      breakpoints={MODAL_BREAKPOINTS}
    >
      <IonContent className="[--background:var(--sheet-bg-color)]">
        <section className="px-5 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          <h1 className="mb-4 font-bold leading-tight">Salah Times Settings</h1>
          <div className="sheet-group">
            <button
              id="open-salah-calculations-sheet"
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="font-semibold leading-snug">
                  Calculation method
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-[var(--secondary-text-color)]">
                  {userPreferences.prayerCalculationMethod === ""
                    ? "Select Calculation method"
                    : prayerCalculationMethodLabels[
                        userPreferences.prayerCalculationMethod
                      ]}
                </span>
              </span>
              <IonIcon
                aria-hidden="true"
                className="text-lg text-[var(--secondary-text-color)]"
                icon={chevronForwardOutline}
              />
            </button>
            <button
              id="open-madhab-options-sheet"
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="font-semibold leading-snug">
                  Madhab / Asr time
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-[var(--secondary-text-color)]">
                  {userPreferences.madhab === "shafi"
                    ? "Earlier Asr"
                    : "Later Asr"}
                </span>
              </span>
              <IonIcon
                aria-hidden="true"
                className="text-lg text-[var(--secondary-text-color)]"
                icon={chevronForwardOutline}
              />
            </button>
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1">
                <span className="font-semibold leading-snug">24-hour time</span>
                <span className="mt-0.5 block text-sm leading-snug text-[var(--secondary-text-color)]">
                  Show times in 24-hour format
                </span>
              </span>
              <IonToggle
                mode={isPlatform("android") ? "md" : "ios"}
                style={{ "--track-background": "#555" }}
                checked={userPreferences.timeFormat === "24hr" ? true : false}
                onIonChange={async (e) => {
                  const selectedTimeFormat =
                    e.detail.checked === true ? "24hr" : "12hr";

                  await updateUserPrefs(
                    dbConnection,
                    "timeFormat",
                    selectedTimeFormat,
                    setUserPreferences,
                  );
                }}
              ></IonToggle>
            </div>
          </div>

          <p className="mb-1 mt-6 text-sm font-semibold text-[var(--secondary-text-color)]">
            Advanced
          </p>
          <p className="mb-2 text-sm leading-snug text-[var(--secondary-text-color)]">
            Overrides for experienced users. Changing these values replaces the
            calculation method’s defaults.
          </p>
          <div className="sheet-group">
            <button
              id="open-salah-latitude-rules-sheet"
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="font-semibold leading-snug">
                  High latitude rule
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-[var(--secondary-text-color)]">
                  {latitudeRuleValues[userPreferences.highLatitudeRule]}
                </span>
              </span>
              <IonIcon
                aria-hidden="true"
                className="text-lg text-[var(--secondary-text-color)]"
                icon={chevronForwardOutline}
              />
            </button>
          </div>

          <p className="mb-2 mt-5 text-sm font-semibold text-[var(--secondary-text-color)]">
            Fajr / Isha angles
          </p>
          <div className="sheet-group">
            <button
              onClick={() => {
                setCustomAngleSalah("fajrAngle");
                setShowCustomAnglesSheet(true);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="font-semibold leading-snug">Fajr angle</span>
                <span className="mt-0.5 block text-sm leading-snug text-[var(--secondary-text-color)]">
                  {userPreferences.fajrAngle}°
                </span>
              </span>
              <IonIcon
                aria-hidden="true"
                className="text-lg text-[var(--secondary-text-color)]"
                icon={chevronForwardOutline}
              />
            </button>
            <button
              onClick={() => {
                setCustomAngleSalah("ishaAngle");
                setShowCustomAnglesSheet(true);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="font-semibold leading-snug">Isha angle</span>
                <span className="mt-0.5 block text-sm leading-snug text-[var(--secondary-text-color)]">
                  {userPreferences.ishaAngle}°
                </span>
              </span>
              <IonIcon
                aria-hidden="true"
                className="text-lg text-[var(--secondary-text-color)]"
                icon={chevronForwardOutline}
              />
            </button>
          </div>

          <p className="mb-2 mt-5 text-sm font-semibold text-[var(--secondary-text-color)]">
            Custom adjustments
          </p>
          <div className="sheet-group">
            <button
              onClick={() => {
                setCustomAdjustmentSalah("fajrAdjustment");
                setShowCustomAdjustmentsSheet(true);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="font-semibold leading-snug">
                  Fajr adjustment
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-[var(--secondary-text-color)]">
                  {formatNumberWithSign(
                    Number(userPreferences.fajrAdjustment) +
                      getDefaultAdjustments().fajrAdjustment,
                  )}{" "}
                  {userPreferences.fajrAdjustment === "1"
                    ? "minute"
                    : "minutes"}
                </span>
              </span>
              <IonIcon
                aria-hidden="true"
                className="text-lg text-[var(--secondary-text-color)]"
                icon={chevronForwardOutline}
              />
            </button>
            <button
              onClick={() => {
                setCustomAdjustmentSalah("dhuhrAdjustment");
                setShowCustomAdjustmentsSheet(true);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="font-semibold leading-snug">
                  Dhuhr adjustment
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-[var(--secondary-text-color)]">
                  {formatNumberWithSign(
                    Number(userPreferences.dhuhrAdjustment) +
                      getDefaultAdjustments().dhuhrAdjustment,
                  )}{" "}
                  {userPreferences.dhuhrAdjustment === "1"
                    ? "minute"
                    : "minutes"}
                </span>
              </span>
              <IonIcon
                aria-hidden="true"
                className="text-lg text-[var(--secondary-text-color)]"
                icon={chevronForwardOutline}
              />
            </button>
            <button
              onClick={() => {
                setCustomAdjustmentSalah("asrAdjustment");
                setShowCustomAdjustmentsSheet(true);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="font-semibold leading-snug">
                  Asr adjustment
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-[var(--secondary-text-color)]">
                  {formatNumberWithSign(
                    Number(userPreferences.asrAdjustment) +
                      getDefaultAdjustments().asrAdjustment,
                  )}{" "}
                  {userPreferences.asrAdjustment === "1" ? "minute" : "minutes"}
                </span>
              </span>
              <IonIcon
                aria-hidden="true"
                className="text-lg text-[var(--secondary-text-color)]"
                icon={chevronForwardOutline}
              />
            </button>
            <button
              onClick={() => {
                setCustomAdjustmentSalah("maghribAdjustment");
                setShowCustomAdjustmentsSheet(true);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="font-semibold leading-snug">
                  Maghrib adjustment
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-[var(--secondary-text-color)]">
                  {formatNumberWithSign(
                    Number(userPreferences.maghribAdjustment) +
                      getDefaultAdjustments().maghribAdjustment,
                  )}{" "}
                  {userPreferences.maghribAdjustment === "1"
                    ? "minute"
                    : "minutes"}
                </span>
              </span>
              <IonIcon
                aria-hidden="true"
                className="text-lg text-[var(--secondary-text-color)]"
                icon={chevronForwardOutline}
              />
            </button>
            <button
              onClick={() => {
                setCustomAdjustmentSalah("ishaAdjustment");
                setShowCustomAdjustmentsSheet(true);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="font-semibold leading-snug">
                  Isha adjustment
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-[var(--secondary-text-color)]">
                  {formatNumberWithSign(
                    Number(userPreferences.ishaAdjustment) +
                      getDefaultAdjustments().ishaAdjustment,
                  )}{" "}
                  {userPreferences.ishaAdjustment === "1"
                    ? "minute"
                    : "minutes"}
                </span>
              </span>
              <IonIcon
                aria-hidden="true"
                className="text-lg text-[var(--secondary-text-color)]"
                icon={chevronForwardOutline}
              />
            </button>
          </div>
          {userPreferences.prayerCalculationMethod ===
            "MoonsightingCommittee" && (
            <>
              <p className="mb-2 mt-5 text-sm font-semibold text-[var(--secondary-text-color)]">
                Shafaq
              </p>
              <div className="sheet-group">
                <button
                  onClick={() => {
                    setShowShafaqRulesSheet(true);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="font-semibold leading-snug">
                      Shafaq rule
                    </span>
                    <span className="mt-0.5 block text-sm leading-snug text-[var(--secondary-text-color)]">
                      {upperCaseFirstLetter(userPreferences.shafaqRule)}
                    </span>
                  </span>
                  <IonIcon
                    aria-hidden="true"
                    className="text-lg text-[var(--secondary-text-color)]"
                    icon={chevronForwardOutline}
                  />
                </button>
              </div>
            </>
          )}
          <p className="mb-2 mt-5 text-sm font-semibold text-[var(--secondary-text-color)]">
            Polar
          </p>
          <div className="sheet-group">
            <button
              id="open-polar-circle-settings-sheet"
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="font-semibold leading-snug">
                  Polar circle resolution
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-[var(--secondary-text-color)]">
                  {
                    polarCircleResolutionValues[
                      userPreferences.polarCircleResolution
                    ]
                  }
                </span>
              </span>
              <IonIcon
                aria-hidden="true"
                className="text-lg text-[var(--secondary-text-color)]"
                icon={chevronForwardOutline}
              />
            </button>
          </div>
        </section>
      </IonContent>
      <BottomSheetCalculationMethods
        triggerId="open-salah-calculations-sheet"
        dbConnection={dbConnection}
        // setSelectedCalculationMethod={setSelectedCalculationMethod}
        setUserPreferences={setUserPreferences}
        userPreferences={userPreferences}
        userLocations={userLocations}
        // calculateActiveLocationSalahTimes={calculateActiveLocationSalahTimes}
      />
      <BottomSheetMadhabOptions
        triggerId="open-madhab-options-sheet"
        dbConnection={dbConnection}
        setUserPreferences={setUserPreferences}
        userPreferences={userPreferences}
      />
      <BottomSheetLatitudeRules
        triggerId="open-salah-latitude-rules-sheet"
        dbConnection={dbConnection}
        setUserPreferences={setUserPreferences}
        userPreferences={userPreferences}
      />
      <BottomSheetCustomAngles
        dbConnection={dbConnection}
        setShowCustomAnglesSheet={setShowCustomAnglesSheet}
        showCustomAnglesSheet={showCustomAnglesSheet}
        customAngleSalah={customAngleSalah}
        setUserPreferences={setUserPreferences}
        userPreferences={userPreferences}
      />
      <BottomSheetSalahTimeCustomAdjustments
        getDefaultAdjustments={getDefaultAdjustments}
        setShowCustomAdjustmentsSheet={setShowCustomAdjustmentsSheet}
        showCustomAdjustmentsSheet={showCustomAdjustmentsSheet}
        customAdjustmentSalah={customAdjustmentSalah}
        dbConnection={dbConnection}
        setUserPreferences={setUserPreferences}
        userPreferences={userPreferences}
      />
      <BottomSheetShafaqRules
        setShowShafaqRulesSheet={setShowShafaqRulesSheet}
        showShafaqRulesSheet={showShafaqRulesSheet}
        dbConnection={dbConnection}
        setUserPreferences={setUserPreferences}
        userPreferences={userPreferences}
      />
      <BottomSheetPolarCircleSetting
        triggerId="open-polar-circle-settings-sheet"
        dbConnection={dbConnection}
        setUserPreferences={setUserPreferences}
        userPreferences={userPreferences}
      />
      {/* </IonPage> */}
    </IonModal>
  );
};

export default BottomSheetSalahTimesSettings;
