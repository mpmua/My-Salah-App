import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import {
  calculationMethod,
  LocationsDataObjTypeArr,
  PreferenceType,
  SalahByDateObjType,
  SalahNamesTypeAdhanLibrary,
  SalahNotificationSettings,
  salahTimesObjType,
  userPreferencesType,
} from "../types/types";
import { toggleDBConnection } from "./dbUtils";
import {
  CalculationMethod,
  CalculationParameters,
  Coordinates,
  HighLatitudeRule,
  PrayerTimes,
} from "adhan";
import { LocalNotifications } from "@capacitor/local-notifications";
import { addDays, addMinutes, format, isValid, parse } from "date-fns";
import { Toast } from "@capacitor/toast";
import { Dialog } from "@capacitor/dialog";
import { Capacitor } from "@capacitor/core";
import { EdgeToEdge } from "@capawesome/capacitor-android-edge-to-edge-support";
import { StatusBar, Style } from "@capacitor/status-bar";
import {
  AndroidSettings,
  IOSSettings,
  NativeSettings,
} from "capacitor-native-settings";

import { BatteryOptimization } from "@capawesome-team/capacitor-android-battery-optimization";

export const showToast = async (text: string, duration: "short" | "long") => {
  await Toast.show({
    text: text,
    position: "center",
    duration: duration,
  });
};

export const salahTableIndividualSquareStyles = `pointer-events-none relative z-[1] w-[1.5rem] h-[1.5rem] rounded-md`;

export const getMissedSalahCount = (missedSalahList: SalahByDateObjType) => {
  return Object.values(missedSalahList).flat().length;
};

export const isValidDate = (date: string): boolean => {
  const parsedDate = parse(date, "yyyy-MM-dd", new Date());
  // console.log("Date is: ", parsedDate, "and its: ", isValid(parsedDate));
  return isValid(parsedDate);
};

export const showAlert = async (title: string, msg: string) => {
  await Dialog.alert({
    title: title,
    message: msg,
  });
};

export const showConfirmMsg = async (
  title: string,
  msg: string,
): Promise<boolean> => {
  const { value } = await Dialog.confirm({
    title: title,
    message: msg,
  });

  return value;
};

export const setStatusAndNavBarBGColor = async (
  backgroundColor: string,
  textColor: Style,
) => {
  if (Capacitor.getPlatform() === "android") {
    await EdgeToEdge.setBackgroundColor({ color: backgroundColor });
  }
  await StatusBar.setStyle({ style: textColor });
};

export const promptToOpenDeviceSettings = async (
  title: string,
  message: string,
  androidOption: AndroidSettings,
) => {
  const { value } = await Dialog.confirm({
    title: title,
    message: message,
    okButtonTitle: "Open settings",
    cancelButtonTitle: "Cancel",
  });

  if (value) {
    if (Capacitor.getPlatform() === "ios") {
      NativeSettings.openIOS({
        option: IOSSettings.App,
      });
    } else if (Capacitor.getPlatform() === "android") {
      NativeSettings.openAndroid({
        option: androidOption,
      });
    }
  }
};

export const updateUserPrefs = async (
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>,
  preferenceName: PreferenceType,
  preferenceValue: string | string[],
  setUserPreferences: React.Dispatch<React.SetStateAction<userPreferencesType>>,
) => {
  try {
    if (!dbConnection || !dbConnection.current) {
      throw new Error("dbConnection / dbconnection.current does not exist");
    }

    await toggleDBConnection(dbConnection, "open");

    if (preferenceName === "reasons") {
      const query = `UPDATE userPreferencesTable SET preferenceValue = ? WHERE preferenceName = ?`;
      await dbConnection.current.run(query, [
        preferenceValue.toString(),
        preferenceName,
      ]);
    } else {
      const query = `INSERT OR REPLACE INTO userPreferencesTable (preferenceName, preferenceValue) VALUES (?, ?)`;
      await dbConnection.current.run(query, [preferenceName, preferenceValue]);
    }

    setUserPreferences((userPreferences: userPreferencesType) => ({
      ...userPreferences,
      [preferenceName]: preferenceValue,
    }));
  } catch (error) {
    console.error(`ERROR ENTERING ${preferenceName} into DB`);
    console.error(error);
  } finally {
    if (!dbConnection || !dbConnection.current) {
      throw new Error("dbConnection / dbconnection.current does not exist");
    }
    // let DBResultPreferences = await dbConnection.current.query(
    //   `SELECT * FROM userPreferencesTable`,
    // );
    // console.log("DBResultPreferences: ", DBResultPreferences.values);
    await toggleDBConnection(dbConnection, "close");
  }
};

export const getActiveLocation = (userLocations: LocationsDataObjTypeArr) => {
  const activeLocation = userLocations.find((loc) => loc.isSelected === 1);
  // if (!activeLocation) {
  //   console.error("No active location exists");
  // }

  return activeLocation;
};

export const cancelNotifications = async (
  notificationName: SalahNamesTypeAdhanLibrary | "Daily Reminder",
) => {
  // console.log(
  //   "CANCELLING NOTIFICATIONS FOR THE FOLLOWING REMINDERS: ",
  //   notificationName,
  // );

  const pendingNotifications = await LocalNotifications.getPending();

  // console.log(
  //   "pendingNotifications before cancellation: ",
  //   pendingNotifications.notifications,
  // );

  const notificationNameToCancel =
    notificationName !== "Daily Reminder"
      ? upperCaseFirstLetter(notificationName)
      : notificationName;

  const notificationsToCancel = pendingNotifications.notifications
    .filter((item) => item.title === notificationNameToCancel)
    .map((n) => ({
      id: n.id,
    }));

  // console.log("notificationsToCancel: ", notificationsToCancel);

  if (notificationsToCancel.length === 0) return;

  await LocalNotifications.cancel({ notifications: notificationsToCancel });

  // console.log(
  //   "pending notifications after cancelling: ",
  //   (await LocalNotifications.getPending()).notifications,
  // );
};

const salahIdMap = {
  fajr: 1,
  sunrise: 2,
  dhuhr: 3,
  asr: 4,
  maghrib: 5,
  isha: 6,
};

const generateNotificationId = (
  salahName: SalahNamesTypeAdhanLibrary,
  date: Date,
) => {
  const dateFormatted = format(date, "ddMMyyyy");

  return Number(dateFormatted + salahIdMap[salahName]);
};

export const toLocalDateFromUTCClock = (utcDate: Date) => {
  return new Date(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate(),
    utcDate.getUTCHours(),
    utcDate.getUTCMinutes(),
    utcDate.getUTCSeconds(),
  );
};

export const upperCaseFirstLetter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const checkNotificationPermissions = async () => {
  const userNotificationPermission =
    await LocalNotifications.checkPermissions();
  return userNotificationPermission.display;
};

export const scheduleFixedTimeDailyNotification = async (
  hour: number,
  minute: number,
) => {
  await LocalNotifications.schedule({
    notifications: [
      {
        id: 1,
        title: "Daily Reminder",
        body: `Did you log your Salah today?`,
        schedule: {
          on: {
            hour: hour,
            minute: minute,
          },
          allowWhileIdle: true,
          repeats: true,
        },
        sound: "default",
        channelId: "daily-reminder",
      },
    ],
  });

  // const pending = (await LocalNotifications.getPending()).notifications;
  // console.log("FIXED DAILY NOTIFICATIONS AFTER BEING TURNED ON: ", pending);
};

export const createLocalisedDate = (date: string) => {
  const parsedDate = parse(date, "yyyy-MM-dd", new Date());
  const userLocale = navigator.language || "en-US";
  const formattedParsedDate = new Intl.DateTimeFormat(userLocale, {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  })
    .format(parsedDate)
    .replace(/\//g, ".");
  return [format(parsedDate, "EEEE"), formattedParsedDate];
};

export const scheduleSalahNotifications = async (
  userLocations: LocationsDataObjTypeArr,
  salahName: SalahNamesTypeAdhanLibrary,
  userPreferences: userPreferencesType,
  setting: SalahNotificationSettings,
) => {
  await cancelNotifications(salahName);

  // console.log("Scheduling notifications for: ", salahName);

  const now = new Date();

  const nextSevenDays = Array.from({ length: 8 }, (_, i) => {
    return addDays(now, i);
  });

  const sound =
    setting === "adhan"
      ? Capacitor.getPlatform() === "android" && salahName === "fajr"
        ? "adhan_fajr.mp3"
        : Capacitor.getPlatform() === "android" && salahName !== "fajr"
          ? "adhan.mp3"
          : "adhan.wav"
      : "default";

  if (setting === "on" || setting === "adhan") {
    const result = await generateActiveLocationParams(
      userLocations,
      userPreferences,
    );

    if (!result) return;
    const { params, coordinates } = result;

    const arr = [];

    for (let i = 0; i < nextSevenDays.length; i++) {
      const salahTime = new PrayerTimes(coordinates, nextSevenDays[i], params)[
        salahName
      ];

      if (now < salahTime) {
        arr.push(salahTime);
      }
    }

    for (let i = 0; i < arr.length; i++) {
      const uniqueId = generateNotificationId(salahName, arr[i]);

      const notificationMsg =
        salahName === "sunrise"
          ? "The sun is rising!"
          : `It's time for ${upperCaseFirstLetter(salahName)}`;

      const channelId =
        setting === "adhan" && salahName === "fajr"
          ? "fajr-reminder-with-adhan"
          : setting === "adhan" && salahName !== "fajr"
            ? "dhuhr-asr-maghrib-isha-reminders-with-adhan"
            : "salah-reminders-without-adhan";

      await LocalNotifications.schedule({
        notifications: [
          {
            id: uniqueId,
            title: `${upperCaseFirstLetter(salahName)}`,
            body: notificationMsg,
            schedule: {
              at: arr[i],
              allowWhileIdle: true,
              repeats: false,
            },
            sound: sound,
            channelId: channelId,
          },
        ],
      });
    }
  }

  // console.log(
  //   "PENDING NOTIFICATIONS AFTER scheduleSalahNotifications HAS RUN: ",
  //   (await LocalNotifications.getPending()).notifications,
  // );
};

export const generateActiveLocationParams = async (
  userLocations: LocationsDataObjTypeArr,
  userPreferences: userPreferencesType,
) => {
  // console.log(
  //   "generateActiveLocationParams function beginning, calculation method is: ",
  //   userPreferences.prayerCalculationMethod,
  // );

  const activeLocation = getActiveLocation(userLocations);

  if (userLocations.length === 0 || !activeLocation) {
    // console.error(
    //   "No active location exists, generateActiveLocationParams function discontinouing",
    // );
    return;
  }

  if (!activeLocation) {
    // throw new Error("No active location found");
    // console.error("Active location does not exist");
    return;
  }

  const coordinates = new Coordinates(
    activeLocation.latitude,
    activeLocation.longitude,
  );

  if (!userPreferences.prayerCalculationMethod) {
    // console.error(
    //   "Calculation method does not exist, discontinuing generateActiveLocationParams function",
    // );
    return;
  }

  const params = CalculationMethod[userPreferences.prayerCalculationMethod]();

  // console.log("params before amendments:", params);

  params.madhab = userPreferences.madhab;
  params.highLatitudeRule = userPreferences.highLatitudeRule;
  params.fajrAngle = Number(userPreferences.fajrAngle);
  params.ishaAngle = Number(userPreferences.ishaAngle);
  params.adjustments.fajr = Number(userPreferences.fajrAdjustment);
  params.adjustments.dhuhr = Number(userPreferences.dhuhrAdjustment);
  params.adjustments.asr = Number(userPreferences.asrAdjustment);
  params.adjustments.maghrib = Number(userPreferences.maghribAdjustment);
  params.adjustments.isha = Number(userPreferences.ishaAdjustment);
  params.shafaq = userPreferences.shafaqRule;
  params.polarCircleResolution = userPreferences.polarCircleResolution;

  // console.log("params after amendments:", params);

  // console.log(
  //   "generateActiveLocationParams has run, calculation method is: ",
  //   userPreferences.prayerCalculationMethod,
  // );

  return { params, coordinates };
};

export const setAdhanLibraryDefaults = async (
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>,
  calcMethod: calculationMethod,
  setUserPreferences: React.Dispatch<React.SetStateAction<userPreferencesType>>,
  userPreferences: userPreferencesType,
  userLocations: LocationsDataObjTypeArr,
) => {
  // if (!userPreferences.prayerCalculationMethod) return;

  if (!userLocations) {
    console.error(
      "Unable to set calculation method as no user locations exist",
    );
    return;
  }

  try {
    await toggleDBConnection(dbConnection, "open");

    const activeLocation = getActiveLocation(userLocations);

    const params = CalculationMethod[calcMethod]();

    if (!activeLocation) {
      console.error("Active location does not exist");
      return;
    }

    const coordinates = new Coordinates(
      activeLocation.latitude,
      activeLocation.longitude,
    );

    const defaultCalcMethodValues = {
      prayerCalculationMethod: calcMethod,
      // madhab: params.madhab,
      madhab: userPreferences.madhab,
      highLatitudeRule: HighLatitudeRule.recommended(coordinates),
      fajrAngle: String(params.fajrAngle),
      ishaAngle: String(params.ishaAngle),
      fajrAdjustment: "0",
      dhuhrAdjustment: "0",
      asrAdjustment: "0",
      maghribAdjustment: "0",
      ishaAdjustment: "0",
    };

    // console.log("SETTING DEFAULTS", defaultCalcMethodValues);

    const query = `INSERT OR REPLACE INTO userPreferencesTable (preferenceName, preferenceValue) VALUES (?, ?)`;

    if (!dbConnection || !dbConnection.current) {
      throw new Error("dbConnection / dbconnection.current does not exist");
    }

    for (const [key, value] of Object.entries(defaultCalcMethodValues)) {
      // console.log(key, value);
      await dbConnection.current.run(query, [key, value]);
    }

    setUserPreferences((userPreferences: userPreferencesType) => ({
      ...userPreferences,
      ...defaultCalcMethodValues,
    }));
  } catch (error) {
    console.error(error);
  } finally {
    await toggleDBConnection(dbConnection, "close");
  }
};

export const scheduleAfterIshaDailyNotifications = async (
  delay: number,
  userLocations: LocationsDataObjTypeArr,
  userPreferences: userPreferencesType,
) => {
  await cancelNotifications("Daily Reminder");

  const now = new Date();

  const nextSevenDays = Array.from({ length: 8 }, (_, i) => {
    return addDays(now, i);
  });

  const result = await generateActiveLocationParams(
    userLocations,
    userPreferences,
  );

  if (!result) return;
  const { params, coordinates } = result;

  const arr = [];

  for (let i = 0; i < nextSevenDays.length; i++) {
    const salahTime = new PrayerTimes(coordinates, nextSevenDays[i], params)[
      "isha"
    ];

    if (now < salahTime) {
      arr.push(addMinutes(salahTime, delay));
    }
  }
  // console.log("arr: ", arr);

  for (let i = 0; i < arr.length; i++) {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1000 + i,
          title: "Daily Reminder",
          body: `Did you log your Salah today?`,
          schedule: {
            at: arr[i],
            allowWhileIdle: true,
            repeats: false,
          },
          sound: "default",
          channelId: "daily-reminder",
        },
      ],
    });
  }

  // console.log(
  //   "PENDING NOTIFICATIONS AFTER THE AFTER ISHA FUNCTION HAS RUN: ",
  //   (await LocalNotifications.getPending()).notifications,
  // );
};

export const extractSalahTime = (
  salah: "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha",
  coordinates: Coordinates,
  date: Date,
  params: CalculationParameters,
  userPreferences: userPreferencesType,
) => {
  const salahTime = new PrayerTimes(coordinates, date, params)[salah];

  // if (salah === "maghrib") {
  //   console.log("Salah name: ", salah, "Salah Time: ", salahTime);
  // }

  const locale = navigator.language;

  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: userPreferences.timeFormat === "24hr" ? "h23" : "h12",
  }).format(salahTime);
};

export const getSalahTimes = async (
  userLocations: LocationsDataObjTypeArr,
  date: Date,
  userPreferences: userPreferencesType,
  setSalahtimes: React.Dispatch<React.SetStateAction<salahTimesObjType>>,
) => {
  // console.log("GETTING SALAH TIMES FOR: ", date);

  const result = await generateActiveLocationParams(
    userLocations,
    userPreferences,
  );

  // console.log("RESULT IN GETSALAHTIMES: ", result);

  if (!result) return;

  const { params, coordinates } = result;

  if (!params || !coordinates || !date) return;

  // console.log("PARAMS IN GET: ", params);

  setSalahtimes({
    fajr: extractSalahTime("fajr", coordinates, date, params, userPreferences),
    sunrise: extractSalahTime(
      "sunrise",
      coordinates,
      date,
      params,
      userPreferences,
    ),
    dhuhr: extractSalahTime(
      "dhuhr",
      coordinates,
      date,
      params,
      userPreferences,
    ),
    asr: extractSalahTime("asr", coordinates, date, params, userPreferences),
    maghrib: extractSalahTime(
      "maghrib",
      coordinates,
      date,
      params,
      userPreferences,
    ),
    isha: extractSalahTime("isha", coordinates, date, params, userPreferences),
  });
};

export const getNextSalah = async (
  userLocations: LocationsDataObjTypeArr,
  userPreferences: userPreferencesType,
) => {
  const result = await generateActiveLocationParams(
    userLocations,
    userPreferences,
  );

  if (!result) return;

  const { params, coordinates } = result;

  const todaysDate = new Date();

  // console.log("PARAMS: ", result.params);

  let allSalahTimes = new PrayerTimes(coordinates, todaysDate, params);

  // console.log("ALL SALAH TIMES: ", allSalahTimes);

  let next = allSalahTimes.nextPrayer();

  // console.log("NEXT SALAH TIME: ", allSalahTimes.timeForPrayer(next));

  let nextSalahTime: Date | null = null;
  let currentSalahStartTime: Date | null = null;
  let currentSalah:
    | "none"
    | "fajr"
    | "sunrise"
    | "dhuhr"
    | "asr"
    | "maghrib"
    | "isha" = "none";

  // const sunnahTimes = new SunnahTimes(allSalahTimes);
  // console.log("sunnahTimes: ", sunnahTimes);

  if (next === "none") {
    currentSalahStartTime = allSalahTimes.isha;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    allSalahTimes = new PrayerTimes(coordinates, tomorrow, params);

    currentSalah = "isha";
    next = allSalahTimes.nextPrayer();

    nextSalahTime = allSalahTimes.timeForPrayer(next);
  } else if (next === "sunrise") {
    next = "sunrise";
    nextSalahTime = allSalahTimes.timeForPrayer(next);
    currentSalah = "fajr";
    currentSalahStartTime = allSalahTimes.fajr;
  } else {
    nextSalahTime = allSalahTimes.timeForPrayer(next);
    currentSalah = allSalahTimes.currentPrayer();
    currentSalahStartTime =
      currentSalah === "none"
        ? new PrayerTimes(coordinates, addDays(todaysDate, -1), params).isha
        : allSalahTimes.timeForPrayer(currentSalah);
  }

  if (nextSalahTime === null) {
    console.error("nextSalahTime is null");
    return;
  }

  const now = new Date();
  const diffMs = nextSalahTime.getTime() - now.getTime();
  // const hours = Math.floor(diffMs / 1000 / 60 / 60);
  // const minutes = Math.ceil((diffMs / 1000 / 60) % 60);
  const totalMinutes = Math.ceil(diffMs / 60000);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // console.log("diffMs: ", diffMs);
  // console.log("hours: ", hours);
  // console.log("minutes: ", minutes);

  return {
    currentSalah: currentSalah,
    currentSalahStartTime: currentSalahStartTime,
    nextSalah: next,
    nextSalahTime: nextSalahTime,
    hoursRemaining: hours,
    minsRemaining: minutes,
  };
};

export const handleNotificationPermissions = async () => {
  const userNotificationPermission = await checkNotificationPermissions();

  if (userNotificationPermission === "denied") {
    await promptToOpenDeviceSettings(
      `Notifications are turned off`,
      `You currently have notifications turned off for this application, you can open Settings to re-enable them`,
      AndroidSettings.AppNotification,
    );
    return "denied";
  } else if (userNotificationPermission === "granted") {
    return "granted";
  } else if (
    userNotificationPermission === "prompt" ||
    userNotificationPermission === "prompt-with-rationale"
  ) {
    const requestPermission = await LocalNotifications.requestPermissions();

    if (requestPermission.display === "granted") {
      return "granted";
    } else if (requestPermission.display === "denied") {
      return "denied";
    }
  }
};

export const formatNumberWithSign = (number: number) => {
  if (number > 0) return `+${number}`;
  if (number < 0) return `${number}`;
  return 0;
};

export const isBatteryOptimizationEnabled = async () => {
  if (Capacitor.getPlatform() !== "android") {
    return false;
  }
  const { enabled } = await BatteryOptimization.isBatteryOptimizationEnabled();
  return enabled;
};

export const requestIgnoreBatteryOptimization = async () => {
  if (Capacitor.getPlatform() !== "android") {
    return;
  }
  await BatteryOptimization.requestIgnoreBatteryOptimization();
};
