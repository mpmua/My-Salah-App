import {
  IonContent,
  IonModal,
  IonButton,
  IonIcon,
  IonRadio,
  IonRadioGroup,
  isPlatform,
} from "@ionic/react";

import { SQLiteDBConnection } from "@capacitor-community/sqlite";

import { add, trashOutline } from "ionicons/icons";
import { useState } from "react";

import {
  LocationsDataObjTypeArr,
  salahTimesObjType,
  userPreferencesType,
} from "../../../types/types";
import {
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
} from "../../../utils/constants";
import { fetchAllLocations, toggleDBConnection } from "../../../utils/dbUtils";
import ActionSheet from "../../ActionSheet";
import Toast from "../../Toast";

import {
  cancelNotifications,
  getActiveLocation,
  setAdhanLibraryDefaults,
} from "../../../utils/helpers";

interface BottomSheetSalahTimesSettingsProps {
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  setUserPreferences: React.Dispatch<React.SetStateAction<userPreferencesType>>;
  setUserLocations: React.Dispatch<
    React.SetStateAction<LocationsDataObjTypeArr>
  >;
  setShowLocationsListSheet: React.Dispatch<React.SetStateAction<boolean>>;
  showLocationsListSheet: boolean;
  userLocations: LocationsDataObjTypeArr;
  setShowAddLocationSheet: React.Dispatch<React.SetStateAction<boolean>>;
  userPreferences: userPreferencesType;
  setSalahtimes: React.Dispatch<React.SetStateAction<salahTimesObjType>>;
  setShowLocationDeletedToast: React.Dispatch<React.SetStateAction<boolean>>;
}

const BottomSheetLocationsList = ({
  // triggerId,
  dbConnection,
  setUserPreferences,
  userPreferences,
  setUserLocations,
  setShowLocationsListSheet,
  showLocationsListSheet,
  userLocations,
  setShowAddLocationSheet,
  setShowLocationDeletedToast,
}: BottomSheetSalahTimesSettingsProps) => {
  const [showDeleteLocationActionSheet, setShowDeleteLocationActionSheet] =
    useState(false);
  // const [showEditLocationActionSheet, setShowEditLocationActionSheet] =
  //   useState(false);

  const [locationToDeleteId, setLocationToDeleteId] = useState<null | number>(
    null,
  );
  const [showDeleteLocationToast, setShowDeleteLocationToast] = useState(false);

  const updateActiveLocation = async (id: number) => {
    if (!dbConnection || !dbConnection.current) {
      throw new Error("dbConnection / dbconnection.current does not exist");
    }

    await dbConnection.current.run(
      `UPDATE userLocationsTable SET isSelected = 0`,
    );

    await dbConnection.current.run(
      `UPDATE userlocationsTable SET isSelected = 1 WHERE id = ?`,
      [id],
    );
  };

  const deleteUserLocation = async (
    dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>,
    id: number,
  ) => {
    const stmnt = `DELETE FROM userLocationsTable WHERE id = ?`;
    const params = [id];

    if (!dbConnection || !dbConnection.current) {
      throw new Error("dbConnection / dbconnection.current does not exist");
    }

    await dbConnection.current.run(stmnt, params);
    setShowLocationDeletedToast(true);
  };

  // useEffect(() => {
  //   const cancelAllSalahNotifications = async () => {
  //     if (userLocations?.length === 0) {
  //       await cancelNotifications("fajr");
  //       await cancelNotifications("sunrise");
  //       await cancelNotifications("dhuhr");
  //       await cancelNotifications("asr");
  //       await cancelNotifications("maghrib");
  //       await cancelNotifications("isha");
  //     }
  //   };

  //   cancelAllSalahNotifications();
  // }, [userLocations]);

  return (
    <IonModal
      isOpen={showLocationsListSheet}
      mode="ios"
      className="modal-height"
      onDidDismiss={() => {
        setShowLocationsListSheet(false);
      }}
      initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      breakpoints={MODAL_BREAKPOINTS}
    >
      {/* <IonPage> */}
      <IonContent className="[--background:var(--sheet-bg-color)]">
        <section className="px-5 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          <h1 className="mb-1 font-bold leading-tight">Locations</h1>
          <p className="text-[0.9375rem] leading-relaxed text-[var(--secondary-text-color)]">
            Choose the location used for Salah times.
          </p>
          <IonRadioGroup
            value={
              userLocations?.find((location) => location.isSelected === 1)?.id
            }
          >
            <ul className="mt-5 divide-y divide-[color:var(--sheet-divider-color)]">
              {userLocations?.map((location) => (
                <li
                  key={location.id}
                  className="flex items-center"
                  onClick={async () => {
                    try {
                      await toggleDBConnection(dbConnection, "open");

                      await updateActiveLocation(location.id);

                      const { allLocations } =
                        await fetchAllLocations(dbConnection);

                      setUserLocations(allLocations);
                    } catch (error) {
                      console.error(error);
                    } finally {
                      // await toggleDBConnection(dbConnection, "close");

                      await setAdhanLibraryDefaults(
                        dbConnection,
                        userPreferences.prayerCalculationMethod ||
                          "MuslimWorldLeague",
                        setUserPreferences,
                        userPreferences,
                        userLocations,
                      );
                    }
                  }}
                >
                  <IonRadio
                    mode={isPlatform("ios") ? "ios" : "md"}
                    value={location.id}
                    labelPlacement="end"
                    justify="start"
                    className="pointer-events-none min-w-0 flex-1 py-3.5 text-base font-semibold leading-snug [--color:var(--secondary-text-color)] [&::part(label)]:whitespace-normal"
                  >
                    {location.locationName}
                  </IonRadio>

                  <IonButton
                    className="-mr-3 text-[var(--ion-text-color)]"
                    fill="clear"
                    size="small"
                    aria-label="delete location"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocationToDeleteId(location.id);
                      setShowDeleteLocationActionSheet(true);
                    }}
                  >
                    <IonIcon
                      data-testid="delete-location-btn"
                      icon={trashOutline}
                    ></IonIcon>
                  </IonButton>
                </li>
              ))}
            </ul>
          </IonRadioGroup>
          <button
            id="open-location-settings-sheet"
            aria-label="add location"
            data-testid="add-location-btn"
            className="mt-4 flex items-center gap-2 py-2 font-semibold text-[var(--ion-color-primary)]"
            onClick={() => {
              setShowAddLocationSheet(true);
            }}
          >
            <IonIcon className="text-2xl" icon={add} />
            Add location
          </button>
        </section>
      </IonContent>
      {/* </IonPage> */}

      <Toast
        isOpen={showDeleteLocationToast}
        message="Location deleted"
        setShow={setShowDeleteLocationToast}
        testId={"location-deletion-toast"}
      />

      <ActionSheet
        // trigger="open-delete-location-action-sheet"
        setState={setShowDeleteLocationActionSheet}
        isOpen={showDeleteLocationActionSheet}
        // isOpen={!!locationToDelete}
        header="Are you sure you want to delete this location?"
        buttons={[
          {
            text: "Delete location",
            role: "destructive",
            handler: async () => {
              if (locationToDeleteId === null) {
                console.error(
                  "locationToDeleteId does not exist within delete location ActionSheet handler",
                );
                return;
              }

              try {
                await toggleDBConnection(dbConnection, "open");

                await deleteUserLocation(dbConnection, locationToDeleteId);

                setLocationToDeleteId(null);

                const { allLocations } = await fetchAllLocations(dbConnection);

                // if (!allLocations || allLocations.length === 0) {
                //   throw new Error("Error obtaining all locations");
                // }

                const activeLocation = getActiveLocation(allLocations);

                if (!activeLocation && allLocations.length > 0) {
                  await updateActiveLocation(allLocations[0].id);

                  const amendedLocations = allLocations.map((item, i) => ({
                    ...item,
                    isSelected: i === 0 ? 1 : 0,
                  }));
                  setUserLocations(amendedLocations);

                  await setAdhanLibraryDefaults(
                    dbConnection,
                    userPreferences.prayerCalculationMethod ||
                      "MuslimWorldLeague",
                    setUserPreferences,
                    userPreferences,
                    amendedLocations,
                  );
                } else {
                  setUserLocations(allLocations);
                }

                if (allLocations.length === 0) {
                  await cancelNotifications("fajr");
                  await cancelNotifications("sunrise");
                  await cancelNotifications("dhuhr");
                  await cancelNotifications("asr");
                  await cancelNotifications("maghrib");
                  await cancelNotifications("isha");
                }

                if (
                  allLocations.length === 0 &&
                  userPreferences.dailyNotificationOption === "afterIsha"
                ) {
                  await cancelNotifications("Daily Reminder");
                }
              } catch (error) {
                console.error(error);
              } finally {
                // if (
                //   allLocations.length === 0 &&
                //   userPreferences.dailyNotificationOption === "afterIsha"
                // ) {
                // await updateUserPrefs(
                //   dbConnection,
                //   "dailyNotificationOption",
                //   "fixedTime",
                //   setUserPreferences,
                // );
                // const [hour, minute] = userPreferences.dailyNotificationTime
                //   .split(":")
                //   .map(Number);
                // await cancelNotifications("Daily Reminder");
                // await scheduleFixedTimeDailyNotification(hour, minute);
                // }

                await toggleDBConnection(dbConnection, "close");
              }
            },
          },
          {
            text: "Cancel",
            role: "cancel",
            handler: async () => {
              // setShowDeleteLocationActionSheet(false);
              // setCounterId(null);
            },
          },
        ]}
      />
    </IonModal>
  );
};

export default BottomSheetLocationsList;
