import { useEffect, useState } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";

import { AndroidSettings } from "capacitor-native-settings";

import {
  dailyNotificationOption,
  LocationsDataObjTypeArr,
  userPreferencesType,
} from "../../types/types";

import type { InputCustomEvent, InputChangeEventDetail } from "@ionic/react";

import {
  checkNotificationPermissions,
  updateUserPrefs,
  promptToOpenDeviceSettings,
  scheduleFixedTimeDailyNotification,
  cancelNotifications,
  scheduleSalahNotifications,
  isBatteryOptimizationEnabled,
  // requestIgnoreBatteryOptimization,
  scheduleAfterIshaDailyNotifications,
} from "../../utils/helpers";
import {
  IonButton,
  IonIcon,
  IonInput,
  IonModal,
  IonRadio,
  IonRadioGroup,
  IonSelect,
  IonSelectOption,
  IonToggle,
  isPlatform,
} from "@ionic/react";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import {
  adhanLibrarySalahs,
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
} from "../../utils/constants";
import { Capacitor } from "@capacitor/core";
import { chevronExpand } from "ionicons/icons";

const BottomSheetNotifications = ({
  dbConnection,
  triggerId,
  isAppActive,
  setUserPreferences,
  userPreferences,
  userLocations,
}: {
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  triggerId: string;
  isAppActive: boolean;
  setUserPreferences: React.Dispatch<React.SetStateAction<userPreferencesType>>;
  userPreferences: userPreferencesType;
  userLocations: LocationsDataObjTypeArr;
}) => {
  const [dailyNotificationToggle, setDailyNotificationToggle] =
    useState<boolean>(userPreferences.dailyNotification === "1" ? true : false);

  const [notificationToggle, setNotificationToggle] = useState(false);

  const [isBatteryOptEnabled, setIsBatteryOptEnabled] =
    useState<boolean>(false);
  const [selectedDailyNotificationOption, setSelectedDailyNotificationOption] =
    useState(userPreferences.dailyNotificationOption);

  const getBatteryOptimizationStatus = async () => {
    if (Capacitor.getPlatform() !== "android") return;
    const res = await isBatteryOptimizationEnabled();
    setIsBatteryOptEnabled(res);
  };

  useEffect(() => {
    const battOptStatus = async () => {
      await getBatteryOptimizationStatus();
    };

    if (!isAppActive) return;

    battOptStatus();
  }, [isAppActive]);

  const isAfterIshaOptionEnabled =
    userPreferences.prayerCalculationMethod !== "" && userLocations.length > 0;

  const minuteIntervals = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];

  const getNotificationStatuses = () => {
    const notifications = [
      "fajrNotification",
      "sunriseNotification",
      "dhuhrNotification",
      "asrNotification",
      "maghribNotification",
      "ishaNotification",
    ];

    for (const [key, value] of Object.entries(userPreferences)) {
      if (notifications.includes(key)) {
        if (value === "on" || value === "adhan") {
          setNotificationToggle(true);
        }
      }
    }
  };

  const scheduleFixedOrAfterIshaDailyNotifications = async (
    setting: dailyNotificationOption,
  ) => {
    await cancelNotifications("Daily Reminder");

    if (setting === "fixedTime") {
      const [hour, minute] = userPreferences.dailyNotificationTime
        .split(":")
        .map(Number);
      await scheduleFixedTimeDailyNotification(hour, minute);
    } else if (setting === "afterIsha") {
      await scheduleAfterIshaDailyNotifications(
        Number(userPreferences.dailyNotificationAfterIshaDelay),
        userLocations,
        userPreferences,
      );
    }
  };

  async function handleNotificationPermissions() {
    const userNotificationPermission = await checkNotificationPermissions();

    if (userNotificationPermission === "denied") {
      await promptToOpenDeviceSettings(
        `open settings`,
        `You currently have notifications turned off for this application, you can open Settings to re-enable them`,
        AndroidSettings.AppNotification,
      );
    } else if (userNotificationPermission === "granted") {
      if (dailyNotificationToggle === true) {
        await cancelNotifications("Daily Reminder");
      } else if (dailyNotificationToggle === false) {
        await scheduleFixedOrAfterIshaDailyNotifications(
          userPreferences.dailyNotificationOption,
        );
      }
      setDailyNotificationToggle(!dailyNotificationToggle);
    } else if (
      userNotificationPermission === "prompt" ||
      userNotificationPermission === "prompt-with-rationale"
    ) {
      requestPermissionFunction();
    }
  }

  const requestPermissionFunction = async () => {
    // const requestPermission = await LocalNotifications.requestPermissions();
    const requestPermission = await LocalNotifications.requestPermissions();

    if (requestPermission.display === "granted") {
      setDailyNotificationToggle(true);
      const [hour, minute] = userPreferences.dailyNotificationTime
        .split(":")
        .map(Number);
      await scheduleFixedTimeDailyNotification(hour, minute);

      // await updateUserPrefs(
      //   dbConnection,
      //   "dailyNotification",
      //   "1",
      //   setUserPreferences,
      // );
    } else if (
      requestPermission.display === "prompt" ||
      requestPermission.display === "prompt-with-rationale" ||
      requestPermission.display === "denied"
    ) {
      await updateUserPrefs(
        dbConnection,
        "dailyNotification",
        "0",
        setUserPreferences,
      );
    }
  };

  const handleTimeChange = async (
    e: InputCustomEvent<InputChangeEventDetail>,
  ) => {
    if (!e.detail.value) return;

    const userSelectedTime = e.detail.value;

    setUserPreferences((userPreferences) => ({
      ...userPreferences,
      dailyNotificationTime: userSelectedTime,
    }));
    const [hour, minute] = userSelectedTime.split(":").map(Number);

    await scheduleFixedTimeDailyNotification(hour, minute);
    await updateUserPrefs(
      dbConnection,
      "dailyNotificationTime",
      userSelectedTime,
      setUserPreferences,
    );
  };

  // useEffect(() => {
  //   const notificationValue = dailyNotificationToggle === true ? "1" : "0";
  //   setUserPreferences((userPreferences) => ({
  //     ...userPreferences,
  //     dailyNotification: notificationValue,
  //   }));
  //   const modifyDBAndState = async () => {
  //     await updateUserPrefs(
  //       dbConnection,
  //       "dailyNotification",
  //       notificationValue,
  //       setUserPreferences,
  //     );
  //   };
  //   modifyDBAndState();
  // }, [dailyNotificationToggle]);

  return (
    <IonModal
      className="modal-fit-content"
      mode="ios"
      trigger={triggerId}
      initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      breakpoints={MODAL_BREAKPOINTS}
      onWillPresent={async () => {
        getNotificationStatuses();
        await getBatteryOptimizationStatus();
      }}
    >
      <section className="ion-content-scroll-host max-h-[var(--sheet-max-height)] overflow-y-auto px-5 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <h1 className="mb-4 font-bold leading-tight">Notifications</h1>
        <section className="flex items-center gap-3 px-4 py-3 sheet-group">
          <span className="flex-1 min-w-0">
            <span className="font-semibold leading-snug">Daily reminder</span>
            <span className="mt-0.5 block text-sm leading-snug text-[var(--secondary-text-color)]">
              A gentle reminder to log your Salah
            </span>
          </span>
          <IonToggle
            mode={isPlatform("android") ? "md" : "ios"}
            style={{ "--track-background": "#555" }}
            checked={dailyNotificationToggle}
            onIonChange={async (e) => {
              const toggleStatus = e.detail.checked;

              const notificationValue = toggleStatus === true ? "1" : "0";

              await updateUserPrefs(
                dbConnection,
                "dailyNotification",
                notificationValue,
                setUserPreferences,
              );

              await handleNotificationPermissions();
              // console.log(
              //   "PENDING NOTIFICATIONS: ",
              //   (await LocalNotifications.getPending()).notifications,
              // );
            }}
          ></IonToggle>
        </section>

        {dailyNotificationToggle && (
          <div
          // className="flex flex-col py-3 border-b border-[var(--app-border-color)]"
          >
            <p className="mb-2 mt-5 text-sm font-semibold text-[var(--secondary-text-color)]">
              Reminder time
            </p>
            <section className="sheet-group">
              <IonRadioGroup
                value={selectedDailyNotificationOption}
                onIonChange={async (e) => {
                  const eventValue = e.detail.value;

                  setSelectedDailyNotificationOption(eventValue);
                  await updateUserPrefs(
                    dbConnection,
                    "dailyNotificationOption",
                    eventValue,
                    setUserPreferences,
                  );

                  await scheduleFixedOrAfterIshaDailyNotifications(eventValue);
                }}
              >
                <IonRadio
                  mode={isPlatform("ios") ? "ios" : "md"}
                  labelPlacement="start"
                  justify="space-between"
                  value="fixedTime"
                  color="primary"
                  className="w-full px-4 py-3 [--color:var(--secondary-text-color)]"
                >
                  Fixed time
                </IonRadio>

                {/* {userPreferences.prayerCalculationMethod !== "" &&
                  userLocations.length > 0 && ( */}
                <IonRadio
                  mode={isPlatform("ios") ? "ios" : "md"}
                  labelPlacement="start"
                  justify="space-between"
                  value="afterIsha"
                  color="primary"
                  disabled={
                    // userPreferences.prayerCalculationMethod === "" ||
                    // userLocations.length === 0
                    !isAfterIshaOptionEnabled
                  }
                  className="w-full border-t border-[color:var(--sheet-divider-color)] px-4 py-3 [--color:var(--secondary-text-color)]"
                >
                  After Isha
                </IonRadio>
                {/* )} */}
              </IonRadioGroup>
              {selectedDailyNotificationOption === "fixedTime" ? (
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="text-[var(--secondary-text-color)]">
                    Remind me at
                  </span>
                  <IonInput
                    onIonChange={async (e) => {
                      e.stopPropagation();
                      await handleTimeChange(e);
                    }}
                    style={
                      {
                        // "--background": "var(--card-bg-color)",
                      }
                    }
                    className="w-auto rounded-xl !bg-[var(--sheet-pill-bg)] [--padding-end:0.875rem] [--padding-start:0.875rem]"
                    type="time"
                    dir="auto"
                    id="appt"
                    name="appt"
                    min="09:00"
                    max="18:00"
                    value={userPreferences.dailyNotificationTime}
                    required
                  >
                    <IonIcon
                      slot="end"
                      aria-hidden="true"
                      icon={chevronExpand}
                      className="pointer-events-none text-[1.125rem] text-[#595959]"
                    />
                  </IonInput>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="text-[var(--secondary-text-color)] text-sm">
                    Remind me {userPreferences.dailyNotificationAfterIshaDelay}{" "}
                    minutes after Isha
                  </span>
                  <IonSelect
                    label=""
                    disabled={
                      !isAfterIshaOptionEnabled
                      // userPreferences.prayerCalculationMethod === "" ||
                      // userLocations.length === 0
                    }
                    placeholder={`${userPreferences.dailyNotificationAfterIshaDelay} min`}
                    className="w-auto [--background:var(--sheet-pill-bg)] [&::part(label)]:hidden [--border-radius:0.75rem] [--padding-end:0.875rem] [--padding-start:0.875rem] [--placeholder-color:var(--ion-text-color)] [--placeholder-opacity:1]"
                    onIonChange={async (e) => {
                      e.stopPropagation();
                      const delay = e.detail.value;
                      if (selectedDailyNotificationOption === "afterIsha") {
                        await scheduleAfterIshaDailyNotifications(
                          delay,
                          userLocations,
                          userPreferences,
                        );
                      }
                      await updateUserPrefs(
                        dbConnection,
                        "dailyNotificationAfterIshaDelay",
                        String(delay),
                        setUserPreferences,
                      );
                    }}
                  >
                    {minuteIntervals.map((min) => {
                      return (
                        <IonSelectOption
                          key={min}
                          value={min}
                        >{`${min} min`}</IonSelectOption>
                      );
                    })}
                  </IonSelect>
                </div>
              )}
            </section>
            {!isAfterIshaOptionEnabled && (
              <p className="mt-2 text-sm leading-snug text-[var(--secondary-text-color)]">
                Please set up salah times to use the 'After Isha' option
              </p>
            )}
          </div>
        )}
        {userPreferences.prayerCalculationMethod !== "" &&
          userLocations.length > 0 && (
            <section className="flex items-center gap-3 px-4 py-3 mt-5 sheet-group">
              <span className="flex-1 min-w-0">
                <span className="font-semibold leading-snug">
                  Salah time alerts
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-[var(--secondary-text-color)]">
                  Turns on alerts for all five Salah. Change each one on the
                  Salah Times page.
                </span>
              </span>
              <IonToggle
                mode={isPlatform("android") ? "md" : "ios"}
                style={{ "--track-background": "#555" }}
                checked={notificationToggle}
                onIonChange={async () => {
                  if (!notificationToggle) {
                    setNotificationToggle(true);

                    const salahs = adhanLibrarySalahs;

                    for (const salah of salahs) {
                      if (salah === "sunrise") continue;
                      await scheduleSalahNotifications(
                        userLocations,
                        salah,
                        userPreferences,
                        "on",
                      );
                    }

                    for (const salah of adhanLibrarySalahs) {
                      await updateUserPrefs(
                        dbConnection,
                        `${salah}Notification`,
                        "on",
                        setUserPreferences,
                      );
                    }
                  } else {
                    setNotificationToggle(false);

                    for (const salah of adhanLibrarySalahs) {
                      await cancelNotifications(salah);
                    }
                    for (const salah of adhanLibrarySalahs) {
                      await updateUserPrefs(
                        dbConnection,
                        `${salah}Notification`,
                        "off",
                        setUserPreferences,
                      );
                    }
                  }
                }}
              ></IonToggle>
            </section>
          )}
        {Capacitor.getPlatform() === "android" && (
          <section className="flex items-center gap-3 px-4 py-3 mt-5 sheet-group">
            <span className="flex-1 min-w-0">
              <span className="font-semibold leading-snug">
                Battery optimisation
              </span>
              <span className="mt-0.5 block text-sm leading-snug text-[var(--secondary-text-color)]">
                <span
                  className={`font-semibold ${isBatteryOptEnabled ? "text-red-500" : "text-green-500"}`}
                >
                  {isBatteryOptEnabled ? "On" : "Off"}
                </span>
                {isBatteryOptEnabled
                  ? ", may delay alerts"
                  : ", alerts arrive on time"}
              </span>
            </span>

            {isBatteryOptEnabled && (
              <IonButton
                fill="clear"
                className="m-0"
                onClick={async () => {
                  // const res = await requestIgnoreBatteryOptimization();
                  // console.log("res: ", res);
                  // await getBatteryOptimizationStatus();

                  await promptToOpenDeviceSettings(
                    "Disable Battery Optimization",
                    "To ensure notifications arrive on time, please turn off battery optimization for this app.",
                    AndroidSettings.BatteryOptimization,
                  );
                }}
              >
                Turn off
              </IonButton>
            )}
          </section>
        )}
      </section>
    </IonModal>
  );
};

export default BottomSheetNotifications;
