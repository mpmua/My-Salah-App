import { IonCheckbox, IonIcon, IonInput, useIonLoading } from "@ionic/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Geolocation } from "@capacitor/geolocation";

import { AndroidSettings } from "capacitor-native-settings";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { Capacitor } from "@capacitor/core";
import { useState } from "react";
import cities from "../assets/cities.json";

import {
  chevronBackOutline,
  chevronForwardOutline,
  closeCircle,
  locate,
  lockClosedOutline,
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
const fieldStyles =
  "rounded-lg border border-[color:var(--sheet-input-border-color)] !bg-[var(--sheet-bg-color)] text-[var(--ion-text-color)] ![--padding-start:1rem] ![--padding-end:1rem] ![--placeholder-color:var(--sheet-secondary-text-color)] ![--placeholder-opacity:1]";

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

  const handleSave = async () => {
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

    if (locationNames.includes(locationNameTrimmed.toLowerCase())) {
      setShowError((prev) => ({
        ...prev,
        emptyLocationError: false,
        duplicateLocationError: true,
      }));
      return;
    }

    if (coords.latitude !== null && coords.longitude !== null && locationName) {
      try {
        const isSelected =
          userLocations.length === 0 || isDefaultLocationCheckBoxChecked
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
          throw new Error("Failed to insert location: no ID returned");
        }

        const { allLocations } = await fetchAllLocations(dbConnection);
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
  };

  const reducedMotion = useReducedMotion();
  // Steps slide sideways (options <-> form). No motion when the user asks for reduced motion,
  // or in onboarding, where this sits inside a swiper slide.
  const stepMotion = (offset: number) =>
    reducedMotion || onboardingMode
      ? { initial: false as const }
      : {
          initial: { x: offset, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: offset, opacity: 0 },
          transition: { duration: 0.18, ease: "easeOut" as const },
        };

  const isCityStep = mode === "manualCitySearch" || isCityNameClicked;
  const formTitle =
    mode === "gps"
      ? "Name location"
      : mode === "manualCoords"
        ? "Enter coordinates"
        : "Search for a city";
  const formSubtitle =
    mode === "gps"
      ? "Choose a name you'll recognise later."
      : mode === "manualCoords"
        ? "Use decimal degrees for a precise location."
        : null;
  const cityResults =
    mode === "manualCitySearch" && locationName
      ? allCities
          .filter((obj) => obj.search.startsWith(locationName.toLowerCase()))
          .slice(0, 5)
      : [];

  const nameError = (showError.emptyLocationError ||
    showError.duplicateLocationError) && (
    <p className="mt-1.5 text-xs text-red-500">
      {showError.emptyLocationError
        ? "Please enter a location name"
        : "Location already exists"}
    </p>
  );

  return (
    <section
      // className={`${showAddLocationForm ? "opacity-0" : "opacity-100"}`}
      className={`pb-[calc(2rem+env(safe-area-inset-bottom))] ${onboardingMode ? "" : "px-5"}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {showAddLocationForm ? (
          <motion.div
            key="form"
            {...stepMotion(24)}
            className={onboardingMode ? "" : "pt-5"}
          >
            <button
              type="button"
              className="-ml-1 flex min-h-11 items-center gap-1 text-base"
              onClick={handleInputPromptDismissed}
            >
              <IonIcon
                aria-hidden="true"
                className="text-xl"
                icon={chevronBackOutline}
              />
              Back
            </button>
            <h2 className="mb-0 mt-2 text-[1.875rem] font-semibold leading-tight">
              {formTitle}
            </h2>
            {formSubtitle && (
              <p className="mt-1 text-[0.9375rem] leading-relaxed text-[var(--sheet-secondary-text-color)]">
                {formSubtitle}
              </p>
            )}

            {isCityStep ? (
              <div className="mt-6">
                <div className="flex items-center gap-2 rounded-lg border border-[color:var(--sheet-input-border-color)] bg-[var(--sheet-bg-color)] pl-3">
                  <IonIcon
                    aria-hidden="true"
                    className="text-xl text-[var(--sheet-secondary-text-color)]"
                    icon={searchOutline}
                  />
                  <IonInput
                    className="min-w-0 flex-1 !bg-transparent text-[var(--ion-text-color)] ![--padding-start:0] ![--placeholder-color:var(--sheet-secondary-text-color)] ![--placeholder-opacity:1]"
                    aria-label="Search for a city"
                    type="text"
                    // disabled={isCityNameClicked ? true : false}
                    readonly={isCityNameClicked ? true : false}
                    placeholder="e.g. London"
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
                    <button
                      type="button"
                      aria-label="Clear selected city"
                      className="flex size-11 items-center justify-center text-xl text-[var(--sheet-secondary-text-color)]"
                      onClick={() => {
                        setLocationName("");
                        setIsCityNameClicked(false);
                        setMode("manualCitySearch");
                      }}
                    >
                      <IonIcon aria-hidden="true" icon={closeCircle} />
                    </button>
                  )}
                </div>
                {nameError}
                {cityResults.length > 0 && (
                  <>
                    <p className="mb-2 mt-5 text-sm font-semibold text-[var(--sheet-secondary-text-color)]">
                      Results
                    </p>
                    <ul className="sheet-group">
                      {cityResults.map((obj) => (
                        <li key={obj.latitude + obj.longitude}>
                          <button
                            type="button"
                            className="flex w-full items-center gap-3 px-3 py-3 text-left"
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
                            <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--sheet-icon-bg-color)] text-[var(--ion-color-primary)]">
                              <IonIcon
                                aria-hidden="true"
                                className="text-[1.375rem]"
                                icon={locationOutline}
                              />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="font-semibold leading-snug">
                                {obj.city}
                              </span>
                              <span className="mt-0.5 block text-sm leading-snug text-[var(--sheet-secondary-text-color)]">
                                {obj.country}
                              </span>
                            </span>
                            <IonIcon
                              aria-hidden="true"
                              className="text-lg text-[var(--sheet-secondary-text-color)]"
                              icon={chevronForwardOutline}
                            />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-6">
                {mode === "manualCoords" && (
                  <>
                    <p className="mb-2 text-sm font-semibold">Latitude</p>
                    <IonInput
                      className={fieldStyles}
                      aria-label="Latitude"
                      type="text"
                      placeholder="e.g. 51.5074"
                      value={coords.latitude}
                      onIonInput={(e) => {
                        setCoords((prev) => ({
                          ...prev,
                          latitude: Number(e.detail.value) || null,
                        }));
                      }}
                    ></IonInput>
                    {showError.emptyLatitudeError && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {"Please enter latitude"}
                      </p>
                    )}
                    <p className="mb-2 mt-4 text-sm font-semibold">Longitude</p>
                    <IonInput
                      className={fieldStyles}
                      aria-label="Longitude"
                      type="text"
                      placeholder="e.g. -0.1278"
                      value={coords.longitude}
                      onIonInput={(e) => {
                        setCoords((prev) => ({
                          ...prev,
                          longitude: Number(e.detail.value) || null,
                        }));
                      }}
                    ></IonInput>
                    {showError.emptyLongitudeError && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {"Please enter longitude"}
                      </p>
                    )}
                    <p className="mt-1.5 text-xs text-[var(--sheet-secondary-text-color)]">
                      South and west use a minus sign.
                    </p>
                  </>
                )}
                <p
                  className={`mb-2 text-sm font-semibold ${mode === "manualCoords" ? "mt-4" : ""}`}
                >
                  Location name
                </p>
                <IonInput
                  className={fieldStyles}
                  aria-label="Location name"
                  type="text"
                  placeholder="e.g. Home, Work, City Name"
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
                {nameError}
              </div>
            )}

            {userLocations && userLocations.length > 0 && (
              <IonCheckbox
                className="mt-5 [--border-radius:0.25rem]"
                labelPlacement="end"
                checked={isDefaultLocationCheckBoxChecked}
                onIonChange={(e) =>
                  setIsDefaultLocationCheckBoxChecked(e.detail.checked)
                }
              >
                Make this my default location
              </IonCheckbox>
            )}
            <button
              type="button"
              className="mt-6 w-full rounded-lg bg-[var(--ion-color-primary)] px-4 py-3 text-[0.9375rem] font-semibold text-[var(--ion-color-primary-contrast)]"
              onClick={handleSave}
            >
              Save location
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="options"
            {...stepMotion(-24)}
            className={onboardingMode ? "" : "pt-11"}
          >
            {!onboardingMode && (
              <h2 className="mb-1 mt-0 text-[1.875rem] font-semibold leading-tight">
                Add location
              </h2>
            )}
            <p className="text-[0.9375rem] leading-relaxed text-[var(--sheet-secondary-text-color)]">
              Prayer times are calculated from this location.
            </p>
            <section className="sheet-group mt-5" aria-label="Location methods">
              <button
                type="button"
                className="flex w-full items-center gap-3 px-3 py-[0.9375rem] text-left"
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
                <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--sheet-icon-bg-color)] text-[var(--ion-color-primary)]">
                  <IonIcon
                    aria-hidden="true"
                    className="text-[1.375rem]"
                    icon={locationOutline}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1 font-semibold leading-snug">
                    Use my location
                    <span className="whitespace-nowrap rounded-full bg-[var(--sheet-icon-bg-color)] px-1.5 py-0.5 text-[0.6875rem] leading-tight text-[var(--sheet-tag-text-color)]">
                      Most accurate
                    </span>
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug text-[var(--sheet-secondary-text-color)]">
                    Asks for location permission
                  </span>
                </span>
                <IonIcon
                  aria-hidden="true"
                  className="text-lg text-[var(--sheet-secondary-text-color)]"
                  icon={chevronForwardOutline}
                />
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-3 py-[0.9375rem] text-left"
                onClick={() => {
                  if (showAddLocationForm) return;
                  setShowAddLocationForm(true);
                  setMode("manualCitySearch");
                }}
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--sheet-icon-bg-color)] text-[var(--ion-color-primary)]">
                  <IonIcon
                    aria-hidden="true"
                    className="text-[1.375rem]"
                    icon={searchOutline}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-semibold leading-snug">
                    Search for a city
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug text-[var(--sheet-secondary-text-color)]">
                    Built-in list, works offline
                  </span>
                </span>
                <IonIcon
                  aria-hidden="true"
                  className="text-lg text-[var(--sheet-secondary-text-color)]"
                  icon={chevronForwardOutline}
                />
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-3 py-[0.9375rem] text-left"
                onClick={() => {
                  if (showAddLocationForm) return;
                  setMode("manualCoords");
                  setShowAddLocationForm(true);
                }}
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--sheet-icon-bg-color)] text-[var(--ion-color-primary)]">
                  <IonIcon
                    aria-hidden="true"
                    className="text-[1.375rem]"
                    icon={locate}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-semibold leading-snug">
                    Enter coordinates
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug text-[var(--sheet-secondary-text-color)]">
                    Exact latitude and longitude
                  </span>
                </span>
                <IonIcon
                  aria-hidden="true"
                  className="text-lg text-[var(--sheet-secondary-text-color)]"
                  icon={chevronForwardOutline}
                />
              </button>
            </section>
            <p className="mt-4 flex items-center gap-2 px-1 text-xs leading-relaxed text-[var(--sheet-secondary-text-color)]">
              <IonIcon
                aria-hidden="true"
                className="shrink-0 text-[0.9375rem]"
                icon={lockClosedOutline}
              />
              <span>This app never sends your location anywhere.</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AddLocationOptions;
