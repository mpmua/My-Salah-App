import {
  IonButton,
  IonCheckbox,
  IonIcon,
  IonInput,
  useIonLoading,
} from "@ionic/react";
import { AnimatePresence, motion } from "framer-motion";
import { Geolocation } from "@capacitor/geolocation";

import { AndroidSettings } from "capacitor-native-settings";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { Capacitor } from "@capacitor/core";
import { useState } from "react";
import cities from "../assets/cities.json";

import {
  closeCircle,
  locate,
  locationOutline,
  searchOutline,
} from "ionicons/icons";
import { LocationsDataObjTypeArr, OnboardingMode } from "../types/types";
import { promptToOpenDeviceSettings, showAlert } from "../utils/helpers";
import { fetchAllLocations, toggleDBConnection } from "../utils/dbUtils";

const allCities = cities.map(
  (obj: { country: string; name: string; lat: string; lng: string }) => {
    return {
      country: obj.country,
      city: obj.name,
      latitude: obj.lat,
      longitude: obj.lng,
      search: obj.name.toLowerCase(),
    };
  },
);
interface AddLocationOptionsProps {
  // setShowSalahTimesSettingsSheet?: React.Dispatch<
  //   React.SetStateAction<boolean>
  // >;
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  setUserLocations: React.Dispatch<
    React.SetStateAction<LocationsDataObjTypeArr>
  >;
  userLocations: LocationsDataObjTypeArr;
  setShowLocationFailureToast: React.Dispatch<React.SetStateAction<boolean>>;
  setShowLocationAddedToast: React.Dispatch<React.SetStateAction<boolean>>;
  onboardingMode?: OnboardingMode;
  switchToNextPage?: () => void;
  setShowAddLocationSheet?: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddLocationOptions = ({
  dbConnection,
  setUserLocations,
  userLocations,
  setShowLocationFailureToast,
  setShowLocationAddedToast,
  onboardingMode,
  switchToNextPage,
  setShowAddLocationSheet,
}: AddLocationOptionsProps) => {
  type CoordsObjType = {
    latitude: null | number;
    longitude: null | number;
  };

  type modeType = "gps" | "manualCitySearch" | "manualCoords" | null;

  const [presentLocationSpinner, dismissLocationSpinner] = useIonLoading();
  const [showAddLocationForm, setShowAddLocationForm] =
    useState<boolean>(false);
  const [locationName, setLocationName] = useState("");
  const [showError, setShowError] = useState({
    emptyLocationError: false,
    duplicateLocationError: false,
    emptyLatitudeError: false,
    emptyLongitudeError: false,
  });
  const [coords, setCoords] = useState<CoordsObjType>({
    latitude: null,
    longitude: null,
  });
  const [isCityNameClicked, setIsCityNameClicked] = useState(false);
  const [mode, setMode] = useState<modeType>(null);
  const [
    isDefaultLocationCheckBoxChecked,
    setIsDefaultLocationCheckBoxChecked,
  ] = useState(false);

  const addUserLocation = async (
    dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>,
    locationName: string,
    latitude: number,
    longitude: number,
    isSelected: number,
  ) => {
    const stmnt = `INSERT INTO userLocationsTable (locationName, latitude, longitude, isSelected) 
        VALUES (?, ?, ?, ?);
        `;

    if (!dbConnection || !dbConnection.current) {
      throw new Error("dbConnection / dbconnection.current does not exist");
    }

    if (isDefaultLocationCheckBoxChecked && isSelected === 1) {
      await dbConnection.current.run(
        `UPDATE userLocationsTable SET isSelected = 0`,
      );
    }

    const params = [locationName, latitude, longitude, isSelected];
    const lastId = await dbConnection.current.run(stmnt, params);
    return lastId;
  };

  const handleInputPromptDismissed = () => {
    setShowAddLocationForm(false);
    setLocationName("");
    setCoords({ latitude: null, longitude: null });
    setShowError({
      emptyLocationError: false,
      duplicateLocationError: false,
      emptyLatitudeError: false,
      emptyLongitudeError: false,
    });
    setMode(null);
    setIsDefaultLocationCheckBoxChecked(false);
    setIsCityNameClicked(false);
  };

  const handleGrantedPermission = async () => {
    try {
      await presentLocationSpinner({
        message: "Detecting location...",
        backdropDismiss: false,
        cssClass: "ion-spinner",
      });

      const location = await Geolocation.getCurrentPosition({
        // enableHighAccuracy: true, <-- Unsure if required
        timeout: 10000,
        maximumAge: 0,
      });

      setCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // await dismissLocationSpinner();
      setShowAddLocationForm(true);
    } catch (error) {
      setShowLocationFailureToast(true);
      // console.log("Failed to obtain location");
      console.error(error);

      showAlert(
        "Location request timed out",
        `"The app couldn’t get your location. Make sure your device has a good GPS or network signal and try again."`,
      );
    } finally {
      await dismissLocationSpinner();
    }
  };

  const showLocationServicesPrompt = async () => {
    if (Capacitor.getPlatform() === "android") {
      await promptToOpenDeviceSettings(
        "Turn On Location Services",
        "You currently have location services turned off for your device, please enable them to use this feature.",
        AndroidSettings.Location,
      );
    } else {
      showAlert(
        "Turn On Location Services",
        "You currently have location services turned off for your device, please enable them to use this feature.",
      );
    }
  };

  const handleLocationPermissions = async () => {
    try {
      const permissions = await Geolocation.checkPermissions();
      const preciseLocation = permissions.location;
      const coarseLocation = permissions.coarseLocation;

      if (preciseLocation === "granted" || coarseLocation === "granted") {
        await handleGrantedPermission();
      } else if (
        preciseLocation === "prompt" ||
        preciseLocation === "prompt-with-rationale" ||
        coarseLocation === "prompt" ||
        coarseLocation === "prompt-with-rationale"
      ) {
        try {
          if (
            Capacitor.getPlatform() === "ios" ||
            Capacitor.getPlatform() === "android"
          ) {
            const permissionRequest = await Geolocation.requestPermissions();

            if (
              permissionRequest.location === "granted" ||
              permissionRequest.coarseLocation === "granted"
            ) {
              await handleGrantedPermission();
            }
          } else if (Capacitor.getPlatform() === "web") {
            const pos = await Geolocation.getCurrentPosition();
            if (pos.coords) {
              await handleGrantedPermission();
            }
          }
        } catch (error) {
          console.error(error);
          if (
            error instanceof Error &&
            error.message.includes("Location services are not enabled")
          ) {
            await showLocationServicesPrompt();
          }
        }
      } else if (preciseLocation === "denied" || coarseLocation === "denied") {
        await promptToOpenDeviceSettings(
          `Location permission off`,
          "You currently have location turned off for this application, you can open Settings to re-enable it.",
          AndroidSettings.Location,
        );
      }
    } catch (error) {
      console.error("handleLocationPermissions error", error);
      if (
        error instanceof Error &&
        error.message.includes("Location services are not enabled")
      ) {
        await showLocationServicesPrompt();
      } else {
        // await dismissLocationSpinner();
        showAlert(
          "Location unavailable",
          "Your device’s location couldn’t be determined. Check that location services are on and permissions are granted, then try again.",
        );
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {showAddLocationForm && (
          <motion.section
            initial={{ x: "50%", opacity: 0 }}
            animate={{ x: "-50%", opacity: 1 }}
            exit={onboardingMode ? "" : { x: "50%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-[15%] left-1/2 w-4/5 max-w-[300px] z-10 rounded-lg
             flex flex-col items-center justify-center -translate-y-[15%] bg-[var(--card-bg-color)]"
          >
            <div className="pt-3 text-center">
              {mode === "gps" && <p className="text-xs">Name this location</p>}
              <div className="flex items-center">
                <IonInput
                  className="w-full min-w-0 px-2 py-2 rounded-lg"
                  aria-label="Location name"
                  type="text"
                  // disabled={isCityNameClicked ? true : false}
                  readonly={isCityNameClicked ? true : false}
                  placeholder={
                    mode === "gps"
                      ? "e.g. Home, Work, City Name"
                      : "Enter Location Name"
                  }
                  onIonInput={(e) => {
                    setLocationName(e.detail.value || "");
                    setShowError((prev) => ({
                      ...prev,
                      duplicateLocationError: false,
                      emptyLocationError: false,
                    }));
                  }}
                  value={locationName}
                ></IonInput>

                {isCityNameClicked && (
                  <IonButton
                    className=""
                    onClick={() => {
                      setLocationName("");
                      setIsCityNameClicked(false);
                      setMode("manualCitySearch");
                    }}
                    // size="small"
                    fill="clear"
                    color="danger"
                  >
                    <IonIcon icon={closeCircle} />{" "}
                  </IonButton>
                )}
              </div>
              {mode === "manualCitySearch" && locationName && (
                <ul>
                  {allCities
                    .filter((obj) =>
                      obj.search.startsWith(locationName.toLowerCase()),
                    )
                    .slice(0, 5)
                    .map((obj) => (
                      <li
                        key={obj.latitude + obj.longitude}
                        className="block py-5 border-b border-stone-700"
                        onClick={() => {
                          setLocationName(`${obj.city} - ${obj.country}`);
                          setCoords({
                            latitude: Number(obj.latitude),
                            longitude: Number(obj.longitude),
                          });
                          setMode(null);
                          setIsCityNameClicked(true);
                        }}
                      >
                        {obj.city}, {obj.country}
                      </li>
                    ))}
                </ul>
              )}
              <p
                className={`mb-1 text-xs text-red-500 ${
                  showError.emptyLocationError ||
                  showError.duplicateLocationError
                    ? "visible"
                    : "invisible"
                }`}
              >
                {showError.emptyLocationError
                  ? "Please enter a location name"
                  : "Location already exists"}
              </p>
              {mode === "manualCoords" && (
                <>
                  <IonInput
                    className="w-full min-w-0 px-2 py-2 mt-2 rounded-lg"
                    aria-label="Latitude"
                    type="text"
                    placeholder="Latitude"
                    value={coords.latitude}
                    onIonInput={(e) => {
                      setCoords((prev) => ({
                        ...prev,
                        latitude: Number(e.detail.value) || null,
                      }));
                    }}
                  ></IonInput>
                  <p
                    className={`mb-1 text-xs text-red-500 ${
                      showError.emptyLatitudeError ? "visible" : "invisible"
                    }`}
                  >
                    {"Please enter latitude"}
                  </p>
                  <IonInput
                    className="w-full min-w-0 px-2 py-2 mt-2 rounded-lg"
                    aria-label="Longitude"
                    type="text"
                    placeholder="Longitude"
                    value={coords.longitude}
                    onIonInput={(e) => {
                      setCoords((prev) => ({
                        ...prev,
                        longitude: Number(e.detail.value) || null,
                      }));
                    }}
                  ></IonInput>
                  <p
                    className={`mb-1 text-xs text-red-500 ${
                      showError.emptyLongitudeError ? "visible" : "invisible"
                    }`}
                  >
                    {"Please enter longitude"}
                  </p>
                </>
              )}
            </div>
            {userLocations && userLocations.length > 0 && (
              <IonCheckbox
                className="mb-4 text-xs"
                labelPlacement="end"
                checked={isDefaultLocationCheckBoxChecked}
                onIonChange={(e) =>
                  setIsDefaultLocationCheckBoxChecked(e.detail.checked)
                }
              >
                Make this the default location
              </IonCheckbox>
            )}
            <div className="flex justify-center w-full gap-4">
              <IonButton
                className="p-0 text-base text-[var(--ion-text-color)]"
                size="small"
                color="medium"
                fill="solid"
                onClick={() => {
                  handleInputPromptDismissed();
                }}
              >
                Cancel
              </IonButton>
              <IonButton
                className="text-base"
                size="small"
                // fill="clear"
                onClick={async () => {
                  setShowError({
                    emptyLocationError: false,
                    duplicateLocationError: false,
                    emptyLatitudeError: false,
                    emptyLongitudeError: false,
                  });
                  const locationNameTrimmed = locationName.trim();

                  if (locationNameTrimmed === "") {
                    setShowError((prev) => ({
                      ...prev,
                      emptyLocationError: true,
                    }));
                  }

                  if (coords.latitude === null) {
                    setShowError((prev) => ({
                      ...prev,
                      emptyLatitudeError: true,
                    }));
                  }

                  if (coords.longitude === null) {
                    setShowError((prev) => ({
                      ...prev,
                      emptyLongitudeError: true,
                    }));
                  }

                  if (
                    locationNameTrimmed === "" ||
                    coords.latitude === null ||
                    coords.longitude === null
                  )
                    return;

                  if (!userLocations) {
                    console.error("LocationNames state is undefined");
                    return;
                  }

                  const locationNames = userLocations.map((loc) =>
                    loc.locationName.toLowerCase(),
                  );

                  if (
                    locationNames.includes(locationNameTrimmed.toLowerCase())
                  ) {
                    setShowError((prev) => ({
                      ...prev,
                      emptyLocationError: false,
                      duplicateLocationError: true,
                    }));
                    return;
                  }

                  if (
                    coords.latitude !== null &&
                    coords.longitude !== null &&
                    locationName
                  ) {
                    try {
                      const isSelected =
                        userLocations.length === 0 ||
                        isDefaultLocationCheckBoxChecked
                          ? 1
                          : 0;

                      await toggleDBConnection(dbConnection, "open");

                      const result = await addUserLocation(
                        dbConnection,
                        locationName,
                        coords.latitude,
                        coords.longitude,
                        isSelected,
                      );

                      if (!result?.changes?.lastId) {
                        throw new Error(
                          "Failed to insert location: no ID returned",
                        );
                      }

                      const { allLocations } =
                        await fetchAllLocations(dbConnection);
                      // console.log(
                      //   "FETCH ALL LOCATIONS CALLE FROM ADD LOCATION SHEET: ",
                      //   allLocations
                      // );

                      if (allLocations) {
                        // if (allLocations.length === 1) {
                        //   setShowSalahTimesSettingsSheet?.(true);
                        // }
                        // setShowAddLocationSheet(false);
                        setUserLocations(allLocations);
                        if (!onboardingMode) {
                          setShowLocationAddedToast(true);
                        }
                        setShowAddLocationSheet?.(false);
                        // setUserLocations([
                        //   ...userLocations,
                        //   {
                        //     id: result.changes.lastId,
                        //     locationName: locationName,
                        //     latitude: latitude,
                        //     longitude: longitude,
                        //     isSelected: userLocations.length === 0 ? 1 : 0,
                        //   },
                        // ]);
                        setUserLocations(allLocations);
                      } else {
                        console.error("Locations undefined");
                      }

                      handleInputPromptDismissed();
                    } catch (error) {
                    } finally {
                      await toggleDBConnection(dbConnection, "close");
                    }
                  } else {
                    console.error("lat / long undefined");
                    return;
                  }

                  if (onboardingMode !== null && switchToNextPage) {
                    switchToNextPage();
                  }
                }}
              >
                Save
              </IonButton>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
      <motion.section
        animate={{ opacity: showAddLocationForm ? 0 : 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        // className={`${showAddLocationForm ? "opacity-0" : "opacity-100"}`}
      >
        <div className="px-2 mx-5 mb-4 text-sm text-center">
          <p>
            To calculate Salah times, the app requires your location, you can
            use one of the three methods below. <br></br>
            <br></br>For the most accurate results, the first two options are
            recommended.
          </p>
        </div>
        <section className="mx-4">
          <div
            className=" text-center border-transparent p-2 mb-5 rounded-lg bg-[var(--sheet-option-bg)]"
            onClick={async () => {
              if (showAddLocationForm) return;

              setMode("gps");
              // presentLocationSpinner({
              //   message: "Detecting location...",
              //   backdropDismiss: false,
              // });
              try {
                await handleLocationPermissions();
              } catch (error) {
                console.error(error);
              }
              // finally {
              //   await dismissLocationSpinner();
              // }
            }}
          >
            <div className="mr-2">
              <IonIcon className="text-lg" icon={locationOutline} />{" "}
            </div>
            <div>
              <p className="mt-0">Use Device GPS</p>
              <p className="text-xs opacity-80">
                Determine Location Automatically
              </p>
            </div>
          </div>

          <div
            className=" text-center border-transparent p-2 mb-5 rounded-lg  bg-[var(--sheet-option-bg)]"
            onClick={() => {
              if (showAddLocationForm) return;
              setMode("manualCoords");
              setShowAddLocationForm(true);
            }}
          >
            <div className="mr-2">
              <IonIcon className="text-lg" icon={locate} />{" "}
            </div>
            <div>
              <p className="mt-0">Enter Coordinates</p>
              <p className="text-xs opacity-80">
                {" "}
                Manually enter a latitude and longitude if you already know the
                exact location
              </p>
            </div>
          </div>
          <div
            className="text-center border-transparent p-2 mb-5 rounded-lg bg-[var(--sheet-option-bg)]"
            onClick={() => {
              if (showAddLocationForm) return;
              setShowAddLocationForm(true);
              setMode("manualCitySearch");
            }}
          >
            <div className="mr-2">
              <IonIcon className="text-lg" icon={searchOutline} />{" "}
            </div>
            <div>
              <p className="mt-0">Search Manually</p>
              <p className="text-xs opacity-80">
                {" "}
                Search for a city by name and select it from the results
              </p>
            </div>
          </div>
        </section>
      </motion.section>
    </>
  );
};

export default AddLocationOptions;
