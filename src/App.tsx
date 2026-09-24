import { useState, useEffect, useRef } from "react";
import { IonReactRouter } from "@ionic/react-router";
import type { BackButtonEvent } from "@ionic/core";
import { App as capacitorApp } from "@capacitor/app";

import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  useIonRouter,
} from "@ionic/react";

import {
  homeOutline,
  settingsOutline,
  statsChartOutline,
  timeOutline,
} from "ionicons/icons";

import { Redirect } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingsPage";
import StatsPage from "./pages/StatsPage";

import { LATEST_APP_VERSION } from "./utils/changelog";
import {
  checkNotificationPermissions,
  updateUserPrefs,
  setStatusAndNavBarBGColor,
  getSalahTimes,
  scheduleSalahNotifications,
  getNextSalah,
  scheduleAfterIshaDailyNotifications,
} from "./utils/helpers";
import {
  PreferenceObjType,
  userPreferencesType,
  SalahNamesType,
  SalahRecordType,
  SalahRecordsArrayType,
  SalahStatusType,
  SalahByDateObjType,
  streakDatesObjType,
  themeType,
  LocationsDataObjTypeArr,
  nextSalahTimeType,
  salahTimesObjType,
  OnboardingMode,
  DBResultSalahStatusDataType,
} from "./types/types";

import { Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { Capacitor, PluginListenerHandle } from "@capacitor/core";
import {
  format,
  parse,
  differenceInDays,
  subDays,
  parseISO,
  isAfter,
  startOfDay,
  isValid,
} from "date-fns";
import { PreferenceType } from "./types/types";

import useSQLiteDB from "./utils/useSqLiteDB";
// import { LocalNotifications } from "@capacitor/local-notifications";
import Onboarding from "./components/Onboarding";
import { Route } from "react-router-dom";
import MajorUpdateOverlay from "./components/MajorUpdateOverlay";
import SalahTimesPage from "./pages/SalahTimesPage";
import { toggleDBConnection as toggleDBConnection } from "./utils/dbUtils";
import { LocalNotifications } from "@capacitor/local-notifications";
import {
  adhanLibrarySalahs,
  dictPreferencesDefaultValues,
} from "./utils/constants";
import BottomSheetChangelog from "./components/BottomSheets/BottomSheetChangeLog";

const AndroidBackButtonHandler = () => {
  const { canGoBack } = useIonRouter();

  useEffect(() => {
    if (Capacitor.getPlatform() !== "android") return;

    const handleBackButton: EventListener = (event) => {
      (event as BackButtonEvent).detail.register(-1, () => {
        if (!canGoBack()) {
          void capacitorApp.exitApp();
        }
      });
    };

    document.addEventListener("ionBackButton", handleBackButton);

    return () => {
      document.removeEventListener("ionBackButton", handleBackButton);
    };
  }, [canGoBack]);

  return null;
};

const App = () => {
  const justLaunched = useRef(true);

  const {
    isDatabaseInitialised,
    sqliteConnection,
    dbConnection,
    initialiseTables,
  } = useSQLiteDB();

  const [onboardingMode, setOnboardingMode] = useState<OnboardingMode>(null);
  const [showMajorUpdateOverlay, setShowMajorUpdateOverlay] = useState(false);
  const [showMissedSalahsSheet, setShowMissedSalahsSheet] = useState(false);
  const [showSalahTimesSettingsSheet, setShowSalahTimesSettingsSheet] =
    useState(false);
  const [missedSalahList, setMissedSalahList] = useState<SalahByDateObjType>(
    {},
  );
  const [userLocations, setUserLocations] = useState<LocationsDataObjTypeArr>(
    [],
  );
  const [isMultiEditMode, setIsMultiEditMode] = useState<boolean>(false);
  const [showJoyRideEditIcon, setShowJoyRideEditIcon] =
    useState<boolean>(false);
  const [streakDatesObjectsArr, setStreakDatesObjectsArr] = useState<
    streakDatesObjType[]
  >([]);
  const [activeStreakCount, setActiveStreakCount] = useState(0);
  const [fetchedSalahData, setFetchedSalahData] =
    useState<SalahRecordsArrayType>([]);

  const [userPreferences, setUserPreferences] = useState<userPreferencesType>(
    dictPreferencesDefaultValues,
  );
  const [showLocationFailureToast, setShowLocationFailureToast] =
    useState<boolean>(false);
  const [showLocationAddedToast, setShowLocationAddedToast] =
    useState<boolean>(false);
  const [showLocationDeletedToast, setShowLocationDeletedToast] =
    useState<boolean>(false);
  const [showChangelogSheet, setShowChangelogSheet] = useState(false);

  const [salahTimes, setSalahtimes] = useState({
    fajr: "",
    sunrise: "",
    dhuhr: "",
    asr: "",
    maghrib: "",
    isha: "",
  });

  const [nextSalahNameAndTime, setNextSalahNameAndTime] =
    useState<nextSalahTimeType>({
      currentSalah: "",
      nextSalah: "",
      nextSalahTime: null as Date | null,
      hoursRemaining: 0,
      minsRemaining: 0,
    });

  const [isAppActive, setIsAppActive] = useState(true);

  useEffect(() => {
    // if (!isDatabaseInitialised) return;
    let appState: PluginListenerHandle;

    (async () => {
      appState = await capacitorApp.addListener(
        "appStateChange",
        ({ isActive }) => {
          if (isActive) {
            (async () => {
              try {
                const todaysDate = startOfDay(new Date());
                const lastLaunchDate = startOfDay(
                  new Date(userPreferences.lastLaunchDate),
                );

                if (isAfter(todaysDate, lastLaunchDate)) {
                  await scheduleAllSalahNotifications();
                  await fetchDataFromDB();
                  // await generateSalahTimes(
                  //   userLocations,
                  //   userPreferences,
                  //   setSalahtimes,
                  // );
                }

                // await getNextSalahDetails();

                await updateUserPrefs(
                  dbConnection,
                  "lastLaunchDate",
                  new Date().toISOString(),
                  setUserPreferences,
                );
              } catch (error) {
                console.error(
                  "Unable to generate salah times / schedule notifications",
                  error,
                );
              }
            })();
          }
          setIsAppActive(isActive);
        },
      );
    })();

    return () => {
      appState?.remove();
    };
  }, []);
  // }, [userLocations, userPreferences]);

  const getNextSalahDetails = async () => {
    if (!userLocations) {
      console.error("userLocations is undefined");
      return;
    }

    const result = await getNextSalah(userLocations, userPreferences);
    if (!result) return;

    // console.log("RESULT IN GET NEXT SALAH DETAILS: ", result);

    const {
      currentSalah,
      nextSalah,
      nextSalahTime,
      hoursRemaining,
      minsRemaining,
    } = result;
    setNextSalahNameAndTime({
      currentSalah: currentSalah,
      nextSalah: nextSalah,
      nextSalahTime: nextSalahTime,
      hoursRemaining: hoursRemaining,
      minsRemaining: minsRemaining,
    });
    // setNextSalahNameAndTime({
    //   currentSalah: "none",
    //   nextSalah: "fajr",
    //   nextSalahTime: nextSalahTime,
    //   hoursRemaining: hoursRemaining,
    //   minsRemaining: minsRemaining,
    // });

    // console.log("nextSalahNameAndTime:", nextSalahNameAndTime);
  };

  useEffect(() => {
    if (!isDatabaseInitialised) return;
    getNextSalahDetails();

    const interval = setInterval(() => {
      getNextSalahDetails();
    }, 30000);

    return () => clearInterval(interval);
  }, [userLocations, isDatabaseInitialised, userPreferences]);

  const [theme, setTheme] = useState<themeType>("dark");

  const handleTheme = (theme?: themeType) => {
    let themeColor = theme ? theme : userPreferences.theme;

    setTheme(themeColor);
    let statusBarThemeColor: string = "#242424";

    if (themeColor === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      themeColor = media.matches ? "dark" : "light";
    }

    if (themeColor === "dark") {
      statusBarThemeColor = "#161515";
      document.body.classList.add("dark");
    } else if (themeColor === "light") {
      statusBarThemeColor = "#EDEDED";
      document.body.classList.remove("dark");
    }

    if (Capacitor.isNativePlatform()) {
      const statusBarIconsColor =
        statusBarThemeColor === "#EDEDED" ? Style.Light : Style.Dark;
      if (Capacitor.getPlatform() === "android" && justLaunched.current) {
        setTimeout(() => {
          setStatusAndNavBarBGColor(statusBarThemeColor, statusBarIconsColor);
          justLaunched.current = false;
        }, 750);
      } else {
        setStatusAndNavBarBGColor(statusBarThemeColor, statusBarIconsColor);
      }
    }

    return statusBarThemeColor;
  };

  useEffect(() => {
    if (
      localStorage.getItem("appVersion") &&
      localStorage.getItem("appVersion") !== LATEST_APP_VERSION
    ) {
      // setShowChangelogSheet(true);
      if (LATEST_APP_VERSION === "5.2") {
        setShowMajorUpdateOverlay(true);
      }
      localStorage.setItem("appVersion", LATEST_APP_VERSION);
    }
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      // await SplashScreen.hide({ fadeOutDuration: 250 });
      if (isDatabaseInitialised === true) {
        await fetchDataFromDB();

        if (Capacitor.isNativePlatform()) {
          setTimeout(async () => {
            await SplashScreen.hide({ fadeOutDuration: 250 });
          }, 500);
        }

        await updateUserPrefs(
          dbConnection,
          "lastLaunchDate",
          // new Date().toISOString(),
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          setUserPreferences,
        );
      }
    };

    initializeApp();
  }, [isDatabaseInitialised]);

  useEffect(() => {
    if (Capacitor.getPlatform() !== "android") return;

    const createAndroidNotificationChannels = async () => {
      await LocalNotifications.createChannel({
        id: "daily-reminder",
        name: "Daily Reminder",
        importance: 4,
        description: "Daily reminder to log prayers",
        sound: "default",
        visibility: 1,
        vibration: true,
      });

      await LocalNotifications.createChannel({
        id: "dhuhr-asr-maghrib-isha-reminders-with-adhan",
        name: "Salah reminders (Adhan)",
        importance: 4,
        description: "Adhan for Dhuhr, Asr, Maghrib and Isha",
        sound: "adhan.mp3",
        visibility: 1,
        vibration: true,
      });

      await LocalNotifications.createChannel({
        id: "fajr-reminder-with-adhan",
        name: "Fajr Adhan",
        importance: 4,
        description: "Fajr adhan reminder",
        sound: "adhan_fajr.mp3",
        visibility: 1,
        vibration: true,
      });

      await LocalNotifications.createChannel({
        id: "salah-reminders-without-adhan",
        name: "Salah reminders without adhan",
        importance: 4,
        description: "Salah reminders",
        sound: "default",
        visibility: 1,
        vibration: true,
      });
    };

    createAndroidNotificationChannels();
  }, []);

  useEffect(() => {
    handleTheme(userPreferences.theme);
  }, [userPreferences.theme]);

  const scheduleAllSalahNotifications = async () => {
    const salahs = adhanLibrarySalahs;

    for (let i = 0; i < salahs.length; i++) {
      const salahAdjustmentKey = `${salahs[i]}Notification`;

      const salahNotificationSetting =
        userPreferences[salahAdjustmentKey as keyof userPreferencesType];

      if (
        salahNotificationSetting === "on" ||
        salahNotificationSetting === "adhan"
      ) {
        await scheduleSalahNotifications(
          userLocations,
          salahs[i],
          userPreferences,
          salahNotificationSetting,
        );
      }
    }
  };

  const generateSalahTimes = async (
    userLocations: LocationsDataObjTypeArr,
    userPreferences: userPreferencesType,
    setSalahtimes: React.Dispatch<React.SetStateAction<salahTimesObjType>>,
  ) => {
    await getSalahTimes(
      userLocations,
      new Date(),
      userPreferences,
      setSalahtimes,
    );
  };

  useEffect(() => {
    if (
      !isDatabaseInitialised ||
      userLocations.length === 0 ||
      userPreferences.prayerCalculationMethod === ""
    ) {
      return;
    }

    // const todaysDate = new Date();

    (async () => {
      try {
        await generateSalahTimes(userLocations, userPreferences, setSalahtimes);
        await scheduleAllSalahNotifications();
      } catch (error) {
        console.error(
          "Unable to generate salah times / schedule notifications",
        );
      }
    })();

    const scheduleDailyNotifications = async () => {
      await scheduleAfterIshaDailyNotifications(
        Number(userPreferences.dailyNotificationAfterIshaDelay),
        userLocations,
        userPreferences,
      );
    };

    if (
      userPreferences.dailyNotification === "1" &&
      userPreferences.dailyNotificationOption === "afterIsha"
    ) {
      scheduleDailyNotifications();
    }

    getNextSalahDetails();
  }, [
    userPreferences.prayerCalculationMethod,
    userPreferences.madhab,
    userPreferences.highLatitudeRule,
    userPreferences.fajrAngle,
    userPreferences.ishaAngle,
    userPreferences.fajrAdjustment,
    userPreferences.dhuhrAdjustment,
    userPreferences.asrAdjustment,
    userPreferences.maghribAdjustment,
    userPreferences.ishaAdjustment,
    userPreferences.shafaqRule,
    userPreferences.polarCircleResolution,
    userPreferences.timeFormat,
    // userPreferences.country,
    userLocations,
  ]);

  useEffect(() => {
    let copyOfMissedSalahList: SalahByDateObjType = {};
    fetchedSalahData.forEach((obj) => {
      for (let salahName in obj.salahs) {
        if (obj.salahs[salahName as SalahNamesType] === "missed") {
          const arr = copyOfMissedSalahList[obj.date] ?? [];
          arr.push(salahName as SalahNamesType);
          copyOfMissedSalahList[obj.date] = arr;
        }
      }
    });
    setMissedSalahList({ ...copyOfMissedSalahList });
  }, [fetchedSalahData]);

  const fetchDataFromDB = async (isDBImported?: boolean) => {
    try {
      if (!dbConnection || !dbConnection.current) {
        throw new Error("dbConnection / dbconnection.current does not exist");
      }

      if (isDBImported) {
        await initialiseTables();
        await updateUserPrefs(
          dbConnection,
          "isExistingUser",
          "1",
          setUserPreferences,
        );
      }

      await toggleDBConnection(dbConnection, "open");

      let DBResultPreferences = await dbConnection.current.query(
        `SELECT * FROM userPreferencesTable`,
      );

      // const DBResultSalahStatusData = await dbConnection.current.query(
      //   `SELECT * FROM salahDataTable`,
      // ); // ! <-- This statement here is the issue, getting all salah data is taking too long

      const DBResultSalahStatusData = await dbConnection.current.query(
        `SELECT date, salahName, salahStatus
          FROM salahDataTable`,
      );

      const DBResultLocations = await dbConnection.current.query(
        `SELECT * FROM userLocationsTable`,
      );

      // console.log("DBResultLocations: ", DBResultLocations);

      if (!DBResultPreferences || !DBResultPreferences.values) {
        throw new Error(
          "DBResultPreferences or DBResultPreferences.values do not exist",
        );
      }
      if (!DBResultSalahStatusData || !DBResultSalahStatusData.values) {
        throw new Error(
          "DBResultSalahStatusData or !DBResultSalahStatusData.values do not exist",
        );
      }
      if (!DBResultLocations || !DBResultLocations.values) {
        throw new Error(
          "DBResultLocations or !DBResultLocations.values do not exist",
        );
      }

      // console.log("DBResultSalahStatusData: ", DBResultSalahStatusData);
      // console.log("DBResultPreferences: ", DBResultPreferences);

      setUserLocations(DBResultLocations.values);

      const userNotificationPermission = await checkNotificationPermissions();

      const notificationValue = DBResultPreferences.values.find(
        (row) => row.preferenceName === "dailyNotification",
      );

      const isExistingUser =
        DBResultPreferences.values.find(
          (row) => row.preferenceName === "isExistingUser",
        ) || "";

      // console.log("isExistingUser is: ", isExistingUser);

      if (isExistingUser === "" || isExistingUser.preferenceValue === "0") {
        // console.log(
        //   "SETTING ONBOARDING MODE TO NEW USER, ONBOARDING MODE IS: ",
        //   onboardingMode,
        // );

        setOnboardingMode("newUser");
      }

      if (
        userNotificationPermission !== "granted" &&
        notificationValue === "1"
      ) {
        try {
          await updateUserPrefs(
            dbConnection,
            "dailyNotification",
            "0",
            setUserPreferences,
          );
          await toggleDBConnection(dbConnection, "open");

          // const locationPref = "location";
          // await dbConnection.current.run(
          //   `DELETE FROM userPreferencesTable WHERE preferenceName = ?`,
          //   [locationPref]
          // );

          DBResultPreferences = await dbConnection.current.query(
            `SELECT * FROM userPreferencesTable`,
          );
        } catch (error) {
          console.error(
            "Error modifying dailyNotification value in database:",
            error,
          );
        } finally {
          await toggleDBConnection(dbConnection, "close");
        }
      }
      try {
        if (!DBResultPreferences || !DBResultPreferences.values) {
          throw new Error(
            "DBResultPreferences or DBResultPreferences.values do not exist",
          );
        }
        await handleUserPreferencesDataFromDB(
          DBResultPreferences.values as PreferenceObjType[],
          DBResultSalahStatusData.values,
        );

        // await handleSalahTrackingDataFromDB(DBResultSalahStatusData.values);
      } catch (error) {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
      return;
    } finally {
      await toggleDBConnection(dbConnection, "close");
    }
  };

  const handleUserPreferencesDataFromDB = async (
    DBResultPreferences: PreferenceObjType[],
    DBResultSalahStatusData: DBResultSalahStatusDataType[],
  ) => {
    let DBResultPreferencesValues = DBResultPreferences;

    try {
      if (!dbConnection || !dbConnection.current) {
        throw new Error("dbConnection / dbconnection.current does not exist");
      }

      if (DBResultPreferencesValues.length === 0) {
        const params = Object.keys(dictPreferencesDefaultValues)
          .map((key) => {
            const value =
              dictPreferencesDefaultValues[key as keyof userPreferencesType];
            return [key, Array.isArray(value) ? value.join(",") : value];
          })
          .flat();

        const placeholders = Array(params.length / 2)
          .fill("(?, ?)")
          .join(", ");

        const insertQuery = `
        INSERT INTO userPreferencesTable (preferenceName, preferenceValue) 
        VALUES ${placeholders};
        `;

        await dbConnection.current.run(insertQuery, params);
        const DBResultPreferencesQuery = await dbConnection.current.query(
          `SELECT * FROM userPreferencesTable`,
        );

        if (!DBResultPreferencesQuery || !DBResultPreferencesQuery.values) {
          throw new Error(
            "No values returned from the DBResultPreferencesQuery.",
          );
        }
        DBResultPreferencesValues =
          DBResultPreferencesQuery.values as PreferenceObjType[];
      } else if (DBResultPreferencesValues.length > 0) {
        const DBResultPreferencesQuery = await dbConnection.current.query(
          `SELECT * FROM userPreferencesTable`,
        );

        if (!DBResultPreferencesQuery || !DBResultPreferencesQuery.values) {
          throw new Error(
            "No values returned from the DBResultPreferencesQuery.",
          );
        }

        DBResultPreferencesValues =
          DBResultPreferencesQuery.values as PreferenceObjType[];
      }
    } catch (error) {
      console.error(error);
    }

    const assignPreference = async (
      preference: PreferenceType,
    ): Promise<void> => {
      const preferenceQuery = DBResultPreferencesValues.find(
        (row) => row.preferenceName === preference,
      );

      if (preferenceQuery) {
        const prefName = preferenceQuery.preferenceName;
        const prefValue = preferenceQuery.preferenceValue;

        setUserPreferences((userPreferences: userPreferencesType) => ({
          ...userPreferences,
          [prefName]: prefName === "reasons" ? prefValue.split(",") : prefValue,
        }));
      } else {
        // console.log("preference: ", preference);

        await updateUserPrefs(
          dbConnection,
          preference,
          dictPreferencesDefaultValues[preference],
          setUserPreferences,
        );
      }
    };

    const batchAssignPreferences = async () => {
      for (const key of Object.keys(dictPreferencesDefaultValues)) {
        await assignPreference(key as keyof userPreferencesType);
      }
    };

    await batchAssignPreferences();

    const startDatePref = DBResultPreferencesValues.find(
      (row) => row.preferenceName === "userStartDate",
    )?.preferenceValue;

    // console.log("START DATE: ", startDatePref);

    if (!startDatePref) {
      throw new Error("userStartDate not found in preferences");
    }

    await handleSalahTrackingDataFromDB(DBResultSalahStatusData, startDatePref);
  };
  const handleSalahTrackingDataFromDB = async (
    DBResultSalahStatusData: DBResultSalahStatusDataType[],
    userStartDate: string,
  ) => {
    const singleSalahObjArr: SalahRecordsArrayType = [];
    // const missedSalahObj: SalahByDateObjType = {};
    const todaysDate = new Date();

    const userStartDateFormattedToDateObject: Date = parse(
      userStartDate,
      "yyyy-MM-dd",
      new Date(),
    );

    if (!isValid(userStartDateFormattedToDateObject)) {
      console.error("Invalid start date, ", userStartDate);
      return;
    }

    const dict: Record<string, DBResultSalahStatusDataType[]> = {};

    for (let i = 0; i < DBResultSalahStatusData.length; i++) {
      const currentEntry = DBResultSalahStatusData[i];

      if (!dict[currentEntry.date]) {
        dict[currentEntry.date] = [];
      }

      dict[currentEntry.date].push(currentEntry);
    }

    // console.log("DICT: ", dict);

    const totalDays: number =
      differenceInDays(todaysDate, userStartDateFormattedToDateObject) + 1;

    let currentDate = todaysDate;

    for (let j = 0; j < totalDays; j++) {
      const currentDateFormatted = format(currentDate, "yyyy-MM-dd");

      let singleSalahObj: SalahRecordType = {
        date: currentDateFormatted,
        salahs: {
          Fajr: "",
          Dhuhr: "",
          Asar: "",
          Maghrib: "",
          Isha: "",
        },
      };

      const dataForCurrentDate = dict[currentDateFormatted] || [];

      for (let i = 0; i < dataForCurrentDate.length; i++) {
        let salahName: SalahNamesType = dataForCurrentDate[i].salahName;
        let salahStatus: SalahStatusType = dataForCurrentDate[i].salahStatus;
        singleSalahObj.salahs[salahName] = salahStatus;

        // if (salahStatus === "missed") {
        //   if (dataForCurrentDate[i].date in missedSalahObj) {
        //     missedSalahObj[dataForCurrentDate[i].date].push(salahName);
        //   } else {
        //     missedSalahObj[dataForCurrentDate[i].date] = [salahName];
        //   }
        // }
      }

      singleSalahObjArr.push(singleSalahObj);
      currentDate = subDays(currentDate, 1);
    }

    setFetchedSalahData([...singleSalahObjArr]);

    // setMissedSalahList({ ...missedSalahObj });
    generateStreaks([...singleSalahObjArr]);

    // setFetchedSalahData(singleSalahObjArr);
    // setMissedSalahList(missedSalahObj);
    // generateStreaks(singleSalahObjArr);
  };

  // const [activeLocation, setActiveLocation] = useState();

  const generateStreaks = (fetchedSalahData: SalahRecordsArrayType) => {
    const reversedFetchedSalahDataArr = fetchedSalahData.reverse();
    const streakDatesObjectsArray: streakDatesObjType[] = [];
    const streakDatesArr: Date[] = [];
    let excusedDays = 0;
    const todaysDate = new Date();
    let isActiveStreak = false;

    const isConsecutiveDay = (date2: Date, date1: Date) =>
      differenceInDays(date1, date2) === 1;

    const streakBreakingStatuses = ["missed", "late", ""];

    const isStreakBreakingStatus = (statusesArr: SalahStatusType[]) =>
      statusesArr.some((status) => streakBreakingStatuses.includes(status));

    for (
      let i = reversedFetchedSalahDataArr.length > 1 ? 1 : 0;
      i < reversedFetchedSalahDataArr.length;
      i++
    ) {
      const salahStatuses = Object.values(
        reversedFetchedSalahDataArr[i].salahs,
      );

      if (reversedFetchedSalahDataArr.length === 1) {
        const salahStatuses = Object.values(
          reversedFetchedSalahDataArr[0].salahs,
        );

        if (!isStreakBreakingStatus(salahStatuses)) {
          if (salahStatuses.includes("excused")) {
            excusedDays += 1;
          }
          streakDatesArr.push(todaysDate);

          isActiveStreak = true;
          handleEndOfStreak(
            streakDatesArr,
            isActiveStreak,
            excusedDays,
            streakDatesObjectsArray,
          );
          excusedDays = 0;
        }
        return;
      }

      const previousDate = parseISO(reversedFetchedSalahDataArr[i - 1].date);
      const currentDate = parseISO(reversedFetchedSalahDataArr[i].date);
      const firstDateSalahStatuses = Object.values(
        reversedFetchedSalahDataArr[0].salahs,
      );

      if (
        isConsecutiveDay(previousDate, todaysDate) &&
        !salahStatuses.includes("late") &&
        !salahStatuses.includes("missed")
      ) {
        isActiveStreak = true;
      }
      if (
        isConsecutiveDay(previousDate, currentDate) &&
        !isStreakBreakingStatus(salahStatuses)
      ) {
        if (salahStatuses.includes("excused")) {
          excusedDays += 1;
        }

        i === 1 && !isStreakBreakingStatus(firstDateSalahStatuses)
          ? streakDatesArr.push(previousDate, currentDate)
          : streakDatesArr.push(currentDate);

        if (isConsecutiveDay(previousDate, todaysDate)) {
          handleEndOfStreak(
            streakDatesArr,
            isActiveStreak,
            excusedDays,
            streakDatesObjectsArray,
          );
          excusedDays = 0;
        }
      } else {
        handleEndOfStreak(
          streakDatesArr,
          isActiveStreak,
          excusedDays,
          streakDatesObjectsArray,
        );
        excusedDays = 0;
      }
    }
  };

  const handleEndOfStreak = (
    streakDatesArr: Date[],
    isActiveStreak: boolean,
    excusedDays: number,
    streakDatesObjectsArray: streakDatesObjType[],
  ) => {
    // console.log("excusedDays: ", excusedDays);
    // console.log("streakDatesArr: ", streakDatesArr.length);

    // if (excusedDays === streakDatesArr.length) return;
    if (streakDatesArr.length > 0) {
      const streakDaysAmount =
        streakDatesArr.length === 1
          ? 1
          : differenceInDays(
              streakDatesArr[streakDatesArr.length - 1],
              subDays(streakDatesArr[0], 1),
            );
      if (isActiveStreak) {
        setActiveStreakCount(streakDaysAmount - excusedDays);
      } else if (!isActiveStreak) {
        setActiveStreakCount(0);
      }

      let streakDatesObj: streakDatesObjType = {
        startDate: streakDatesArr[0],
        endDate: streakDatesArr[streakDatesArr.length - 1],
        days: streakDaysAmount - excusedDays,
        isActive: isActiveStreak,
        excusedDays: excusedDays,
      };

      streakDatesObjectsArray.push(streakDatesObj);

      setStreakDatesObjectsArr(
        streakDatesObjectsArray
          .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
          .reverse(),
      );
      excusedDays = 0;
      streakDatesArr.length = 0;
    }
  };

  return (
    <IonApp>
      <IonReactRouter>
        <AndroidBackButtonHandler />
        <IonTabs className="app">
          <IonRouterOutlet
          //  animated={false}
          >
            <Route
              exact
              path="/HomePage"
              render={() => (
                <HomePage
                  dbConnection={dbConnection}
                  setFetchedSalahData={setFetchedSalahData}
                  setUserPreferences={setUserPreferences}
                  setShowJoyRideEditIcon={setShowJoyRideEditIcon}
                  showJoyRideEditIcon={showJoyRideEditIcon}
                  userPreferences={userPreferences}
                  fetchedSalahData={fetchedSalahData}
                  setMissedSalahList={setMissedSalahList}
                  setShowMissedSalahsSheet={setShowMissedSalahsSheet}
                  showMissedSalahsSheet={showMissedSalahsSheet}
                  missedSalahList={missedSalahList}
                  setIsMultiEditMode={setIsMultiEditMode}
                  isMultiEditMode={isMultiEditMode}
                  activeStreakCount={activeStreakCount}
                  generateStreaks={generateStreaks}
                />
              )}
            />
            <Route
              exact
              path="/SettingsPage"
              render={() => (
                <SettingsPage
                  sqliteConnection={sqliteConnection}
                  dbConnection={dbConnection}
                  setUserPreferences={setUserPreferences}
                  handleSalahTrackingDataFromDB={handleSalahTrackingDataFromDB}
                  isAppActive={isAppActive}
                  theme={theme}
                  handleTheme={handleTheme}
                  fetchDataFromDB={fetchDataFromDB}
                  userPreferences={userPreferences}
                  setShowSalahTimesSettingsSheet={
                    setShowSalahTimesSettingsSheet
                  }
                  showSalahTimesSettingsSheet={showSalahTimesSettingsSheet}
                  userLocations={userLocations}
                  setShowChangelogSheet={setShowChangelogSheet}
                />
              )}
            />
            <Route
              exact
              path="/StatsPage"
              render={() => (
                <StatsPage
                  dbConnection={dbConnection}
                  userPreferences={userPreferences}
                  fetchedSalahData={fetchedSalahData}
                  activeStreakCount={activeStreakCount}
                  streakDatesObjectsArr={streakDatesObjectsArr}
                />
              )}
            />
            <Route
              exact
              path="/SalahTimesPage"
              render={() => (
                <SalahTimesPage
                  dbConnection={dbConnection}
                  setShowJoyRideEditIcon={setShowJoyRideEditIcon}
                  setUserPreferences={setUserPreferences}
                  userPreferences={userPreferences}
                  setUserLocations={setUserLocations}
                  userLocations={userLocations}
                  setSalahtimes={setSalahtimes}
                  salahTimes={salahTimes}
                  nextSalahNameAndTime={nextSalahNameAndTime}
                  setShowLocationFailureToast={setShowLocationFailureToast}
                  showLocationFailureToast={showLocationFailureToast}
                  setShowLocationAddedToast={setShowLocationAddedToast}
                  showLocationAddedToast={showLocationAddedToast}
                  setShowLocationDeletedToast={setShowLocationDeletedToast}
                  showLocationDeletedToast={showLocationDeletedToast}
                  setOnboardingMode={setOnboardingMode}
                  onboardingMode={onboardingMode}
                />
              )}
            />
          </IonRouterOutlet>

          <IonTabBar id="nav-bar" slot="bottom">
            <IonTabButton tab="HomePage" href="/HomePage">
              <IonIcon icon={homeOutline} />
              <IonLabel>Home</IonLabel>
            </IonTabButton>
            <IonTabButton tab="StatsPage" href="/StatsPage">
              <IonIcon icon={statsChartOutline} />
              <IonLabel>Stats</IonLabel>
            </IonTabButton>
            <IonTabButton tab="SalahTimesPage" href="/SalahTimesPage">
              <IonIcon icon={timeOutline} />
              <IonLabel>Salah Times</IonLabel>
            </IonTabButton>
            <IonTabButton tab="SettingsPage" href="/SettingsPage">
              <IonIcon icon={settingsOutline} />
              <IonLabel>Settings</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
        <Route exact path="/" render={() => <Redirect to="/HomePage" />} />
      </IonReactRouter>
      {/* {onboardingMode && ( */}
      <Onboarding
        setOnboardingMode={setOnboardingMode}
        onboardingMode={onboardingMode}
        setShowJoyRideEditIcon={setShowJoyRideEditIcon}
        dbConnection={dbConnection}
        setUserPreferences={setUserPreferences}
        userPreferences={userPreferences}
        setUserLocations={setUserLocations}
        userLocations={userLocations}
        setShowLocationFailureToast={setShowLocationFailureToast}
        setShowLocationAddedToast={setShowLocationAddedToast}
      />
      {/* // )} */}
      {showMajorUpdateOverlay && (
        <MajorUpdateOverlay
          setShowMajorUpdateOverlay={setShowMajorUpdateOverlay}
        />
      )}
      <BottomSheetChangelog
        setShowChangelogSheet={setShowChangelogSheet}
        showChangelogSheet={showChangelogSheet}
      />
    </IonApp>
  );
};

export default App;
