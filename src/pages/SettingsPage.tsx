import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

import { Share } from "@capacitor/share";
import SettingIndividual from "../components/Settings/SettingIndividual";
import {
  DBResultSalahStatusDataType,
  LocationsDataObjTypeArr,
  themeType,
  userPreferencesType,
} from "../types/types";
import { Filesystem, Encoding, Directory } from "@capacitor/filesystem";
import { MdOutlineChevronRight } from "react-icons/md";
import BottomSheetNotifications from "../components/BottomSheets/BottomSheetNotifications";
import {
  SQLiteConnection,
  SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import { Capacitor } from "@capacitor/core";
import {
  updateUserPrefs,
  //  pageTransitionStyles,
  showToast,
  showAlert,
  upperCaseFirstLetter,
} from "../utils/helpers";
import BottomSheetStartDate from "../components/BottomSheets/BottomSheetStartDate";
import BottomSheetEditReasons from "../components/BottomSheets/BottomSheetEditReasons";

import {
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import BottomSheetThemeOptions from "../components/BottomSheets/BottomSheetThemeOptions";
import { toggleDBConnection } from "../utils/dbUtils";
import BottomSheetSalahTimesSettings from "../components/BottomSheets/SalahTimesSheets/BottomSheetSalahTimesSettings";
import BottomSheetBatchUpdate from "../components/BottomSheets/BottomSheetBatchUpdate";
// import BottomSheetBatchUpdate from "../components/BottomSheets/BottomSheetBatchUpdate";

interface SettingsPageProps {
  sqliteConnection: React.MutableRefObject<SQLiteConnection | undefined>;
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  handleSalahTrackingDataFromDB: (
    DBResultAllSalahData: DBResultSalahStatusDataType[],
    userStartDate: string,
  ) => Promise<void>;
  isAppActive: boolean;
  theme: themeType;
  handleTheme: (theme?: themeType) => string;
  fetchDataFromDB: (isDBImported?: boolean) => Promise<void>;
  setUserPreferences: React.Dispatch<React.SetStateAction<userPreferencesType>>;
  setShowSalahTimesSettingsSheet: React.Dispatch<React.SetStateAction<boolean>>;
  showSalahTimesSettingsSheet: boolean;
  userPreferences: userPreferencesType;
  userLocations: LocationsDataObjTypeArr;
  setShowChangelogSheet: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingsPage = ({
  sqliteConnection,
  dbConnection,
  handleSalahTrackingDataFromDB,
  isAppActive,
  handleTheme,
  fetchDataFromDB,
  setUserPreferences,
  setShowSalahTimesSettingsSheet,
  showSalahTimesSettingsSheet,
  userPreferences,
  userLocations,
  setShowChangelogSheet,
}: SettingsPageProps) => {
  const shareThisAppLink = async (link: string) => {
    await Share.share({
      title: "",
      text: "",
      url: link,
      dialogTitle: "",
    });
  };

  const importDBRef = useRef<HTMLInputElement | null>(null);
  // const datePickerRef = useRef<HTMLInputElement | null>(null);
  const diaglogElement = useRef<HTMLDialogElement | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [
    isMissedSalahCounterOptionChecked,
    setIsMissedSalahCounterOptionChecked,
  ] = useState<boolean>(
    userPreferences.showMissedSalahCount === "0" ? false : true,
  );
  const [showBatchUpdateModal, setShowBatchUpdateModal] = useState(false);
  const [showStartDateSheet, setShowStartDateSheet] = useState(false);

  // const page = useRef(null);
  // const [presentingElement, setPresentingElement] =
  //   useState<HTMLElement | null>(null);

  // useEffect(() => {
  //   setPresentingElement(page.current);
  // }, []);

  const triggerInput = () => {
    if (importDBRef.current) {
      importDBRef.current.click();
    } else {
      console.error("importDBRef.current does not exist");
    }
  };

  const handleDBExport = async () => {
    try {
      if (!sqliteConnection.current) {
        throw new Error("sqliteConnection does not exist");
      }
      setLoadingMessage("Generating file, please wait...");
      diaglogElement.current?.showModal();
      await toggleDBConnection(dbConnection, "open");
      const rawBackupData = await dbConnection.current!.exportToJson("full");
      rawBackupData.export!.overwrite = true;
      const exportedDBAsJson = JSON.stringify(rawBackupData.export);

      try {
        await sqliteConnection.current.isJsonValid(exportedDBAsJson);
      } catch (error) {
        throw new Error("Invalid JSON format: " + error);
      }

      const date = new Date();
      const formattedDate = date
        .toISOString()
        .replace(/T/, "-")
        .replace(/[:]/g, "-")
        .slice(0, 19);

      const writeResult = await Filesystem.writeFile({
        path: `mysalahapp-backup-${formattedDate}.json`,
        data: exportedDBAsJson,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      const filePath = writeResult.uri;
      if (Capacitor.isNativePlatform()) {
        diaglogElement.current?.close();
        try {
          await Share.share({
            title: "mysalahapp-backup",
            files: [filePath],
            dialogTitle: "Share your database backup",
          });
        } catch (error) {
          console.error("Error sharing file: ", error);
          throw new Error("Error sharing file");
        }
      }

      await Filesystem.deleteFile({
        path: filePath,
        directory: Directory.Cache,
      });
    } catch (error) {
      console.error(error);
    } finally {
      diaglogElement.current?.close();
      setLoadingMessage("");
      await toggleDBConnection(dbConnection, "close");
    }
  };

  const handleDBImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await toggleDBConnection(dbConnection, "close");
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!sqliteConnection.current) {
          throw new Error("sqliteConnection does not exist");
        }
        if (!e.target) {
          throw new Error("e.target is null");
        }
        const fileContent = e.target.result;
        if (typeof fileContent !== "string") {
          throw new Error("File content is not a string");
        }

        try {
          await sqliteConnection.current.isJsonValid(fileContent);
        } catch (error) {
          showToast(`File not recognised, file is invalid - ${error}`, "long");
          throw new Error("JSON is not valid");
        }
        try {
          setLoadingMessage("Importing file, please wait...");
          diaglogElement.current?.showModal();
          await sqliteConnection.current.importFromJson(fileContent);
          diaglogElement.current?.close();
          showToast("Import Successful", "short");

          const isDBImported = true;
          await fetchDataFromDB(isDBImported);
        } catch (error) {
          console.error("Error importing backup file", error);
          // Below is in the finally block but had to be duplicated here otherwise wouldn't close on Android
          diaglogElement.current?.close();
          showToast(`Unable to import file - ${error}`, "long");
          throw new Error("Error importing backup file");
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading file: ", error);
      };
      if (!e.target.files) {
        throw new Error("e.target.files does not exist");
      }

      const file = e.target.files[0];

      if (file) {
        reader.readAsText(file);
      } else {
        throw new Error("No file selected");
      }
    } catch (error) {
      console.error(error);
    } finally {
      diaglogElement.current?.close();
      setLoadingMessage("");
    }
  };

  const link = (url: string) => {
    window.location.href = url;
  };

  useEffect(() => {
    const updateStateAndDB = async () => {
      if (isMissedSalahCounterOptionChecked) {
        await updateUserPrefs(
          dbConnection,
          "showMissedSalahCount",
          "1",
          setUserPreferences,
        );
      } else {
        await updateUserPrefs(
          dbConnection,
          "showMissedSalahCount",
          "0",
          setUserPreferences,
        );
      }
    };

    updateStateAndDB();
  }, [isMissedSalahCounterOptionChecked]);

  return (
    <IonPage
    // ref={page}
    >
      <IonHeader mode="md" className="ion-no-border">
        <IonToolbar className="page-header-toolbar">
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <motion.section
          // {...pageTransitionStyles}
          className={`settings-page-wrap`}
        >
          <div className="settings-page-options-wrap">
            <p className="mb-0.5 ml-3 text-xs font-semibold uppercase leading-4 tracking-wide text-[var(--secondary-text-color)]">
              Preferences
            </p>
            <div className="rounded-lg bg-[var(--card-bg-color)]">
              <div
                className="group pl-[1.125rem]"
                id="open-notification-options-sheet"
              >
                <div className="flex items-center justify-between gap-3 border-t border-[color:var(--sheet-divider-color)] py-3 pr-[1.125rem] group-first:border-t-0">
                  <div>
                    <p className="text-base font-medium leading-snug">
                      Notifications
                    </p>
                    <p className="mt-0.5 text-[0.8125rem] leading-snug text-[var(--secondary-text-color)]">
                      Daily reminder and Salah alerts
                    </p>
                  </div>
                  <MdOutlineChevronRight
                    aria-hidden="true"
                    className="shrink-0 text-xl text-[var(--secondary-text-color)]"
                  />
                </div>
                <BottomSheetNotifications
                  dbConnection={dbConnection}
                  triggerId="open-notification-options-sheet"
                  isAppActive={isAppActive}
                  setUserPreferences={setUserPreferences}
                  userPreferences={userPreferences}
                  userLocations={userLocations}
                />
              </div>
              <SettingIndividual
                id="open-theme-options-sheet"
                headingText={"Theme"}
                subText={upperCaseFirstLetter(userPreferences.theme)}
              />
            </div>
            <p className="mb-0.5 ml-3 mt-4 text-xs font-semibold uppercase leading-4 tracking-wide text-[var(--secondary-text-color)]">
              Salah
            </p>
            <div className="rounded-lg bg-[var(--card-bg-color)]">
              <SettingIndividual
                onClick={() => {
                  if (userLocations.length === 0) {
                    showAlert(
                      "Location / Salah times not set",
                      "Please add a location or set up Salah times on the Salah times page first.",
                    );
                    return;
                  }
                  setShowSalahTimesSettingsSheet(true);
                }}
                headingText={"Salah Times Settings"}
                subText={`Calculation method, adjustments`}
              />
              <BottomSheetSalahTimesSettings
                setShowSalahTimesSettingsSheet={setShowSalahTimesSettingsSheet}
                showSalahTimesSettingsSheet={showSalahTimesSettingsSheet}
                dbConnection={dbConnection}
                setUserPreferences={setUserPreferences}
                userPreferences={userPreferences}
                userLocations={userLocations}
              />
              <BottomSheetThemeOptions
                dbConnection={dbConnection}
                triggerId={"open-theme-options-sheet"}
                setUserPreferences={setUserPreferences}
                userPreferencesTheme={userPreferences.theme}
                handleTheme={handleTheme}
              />
              <div className="group pl-[1.125rem]">
                <div className="flex items-center justify-between gap-3 border-t border-[color:var(--sheet-divider-color)] py-3 pr-[1.125rem] group-first:border-t-0">
                  <div>
                    <p className="text-base font-medium leading-snug">
                      {"Missed Salah Counter"}
                    </p>
                    <p className="mt-0.5 text-[0.8125rem] leading-snug text-[var(--secondary-text-color)]">
                      {"Show the missed Salah counter on Home"}
                    </p>
                  </div>
                  <IonToggle
                    className="[--track-background:var(--sheet-input-border-color)]"
                    checked={isMissedSalahCounterOptionChecked}
                    onIonChange={async () => {
                      setIsMissedSalahCounterOptionChecked((prev) => !prev);
                    }}
                  ></IonToggle>
                </div>
              </div>
              <SettingIndividual
                id="open-edit-reasons-sheet"
                headingText={"Edit Reasons"}
                subText={`Manage your reasons`}
              />
              <BottomSheetEditReasons
                dbConnection={dbConnection}
                triggerId={"open-edit-reasons-sheet"}
                setUserPreferences={setUserPreferences}
                userPreferences={userPreferences}
                // presentingElement={presentingElement}
              />
              <SettingIndividual
                // id="open-change-start-date-sheet"
                onClick={() => setShowStartDateSheet(true)}
                headingText={"Change Start Date"}
                subText={`Set the date to start tracking`}
              />
              <BottomSheetStartDate
                dbConnection={dbConnection}
                setShowStartDateSheet={setShowStartDateSheet}
                showStartDateSheet={showStartDateSheet}
                // triggerId={"open-change-start-date-sheet"}

                setUserPreferences={setUserPreferences}
                userPreferences={userPreferences}
                fetchDataFromDB={fetchDataFromDB}
              />
              <SettingIndividual
                onClick={() => setShowBatchUpdateModal(true)}
                headingText={"Bulk update Salah"}
                subText={`Update years or decades of history at once`}
              />
              <BottomSheetBatchUpdate
                dbConnection={dbConnection}
                handleSalahTrackingDataFromDB={handleSalahTrackingDataFromDB}
                setShowBatchUpdateModal={setShowBatchUpdateModal}
                showBatchUpdateModal={showBatchUpdateModal}
                setShowStartDateSheet={setShowStartDateSheet}
                userPreferences={userPreferences}
              />
            </div>
            <p className="mb-0.5 ml-3 mt-4 text-xs font-semibold uppercase leading-4 tracking-wide text-[var(--secondary-text-color)]">
              Data
            </p>
            <div className="rounded-lg bg-[var(--card-bg-color)]">
              <SettingIndividual
                headingText={"Import Data"}
                subText={"Restore from a backup file"}
                onClick={triggerInput}
              />
              <SettingIndividual
                headingText={"Export Data"}
                subText={"Create a backup file"}
                onClick={async () => {
                  await handleDBExport();
                }}
              />
            </div>
            <input
              ref={importDBRef}
              className="hidden"
              onChange={handleDBImport}
              type="file"
              accept=".json"
              id="backupfile"
              name="backupfile"
            ></input>
            <dialog
              aria-labelledby="backup-loading-message"
              className="rounded-lg bg-[var(--card-bg-color)] p-4 text-center text-[var(--ion-text-color)] shadow-lg"
              ref={diaglogElement}
            >
              <div className="flex flex-col items-center gap-2">
                <IonSpinner
                  aria-hidden="true"
                  className="[--color:var(--ion-text-color)]"
                />
                <span id="backup-loading-message">{loadingMessage}</span>
              </div>
            </dialog>
            <p className="mb-0.5 ml-3 mt-4 text-xs font-semibold uppercase leading-4 tracking-wide text-[var(--secondary-text-color)]">
              More
            </p>
            <div className="rounded-lg bg-[var(--card-bg-color)]">
              {Capacitor.getPlatform() === "android" && (
                <SettingIndividual
                  headingText={"Review"}
                  subText={"Rate the app on the Google Play Store"}
                  onClick={() => {
                    link(
                      "https://play.google.com/store/apps/details?id=com.mysalahapp.app",
                    );
                  }}
                />
              )}
              {Capacitor.getPlatform() === "ios" && (
                <SettingIndividual
                  headingText={"Review"}
                  subText={"Rate the app on the App Store"}
                  onClick={() => {
                    link(
                      "https://apps.apple.com/gb/app/my-salah-app/id6478277078",
                    );
                  }}
                />
              )}
              {Capacitor.isNativePlatform() && (
                <SettingIndividual
                  headingText={"Share"}
                  subText={"Share application"}
                  onClick={() => {
                    if (Capacitor.getPlatform() === "android") {
                      shareThisAppLink(
                        "https://play.google.com/store/apps/details?id=com.mysalahapp.app",
                      );
                    } else if (Capacitor.getPlatform() === "ios") {
                      shareThisAppLink(
                        "https://apps.apple.com/gb/app/my-salah-app/id6478277078",
                      );
                    }
                  }}
                />
              )}
              <SettingIndividual
                onClick={() => {
                  setShowChangelogSheet(true);
                }}
                headingText={"Changelog"}
                subText={"See what's new"}
              />
              <SettingIndividual
                headingText={"Feedback"}
                subText={"Send feedback or suggestions"}
                onClick={() => {
                  link(
                    "mailto: mohammed@mohammedpatel.dev?subject=My Salah App Feedback",
                  );
                }}
              />
              {/* <SettingIndividual
              indvidualStyles={"border-b border-[var(--app-border-color)]"}
              headingText={"Website"}
              subText={"Visit website"}
              onClick={() => {

              }}
            /> */}
              <SettingIndividual
                headingText={"Privacy Policy"}
                subText={"Read our privacy policy"}
                onClick={() => {
                  link(
                    "https://sites.google.com/view/my-salah-app-privacy-policy/home",
                  );
                }}
              />
              <SettingIndividual
                headingText={"Source Code"}
                subText={"View on GitHub"}
                onClick={() => {
                  link("https://github.com/My-Ummah-Apps/My-Salah-App");
                }}
              />
              {/* <SettingIndividual
              id="open-about-us-sheet"
              headingText={"About"}
              subText={"About Us"}
            /> */}
              {/* <BottomSheetAboutUs triggerId="open-about-us-sheet" /> */}
            </div>
          </div>
        </motion.section>
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
