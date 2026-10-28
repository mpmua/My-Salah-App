import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillLeave,
} from "@ionic/react";
import {
  LocationsDataObjTypeArr,
  nextSalahTimeType,
  OnboardingMode,
  SalahNamesTypeAdhanLibrary,
  salahTimesObjType,
  userPreferencesType,
} from "../types/types";

import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import {
  chevronBackOutline,
  chevronDown,
  chevronForwardOutline,
  locationOutline,
  megaphoneOutline,
  notificationsOffOutline,
  notificationsOutline,
  timeOutline,
} from "ionicons/icons";

import { useState } from "react";
import Toast from "../components/Toast";
import {
  getSalahTimes,
  handleNotificationPermissions,
  upperCaseFirstLetter,
} from "../utils/helpers";
import BottomSheetLocationsList from "../components/BottomSheets/SalahTimesSheets/BottomSheetLocationsList";
import BottomSheetAddLocation from "../components/BottomSheets/SalahTimesSheets/BottomSheetAddLocation";
import BottomSheetPerSalahNotifications from "../components/BottomSheets/SalahTimesSheets/BottomSheetPerSalahNotifications";
import { addDays, format, isSameDay } from "date-fns";
import {
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
  prayerCalculationMethodLabels,
} from "../utils/constants";
import Onboarding from "../components/Onboarding";
import CalculationMethodOptions from "../components/CalculationMethodOptions";

interface SalahTimesPageProps {
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  setShowMultiEditIntro: React.Dispatch<React.SetStateAction<boolean>>;
  setUserPreferences: React.Dispatch<React.SetStateAction<userPreferencesType>>;
  userPreferences: userPreferencesType;
  setUserLocations: React.Dispatch<
    React.SetStateAction<LocationsDataObjTypeArr>
  >;
  userLocations: LocationsDataObjTypeArr;
  setSalahtimes: React.Dispatch<React.SetStateAction<salahTimesObjType>>;
  salahTimes: salahTimesObjType;
  nextSalahNameAndTime: nextSalahTimeType;
  setShowLocationFailureToast: React.Dispatch<React.SetStateAction<boolean>>;
  showLocationFailureToast: boolean;
  setShowLocationAddedToast: React.Dispatch<React.SetStateAction<boolean>>;
  showLocationAddedToast: boolean;
  setShowLocationDeletedToast: React.Dispatch<React.SetStateAction<boolean>>;
  showLocationDeletedToast: boolean;
  setOnboardingMode: React.Dispatch<React.SetStateAction<OnboardingMode>>;
  onboardingMode?: OnboardingMode;
}

const SalahTimesPage = ({
  dbConnection,
  setShowMultiEditIntro,
  setUserPreferences,
  userPreferences,
  setUserLocations,
  userLocations,
  setSalahtimes,
  salahTimes,
  nextSalahNameAndTime,
  setShowLocationFailureToast,
  showLocationFailureToast,
  setShowLocationAddedToast,
  showLocationAddedToast,
  setShowLocationDeletedToast,
  showLocationDeletedToast,
  setOnboardingMode,
  onboardingMode,
}: SalahTimesPageProps) => {
  const [showAddLocationSheet, setShowAddLocationSheet] = useState(false);
  const [showLocationsListSheet, setShowLocationsListSheet] = useState(false);

  const [selectedSalah, setSelectedSalah] =
    useState<SalahNamesTypeAdhanLibrary>("fajr");
  const [showSalahNotificationsSheet, setShowSalahNotificationsSheet] =
    useState(false);
  const [dateToShow, setDateToShow] = useState(new Date());
  const [showCalcMethodsSheet, setShowCalcMethodsSheet] = useState(false);
  const [segmentOption, setSegmentOption] = useState<"manual" | "country">(
    "country",
  );

  useIonViewWillLeave(() => {
    setDateToShow(new Date());
  });

  const hoursText =
    nextSalahNameAndTime.hoursRemaining > 0
      ? `${nextSalahNameAndTime.hoursRemaining}h`
      : "";
  const minsText =
    nextSalahNameAndTime.minsRemaining > 0
      ? `${nextSalahNameAndTime.minsRemaining}m`
      : "";
  const timeUntilNextSalah = [hoursText, minsText].filter(Boolean).join(" ");

  const salahStart = nextSalahNameAndTime.currentSalahStartTime;
  const salahEnd = nextSalahNameAndTime.nextSalahTime;
  let salahTimeLeftPercent: number | null = null;
  if (salahStart && salahEnd) {
    const remaining = salahEnd.getTime() - Date.now();
    const total = salahEnd.getTime() - salahStart.getTime();
    salahTimeLeftPercent = Math.min(
      100,
      Math.max(0, (remaining / total) * 100),
    );
  }

  const salahProgressBar = salahTimeLeftPercent !== null && (
    <div
      aria-hidden="true"
      className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--sheet-pill-bg)]"
    >
      <div
        className="h-full rounded-full bg-[var(--current-salah-color)]"
        style={{ width: `${salahTimeLeftPercent}%` }}
      />
    </div>
  );

  const isShowingToday = isSameDay(dateToShow, new Date());

  const relativeDayLabel = isShowingToday
    ? "Today"
    : isSameDay(addDays(new Date(), -1), dateToShow)
      ? "Yesterday"
      : isSameDay(addDays(new Date(), 1), dateToShow)
        ? "Tomorrow"
        : "";

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="page-header-toolbar">
          <IonTitle>Salah Times</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {/* bg-[var(--card-bg-color)]  */}
        <section className="salah-times-page-components-wrap">
          {userLocations?.map((location) => (
            <section key={location.id}>
              {location.isSelected === 1 ? (
                <button
                  key={location.id}
                  className="mb-6 flex items-center gap-2 py-1 text-[1.0625rem]"
                  onClick={() => {
                    setShowLocationsListSheet(true);
                  }}
                >
                  <IonIcon className="text-xl" icon={locationOutline} />
                  <span>{location.locationName}</span>
                  <IonIcon className="text-base" icon={chevronDown} />
                </button>
              ) : (
                ""
              )}
            </section>
          ))}{" "}
          {userPreferences.prayerCalculationMethod !== "" &&
            userLocations?.length !== 0 && (
              <>
                {nextSalahNameAndTime.nextSalah !== "dhuhr" && (
                  <section className="rounded-2xl bg-[var(--card-bg-color)] p-5">
                    {nextSalahNameAndTime.currentSalah !== "sunrise" && (
                      <div>
                        <p className="text-[1.375rem] font-bold leading-tight">
                          Current Salah
                        </p>
                        <p className="text-[2.75rem] font-bold leading-tight text-[var(--current-salah-color)]">
                          {upperCaseFirstLetter(
                            nextSalahNameAndTime.currentSalah === "none"
                              ? "isha"
                              : nextSalahNameAndTime.currentSalah,
                          )}
                        </p>
                      </div>
                    )}
                    <p className="mt-1 text-[1.0625rem] text-[var(--secondary-text-color)]">
                      {upperCaseFirstLetter(nextSalahNameAndTime.nextSalah)}
                      {timeUntilNextSalah && ` in ${timeUntilNextSalah}`}
                    </p>
                    {salahProgressBar}
                  </section>
                )}
                {nextSalahNameAndTime.nextSalah === "dhuhr" &&
                  nextSalahNameAndTime.currentSalah === "sunrise" && (
                    <section className="rounded-2xl bg-[var(--card-bg-color)] p-5">
                      <p className="text-[1.375rem] font-bold leading-tight">
                        Upcoming Salah
                      </p>
                      <p className="text-[2.75rem] font-bold leading-tight">
                        {upperCaseFirstLetter(nextSalahNameAndTime.nextSalah)}
                      </p>
                      {timeUntilNextSalah && (
                        <p className="mt-1 text-[1.0625rem] text-[var(--secondary-text-color)]">
                          Starts in {timeUntilNextSalah}
                        </p>
                      )}
                      {salahProgressBar}
                    </section>
                  )}
              </>
            )}
          <>
            <section
            // className="flex flex-col items-center justify-center h-full text-center"
            >
              {(userPreferences.prayerCalculationMethod === "" ||
                userLocations.length === 0) && (
                <div className="flex flex-col items-center pt-4 text-center">
                  <IonIcon
                    className="text-[4.5rem] text-[var(--secondary-text-color)]"
                    icon={timeOutline}
                  />
                  <h2 className="mt-3 text-[1.375rem] font-bold leading-tight">
                    Set up Salah times
                  </h2>
                  {userPreferences.prayerCalculationMethod === "" &&
                    userLocations.length === 0 && (
                      <>
                        <p className="mt-2 text-[var(--secondary-text-color)]">
                          Add a location and calculation method to see local
                          times.
                        </p>
                        <IonButton
                          mode="ios"
                          expand="block"
                          onClick={() => {
                            setOnboardingMode("salahTimes");
                            // setOnboardingMode(true);
                          }}
                          className="mx-0 mb-0 mt-6 w-full text-[0.9375rem] font-semibold"
                        >
                          Set up Salah times
                        </IonButton>
                      </>
                    )}
                  {userPreferences.prayerCalculationMethod === "" &&
                    userLocations.length > 0 && (
                      <>
                        <p className="mt-2 text-[var(--secondary-text-color)]">
                          Choose a calculation method to see local times.
                        </p>
                        <IonButton
                          mode="ios"
                          expand="block"
                          onClick={() => {
                            setShowCalcMethodsSheet(true);
                          }}
                          className="mx-0 mb-0 mt-6 w-full text-[0.9375rem] font-semibold"
                        >
                          Select calculation method
                        </IonButton>
                      </>
                    )}
                  {userPreferences.prayerCalculationMethod !== "" &&
                    userLocations.length === 0 && (
                      <>
                        <p className="mt-2 text-[var(--secondary-text-color)]">
                          Add a location to see local times.
                        </p>
                        <IonButton
                          mode="ios"
                          expand="block"
                          onClick={() => {
                            setShowAddLocationSheet(true);
                          }}
                          className="mx-0 mb-0 mt-6 w-full text-[0.9375rem] font-semibold"
                        >
                          Add location
                        </IonButton>
                      </>
                    )}
                </div>
              )}

              <BottomSheetAddLocation
                setShowAddLocationSheet={setShowAddLocationSheet}
                showAddLocationSheet={showAddLocationSheet}
                dbConnection={dbConnection}
                setUserLocations={setUserLocations}
                userLocations={userLocations}
                setShowLocationFailureToast={setShowLocationFailureToast}
                setShowLocationAddedToast={setShowLocationAddedToast}
              />
              <IonModal
                isOpen={showCalcMethodsSheet}
                onDidDismiss={() => {
                  setShowCalcMethodsSheet(false);
                }}
                className="modal-height"
                mode="ios"
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
                  <h1 className="mb-1 font-bold leading-tight">
                    Calculation method
                  </h1>
                  <p className="mb-5 text-[0.9375rem] leading-relaxed text-[var(--secondary-text-color)]">
                    Choose how your daily Salah times are calculated.
                  </p>
                </CalculationMethodOptions>
              </IonModal>

              <Onboarding
                setShowMultiEditIntro={setShowMultiEditIntro}
                dbConnection={dbConnection}
                setUserPreferences={setUserPreferences}
                userPreferences={userPreferences}
                setUserLocations={setUserLocations}
                userLocations={userLocations}
                setShowLocationFailureToast={setShowLocationFailureToast}
                setShowLocationAddedToast={setShowLocationAddedToast}
                setOnboardingMode={setOnboardingMode}
                onboardingMode={onboardingMode}
              />
            </section>
          </>
          {/* ))} */}
          <section
            className={`mt-5 flex items-center justify-between ${
              userLocations?.length === 0 ||
              userPreferences.prayerCalculationMethod === ""
                ? "opacity-50"
                : ""
            }`}
          >
            {" "}
            <IonButton
              fill="clear"
              onClick={async () => {
                if (!userLocations || userLocations.length === 0) {
                  return;
                }

                const nextDate = addDays(dateToShow, -1);
                setDateToShow(nextDate);

                // console.log("nextDate: ", nextDate);

                await getSalahTimes(
                  userLocations,
                  nextDate,
                  userPreferences,
                  setSalahtimes,
                );
              }}
            >
              <IonIcon
                className="text-[var(--ion-text-color)]"
                icon={chevronBackOutline}
              />
            </IonButton>
            <p className="text-[1.0625rem]">
              {relativeDayLabel && (
                <>
                  <span className="font-semibold">{relativeDayLabel}</span>
                  {" · "}
                </>
              )}
              {format(dateToShow, "EEE d MMM")}
            </p>
            <IonButton
              fill="clear"
              onClick={async () => {
                if (!userLocations || userLocations.length === 0) {
                  return;
                }

                const nextDate = addDays(dateToShow, 1);
                setDateToShow(nextDate);

                await getSalahTimes(
                  userLocations,
                  nextDate,
                  userPreferences,
                  setSalahtimes,
                );
              }}
            >
              <IonIcon
                className="text-[var(--ion-text-color)]"
                icon={chevronForwardOutline}
              />
            </IonButton>
          </section>
          <section
            className={`mt-3 border-t border-[color:var(--table-row-border-color)] ${
              userLocations?.length === 0 ||
              userPreferences.prayerCalculationMethod === ""
                ? "opacity-50"
                : ""
            }`}
          >
            {(
              Object.entries(salahTimes) as [keyof typeof salahTimes, string][]
            ).map(([name, time]) => (
              <div
                // border-[var(--ion-text-color)]
                className={`relative flex h-14 items-center justify-between border-b border-[color:var(--table-row-border-color)] pl-4 ${
                  isShowingToday &&
                  name === nextSalahNameAndTime.currentSalah &&
                  name !== "sunrise"
                    ? "before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-[var(--current-salah-color)]"
                    : ""
                }`}
                key={name + time}
              >
                <p className="text-[1.0625rem] font-semibold">
                  {upperCaseFirstLetter(name)}
                </p>
                <div className="flex items-center">
                  <p
                    className={`text-[1.0625rem] ${
                      isShowingToday &&
                      name === nextSalahNameAndTime.currentSalah &&
                      name !== "sunrise"
                        ? "font-bold text-[var(--current-salah-color)]"
                        : ""
                    }`}
                  >
                    {time === "Invalid Date" ||
                    userLocations?.length === 0 ||
                    userPreferences.prayerCalculationMethod === ""
                      ? "--:--"
                      : time}
                  </p>
                  <IonButton
                    onClick={async () => {
                      if (
                        userPreferences.prayerCalculationMethod === null ||
                        userPreferences.prayerCalculationMethod === "" ||
                        userLocations?.length === 0
                      ) {
                        return;
                      }

                      const notificationPermission =
                        await handleNotificationPermissions();

                      if (notificationPermission === "granted") {
                        setSelectedSalah(name);
                        setShowSalahNotificationsSheet(true);
                      }
                    }}
                    fill="clear"
                    size="small"
                  >
                    <IonIcon
                      className="text-[1.375rem] text-[var(--ion-text-color)]"
                      icon={
                        userPreferences[`${name}Notification`] === "off"
                          ? notificationsOffOutline
                          : userPreferences[`${name}Notification`] === "on"
                            ? notificationsOutline
                            : userPreferences[`${name}Notification`] === "adhan"
                              ? megaphoneOutline
                              : ""
                      }
                    />
                  </IonButton>
                </div>
              </div>
            ))}
            {/* </IonList> */}
          </section>
          {userPreferences.prayerCalculationMethod !== "" &&
            userLocations?.length > 0 && (
              <p className="mt-5 text-[0.8125rem] leading-snug text-[var(--secondary-text-color)]">
                Calculated with{" "}
                {
                  prayerCalculationMethodLabels[
                    userPreferences.prayerCalculationMethod
                  ]
                }{" "}
                (Fajr {userPreferences.fajrAngle}°, Isha{" "}
                {userPreferences.ishaAngle}°). Your local mosque times may
                differ.
              </p>
            )}
        </section>
      </IonContent>
      <BottomSheetLocationsList
        setShowLocationsListSheet={setShowLocationsListSheet}
        showLocationsListSheet={showLocationsListSheet}
        dbConnection={dbConnection}
        setUserLocations={setUserLocations}
        userLocations={userLocations}
        setShowAddLocationSheet={setShowAddLocationSheet}
        setShowLocationDeletedToast={setShowLocationDeletedToast}
        setSalahtimes={setSalahtimes}
        setUserPreferences={setUserPreferences}
        userPreferences={userPreferences}
      />

      <BottomSheetPerSalahNotifications
        setShowSalahNotificationsSheet={setShowSalahNotificationsSheet}
        showSalahNotificationsSheet={showSalahNotificationsSheet}
        dbConnection={dbConnection}
        selectedSalah={selectedSalah}
        setUserPreferences={setUserPreferences}
        userPreferences={userPreferences}
        userLocations={userLocations}
      />
      <Toast
        isOpen={showLocationFailureToast}
        message="Unable to retrieve location, please try again"
        setShow={setShowLocationFailureToast}
        testId={"location-fail-toast"}
      />
      <Toast
        isOpen={showLocationAddedToast}
        message="Location added successfully"
        setShow={setShowLocationAddedToast}
        testId={"location-successfully-added-toast"}
      />
      <Toast
        isOpen={showLocationDeletedToast}
        message="Location deleted successfully"
        setShow={setShowLocationDeletedToast}
        testId={"location-successfully-deleted-toast"}
      />
    </IonPage>
  );
};

export default SalahTimesPage;
