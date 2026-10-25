import { useEffect, useRef, useState } from "react";
import { Swiper as SwiperInstance } from "swiper";
import { Navigation } from "swiper/modules";
import {
  LocationsDataObjTypeArr,
  OnboardingMode,
  userPreferencesType,
} from "../types/types";
import {
  updateUserPrefs,
  scheduleFixedTimeDailyNotification,
  handleNotificationPermissions,
  scheduleSalahNotifications,
  isBatteryOptimizationEnabled,
  requestIgnoreBatteryOptimization,
  scheduleAfterIshaDailyNotifications,
  promptToOpenDeviceSettings,
} from "../utils/helpers";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import appLogo from "/src/assets/images/icon-512.png";
import { IonButton, IonContent, IonIcon, IonModal } from "@ionic/react";
import {
  arrowForwardOutline,
  chevronBackOutline,
  closeOutline,
} from "ionicons/icons";
import CalculationMethodOptions from "./CalculationMethodOptions";
import AddLocationOptions from "./AddLocationOptions";
import { Capacitor } from "@capacitor/core";
import { adhanLibrarySalahs } from "../utils/constants";
import { AndroidSettings } from "capacitor-native-settings";
import { LATEST_APP_VERSION } from "../utils/changelog";
import { motion } from "framer-motion";
import {
  LuBan,
  LuCheck,
  LuChevronRight,
  LuCode,
  LuShieldCheck,
  LuUserX,
  LuWifiOff,
} from "react-icons/lu";

const welcomeFeatures = [
  { icon: LuShieldCheck, label: "Privacy friendly" },
  { icon: LuUserX, label: "No account needed" },
  { icon: LuBan, label: "No ads" },
  { icon: LuWifiOff, label: "Works offline" },
  { icon: LuCode, label: "Open source" },
];

const exampleSalahTimes = [
  { name: "Fajr", time: "05:32 am" },
  { name: "Sunrise", time: "07:00 am" },
  { name: "Dhuhr", time: "12:58 pm" },
  { name: "Asr", time: "04:18 pm" },
  { name: "Maghrib", time: "06:42 pm" },
  { name: "Isha", time: "08:06 pm" },
];

const exampleNotifications = [
  { title: "Asr", body: "It's time for Asr", time: "now" },
  {
    title: "Daily Reminder",
    body: "Did you log your Salah today?",
    time: "09:42 pm",
  },
];

const welcomeFadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

interface OnboardingProps {
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  setUserPreferences: React.Dispatch<React.SetStateAction<userPreferencesType>>;
  userPreferences: userPreferencesType;
  setOnboardingMode: React.Dispatch<React.SetStateAction<OnboardingMode>>;
  onboardingMode?: OnboardingMode;
  setShowJoyRideEditIcon: React.Dispatch<React.SetStateAction<boolean>>;
  setUserLocations: React.Dispatch<
    React.SetStateAction<LocationsDataObjTypeArr>
  >;
  userLocations: LocationsDataObjTypeArr;
  setShowLocationFailureToast: React.Dispatch<React.SetStateAction<boolean>>;
  setShowLocationAddedToast: React.Dispatch<React.SetStateAction<boolean>>;
}

const Onboarding = ({
  dbConnection,
  setUserPreferences,
  userPreferences,
  setOnboardingMode,
  onboardingMode,
  setShowJoyRideEditIcon,
  setUserLocations,
  userLocations,
  setShowLocationFailureToast,
  setShowLocationAddedToast,
}: OnboardingProps) => {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isLocationFormOpen, setIsLocationFormOpen] = useState(false);

  const switchToNextPage = () => {
    swiperRef.current?.slideNext();
  };
  const switchToPreviousPage = () => {
    const activeIndex = swiperRef.current?.activeIndex;

    if (activeIndex === 7) {
      swiperRef.current?.slideTo(3, 0);
    }

    swiperRef.current?.slidePrev();
  };

  const [segmentOption, setSegmentOption] = useState<"manual" | "country">(
    "country",
  );

  const [isBatteryOptEnabled, setIsBatteryOptEnabled] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    // console.log("BATT OPT USEEFFECT HAS RUN");

    if (Capacitor.getPlatform() !== "android") return;

    const getBatteryOptimizationStatus = async () => {
      const res = await isBatteryOptimizationEnabled();
      setIsBatteryOptEnabled(res);

      // console.log("BATTERY OPTIMISATION: ", res);
    };

    getBatteryOptimizationStatus();
  }, []);

  const dismissOnboardingSlides = async () => {
    if (onboardingMode === "newUser") {
      await updateUserPrefs(
        dbConnection,
        "isExistingUser",
        "1",
        setUserPreferences,
      );

      localStorage.setItem("appVersion", LATEST_APP_VERSION);

      setShowJoyRideEditIcon(true);
    }
    setOnboardingMode(null);
  };

  return (
    <IonModal
      isOpen={onboardingMode !== null ? true : false}
      onDidDismiss={() => {
        setOnboardingMode(null);
      }}
      mode="ios"
      backdropDismiss={false}
      // canDismiss={onboardingMode === null ? true : false}
      handle={false}
    >
      <IonContent>
        <section
          // style={{ marginTop: "calc(env(safe-area-inset-top, 0px))" }}
          // className="flex items-center mx-5 mt-2"
          className="flex min-h-screen mx-5"
        >
          {onboardingMode === "newUser" &&
            activeSlideIndex > 0 &&
            !isLocationFormOpen && (
              <>
                <div className="absolute inset-x-0 top-0 z-10 h-[calc(env(safe-area-inset-top,0px)+3rem)] bg-[var(--ion-background-color)]" />
                <IonButton
                  style={{
                    top: "calc(env(safe-area-inset-top, 0px) + 8px)",
                    display:
                      Capacitor.getPlatform() === "android" &&
                      activeSlideIndex === 7
                        ? "none"
                        : undefined,
                  }}
                  fill="clear"
                  color="light"
                  size="small"
                  className="absolute text-lg z-10 left-[-5px] top-0"
                  onClick={switchToPreviousPage}
                >
                  <IonIcon icon={chevronBackOutline} />
                </IonButton>
              </>
            )}

          {onboardingMode === "salahTimes" && (
            <>
              <IonButton
                style={{ marginTop: "calc(env(safe-area-inset-top, 0px))" }}
                fill="clear"
                size="small"
                className="absolute text-lg z-10 right-[-5px] top-0 text-[var(--ion-text-color)]"
                onClick={() => {
                  setOnboardingMode(null);
                }}
              >
                <IonIcon icon={closeOutline} />
              </IonButton>
            </>
          )}

          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              setActiveSlideIndex(swiper.activeIndex);
            }}
            onSlideChange={(swiper) => setActiveSlideIndex(swiper.activeIndex)}
            style={{ margin: 0 }}
            className="swiper"
            spaceBetween={50}
            slidesPerView={1}
            allowTouchMove={false}
            initialSlide={onboardingMode === "newUser" ? 0 : 3}
            navigation
            // navigation={{
            //   nextEl: ".swiper-button-next",
            //   prevEl: ".swiper-button-prev",
            // }}
            modules={[Navigation]}
          >
            <SwiperSlide>
              <motion.section
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: { delayChildren: 0.4, staggerChildren: 0.1 },
                  },
                }}
                className="flex flex-col justify-end h-full pb-36 [@media(max-height:640px)]:pb-28"
              >
                <motion.img
                  variants={welcomeFadeUp}
                  className="w-24 h-24 mb-8 [@media(max-height:640px)]:size-16 [@media(max-height:640px)]:mb-5"
                  src={appLogo}
                  alt=""
                />
                <motion.h1
                  variants={welcomeFadeUp}
                  className="m-0 text-[1.875rem] font-bold leading-tight text-balance"
                >
                  Welcome to My Salah App
                </motion.h1>
                <motion.p
                  variants={welcomeFadeUp}
                  className="mt-3 text-base text-balance text-[var(--secondary-text-color)]"
                >
                  A simple daily log to help you stay consistent.
                </motion.p>
                <ul className="mt-8 space-y-4 [@media(max-height:640px)]:mt-6 [@media(max-height:640px)]:space-y-3">
                  {welcomeFeatures.map((item) => (
                    <motion.li
                      key={item.label}
                      variants={welcomeFadeUp}
                      className="flex items-center gap-4"
                    >
                      <item.icon
                        aria-hidden="true"
                        className="text-2xl shrink-0 text-[var(--current-salah-color)]"
                      />
                      {item.label}
                    </motion.li>
                  ))}
                </ul>
                <IonButton
                  className="absolute w-full m-0 bottom-10 font-semibold"
                  onClick={() => {
                    switchToNextPage();
                    // setIsOnboarding(true);
                  }}
                >
                  <IonIcon slot="end" icon={arrowForwardOutline} />
                  Bismillah, let's begin
                </IonButton>
              </motion.section>
            </SwiperSlide>
            <SwiperSlide>
              <section className="flex flex-col justify-center h-full">
                <h1 className="m-0 mb-6 text-[1.875rem] font-bold leading-tight">
                  I am a...
                </h1>
                <section className="space-y-3">
                  <button
                    type="button"
                    className="flex items-center w-full h-[4.5rem] pr-[1.125rem] overflow-hidden text-lg font-medium text-left rounded-2xl bg-[var(--sheet-group-bg)] text-[var(--ion-text-color)]"
                    onClick={async () => {
                      switchToNextPage();
                      await updateUserPrefs(
                        dbConnection,
                        "userGender",
                        "male",
                        setUserPreferences,
                      );
                      await updateUserPrefs(
                        dbConnection,
                        "isExistingUser",
                        "1",
                        setUserPreferences,
                      );
                    }}
                  >
                    <span className="self-stretch w-[5px] mr-[1.125rem] bg-[var(--ion-color-primary)]" />
                    Brother
                    <LuChevronRight
                      aria-hidden="true"
                      className="ml-auto text-xl text-[var(--secondary-text-color)]"
                    />
                  </button>
                  <button
                    type="button"
                    className="flex items-center w-full h-[4.5rem] pr-[1.125rem] overflow-hidden text-lg font-medium text-left rounded-2xl bg-[var(--sheet-group-bg)] text-[var(--ion-text-color)]"
                    onClick={async () => {
                      switchToNextPage();
                      await updateUserPrefs(
                        dbConnection,
                        "userGender",
                        "female",
                        setUserPreferences,
                      );
                      await updateUserPrefs(
                        dbConnection,
                        "isExistingUser",
                        "1",
                        setUserPreferences,
                      );
                    }}
                  >
                    <span className="self-stretch w-[5px] mr-[1.125rem] bg-[var(--ion-color-tertiary)]" />
                    Sister
                    <LuChevronRight
                      aria-hidden="true"
                      className="ml-auto text-xl text-[var(--secondary-text-color)]"
                    />
                  </button>
                </section>
              </section>
            </SwiperSlide>
            <SwiperSlide>
              <section className="flex flex-col h-full pt-[calc(env(safe-area-inset-top,0px)+3.5rem)] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                <h1 className="m-0 text-[1.875rem] font-bold leading-tight">
                  Add Salah times?
                </h1>
                <p className="mt-3 text-base text-balance text-[var(--secondary-text-color)]">
                  Set your location to see daily Salah times. You can skip this
                  and set them up later.
                </p>
                <p className="mt-6 mb-2 text-xs font-semibold tracking-wide uppercase text-[var(--secondary-text-color)] [@media(max-height:640px)]:mt-4">
                  Example view · illustrative times
                </p>
                <section
                  aria-hidden="true"
                  className="px-4 py-3 rounded-2xl bg-[var(--sheet-group-bg)]"
                >
                  <p className="mb-1 text-lg font-bold [@media(max-height:640px)]:hidden">
                    Salah Times
                  </p>
                  {exampleSalahTimes.map((item) => (
                    <div
                      key={item.name}
                      className="flex justify-between py-2.5 text-[0.9375rem] border-t border-[color:var(--sheet-divider-color)] first-of-type:border-t-0 [@media(max-height:640px)]:py-1"
                    >
                      <span className="font-semibold">{item.name}</span>
                      {item.time}
                    </div>
                  ))}
                </section>
                <section className="flex flex-col pt-6 mt-auto">
                  <IonButton
                    onClick={async () => {
                      switchToNextPage();
                      // setIsSalahTimesOnboarding(true);
                    }}
                    className="m-0 font-semibold"
                  >
                    Set up Salah times
                  </IonButton>
                  <IonButton
                    fill="clear"
                    onClick={() => {
                      swiperRef.current?.slideTo(8, 0);
                      // setIsSalahTimesOnboarding(false);
                    }}
                    className="m-0 mt-2 font-semibold [--color:var(--current-salah-color)]"
                  >
                    Skip for now
                  </IonButton>
                </section>
              </section>
            </SwiperSlide>
            <SwiperSlide>
              <section className="flex flex-col h-full pt-[calc(env(safe-area-inset-top,0px)+3.5rem)]">
                {!isLocationFormOpen && (
                  <h1 className="m-0 mb-1.5 text-[1.875rem] font-bold leading-tight">
                    Choose a location
                  </h1>
                )}
                <AddLocationOptions
                  dbConnection={dbConnection}
                  setUserLocations={setUserLocations}
                  userLocations={userLocations}
                  setShowLocationFailureToast={setShowLocationFailureToast}
                  setShowLocationAddedToast={setShowLocationAddedToast}
                  onboardingMode={onboardingMode}
                  switchToNextPage={switchToNextPage}
                  setIsLocationFormOpen={setIsLocationFormOpen}
                />
                <IonButton
                  onClick={async () => {
                    switchToNextPage();
                  }}
                  className={`absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] w-full m-0 font-semibold ${userLocations.length === 0 ? "hidden" : "visible"}`}
                >
                  Next
                </IonButton>
              </section>
            </SwiperSlide>
            <SwiperSlide>
              <section className="h-full -mx-5 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] [&_ion-content]:[--background:transparent]">
                <CalculationMethodOptions
                  dbConnection={dbConnection}
                  setSegmentOption={setSegmentOption}
                  segmentOption={segmentOption}
                  userLocations={userLocations}
                  userPreferences={userPreferences}
                  setUserPreferences={setUserPreferences}
                >
                  <h1 className="m-0 mb-1.5 text-[1.875rem] font-bold leading-tight">
                    Calculation method
                  </h1>
                  <p className="mb-5 text-base text-[var(--secondary-text-color)]">
                    Choose how your daily Salah times are calculated.
                  </p>
                </CalculationMethodOptions>
                {/* <section className=""> */}
              </section>
              <div
                className={`absolute inset-x-0 bottom-0 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] bg-[var(--ion-background-color)] ${userPreferences.prayerCalculationMethod === "" ? "hidden" : "visible"}`}
              >
                <IonButton
                  disabled={
                    userPreferences.prayerCalculationMethod === ""
                      ? true
                      : false
                  }
                  onClick={async () => {
                    switchToNextPage();
                  }}
                  className="w-full m-0 font-semibold"
                >
                  Next
                </IonButton>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <section className="flex flex-col h-full pt-[calc(env(safe-area-inset-top,0px)+3.5rem)]">
                <h1 className="m-0 mb-1.5 text-[1.875rem] font-bold leading-tight">
                  Madhab
                </h1>
                <p className="text-base text-balance text-[var(--secondary-text-color)]">
                  Your madhab affects when Asr begins. Choose the method you
                  follow.
                </p>
                <section className="mt-6 space-y-3">
                  <button
                    type="button"
                    className="flex items-center w-full h-[4.5rem] pr-[1.125rem] overflow-hidden text-lg font-medium text-left rounded-2xl bg-[var(--sheet-group-bg)] text-[var(--ion-text-color)]"
                    onClick={async () => {
                      if (switchToNextPage && onboardingMode !== null) {
                        switchToNextPage();
                        await updateUserPrefs(
                          dbConnection,
                          "madhab",
                          "shafi",
                          setUserPreferences,
                        );
                      }
                    }}
                  >
                    <span className="self-stretch w-[5px] mr-[1.125rem] bg-[var(--ion-color-primary)]" />
                    <span>
                      <span className="block">Shafi'i, Maliki or Hanbali</span>
                      <span className="block mt-0.5 text-sm font-normal text-[var(--secondary-text-color)]">
                        Earlier Asr time
                      </span>
                    </span>
                    <LuChevronRight
                      aria-hidden="true"
                      className="ml-auto text-xl text-[var(--secondary-text-color)]"
                    />
                  </button>
                  <button
                    type="button"
                    className="flex items-center w-full h-[4.5rem] pr-[1.125rem] overflow-hidden text-lg font-medium text-left rounded-2xl bg-[var(--sheet-group-bg)] text-[var(--ion-text-color)]"
                    onClick={async () => {
                      if (switchToNextPage && onboardingMode !== null) {
                        switchToNextPage();
                        await updateUserPrefs(
                          dbConnection,
                          "madhab",
                          "hanafi",
                          setUserPreferences,
                        );
                      }
                    }}
                  >
                    <span className="self-stretch w-[5px] mr-[1.125rem] bg-teal-500" />
                    <span>
                      <span className="block">Hanafi</span>
                      <span className="block mt-0.5 text-sm font-normal text-[var(--secondary-text-color)]">
                        Later Asr time
                      </span>
                    </span>
                    <LuChevronRight
                      aria-hidden="true"
                      className="ml-auto text-xl text-[var(--secondary-text-color)]"
                    />
                  </button>
                </section>
                <p className="mt-4 text-sm text-[var(--secondary-text-color)]">
                  You can change this later in Settings.
                </p>
              </section>
            </SwiperSlide>
            <SwiperSlide>
              <section className="flex flex-col h-full pt-[calc(env(safe-area-inset-top,0px)+3.5rem)] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                <h1 className="m-0 mb-1.5 text-[1.875rem] font-bold leading-tight">
                  Salah reminders
                </h1>
                <p className="text-base text-pretty text-[var(--secondary-text-color)]">
                  Get an alert at each Salah time and a daily reminder after
                  Isha. You can change these any time.
                </p>
                <section
                  aria-hidden="true"
                  className="flex flex-col justify-center flex-1 gap-3 py-6"
                >
                  {exampleNotifications.map((item) => (
                    <div
                      key={item.title}
                      className="flex gap-3 p-3.5 rounded-[1.125rem] bg-[var(--sheet-group-bg)]"
                    >
                      <img
                        className="rounded-full size-9"
                        src={appLogo}
                        alt=""
                      />
                      <div className="flex-1 min-w-0">
                        <p className="flex justify-between mb-0.5 text-xs text-[var(--secondary-text-color)]">
                          My Salah App
                          <span>{item.time}</span>
                        </p>
                        <p className="text-[0.9375rem] font-semibold">
                          {item.title}
                        </p>
                        <p className="text-sm text-[var(--secondary-text-color)]">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </section>
                <section className="flex flex-col">
                  <IonButton
                    onClick={async () => {
                      const res = await handleNotificationPermissions();

                      // Case 1: User is on android device + batt opt is enabled > show batt opt slide
                      if (
                        Capacitor.getPlatform() === "android" &&
                        isBatteryOptEnabled &&
                        res !== "denied" &&
                        res !== undefined
                      ) {
                        switchToNextPage();
                        // Case 2: User is on android device + batt opt is disabled > close onboarding and trigger joyride
                      } else if (
                        Capacitor.getPlatform() === "android" &&
                        !isBatteryOptEnabled
                      ) {
                        dismissOnboardingSlides();
                        // Case 3: User is on non-android device > close onboarding and trigger joyride
                      } else {
                        dismissOnboardingSlides();
                      }

                      if (res === "granted") {
                        const notifications = [
                          "fajrNotification",
                          "dhuhrNotification",
                          "asrNotification",
                          "maghribNotification",
                          "ishaNotification",
                        ] as const;

                        for (const notification of notifications) {
                          await updateUserPrefs(
                            dbConnection,
                            notification,
                            "on",
                            setUserPreferences,
                          );
                        }

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

                        await scheduleAfterIshaDailyNotifications(
                          Number(
                            userPreferences.dailyNotificationAfterIshaDelay,
                          ),
                          userLocations,
                          userPreferences,
                        );

                        await updateUserPrefs(
                          dbConnection,
                          "dailyNotificationOption",
                          "afterIsha",
                          setUserPreferences,
                        );
                        await updateUserPrefs(
                          dbConnection,
                          "dailyNotification",
                          "1",
                          setUserPreferences,
                        );
                      } else if (res === "denied") {
                        dismissOnboardingSlides();
                      }
                    }}
                    className="m-0 font-semibold"
                  >
                    Turn on reminders
                  </IonButton>
                  <IonButton
                    fill="clear"
                    onClick={() => {
                      dismissOnboardingSlides();
                    }}
                    className="m-0 mt-2 font-semibold [--color:var(--current-salah-color)]"
                  >
                    Skip for now
                  </IonButton>
                </section>
              </section>
            </SwiperSlide>

            {isBatteryOptEnabled && (
              <SwiperSlide>
                <section className="flex flex-col h-full pt-[calc(env(safe-area-inset-top,0px)+3.5rem)] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                  <h1 className="m-0 mb-1.5 text-[1.875rem] font-bold leading-tight">
                    Make sure reminders arrive on time
                  </h1>
                  <p className="text-base text-pretty text-[var(--secondary-text-color)]">
                    Some phones delay notifications to save battery. Turning off
                    battery optimisation for My Salah App ensures reminders
                    arrive on time.
                  </p>
                  <section
                    aria-hidden="true"
                    className="flex flex-col items-center justify-center flex-1 gap-3 py-6"
                  >
                    <div className="flex w-full gap-3 p-3.5 rounded-[1.125rem] bg-[var(--sheet-group-bg)]">
                      <img
                        className="rounded-full size-9"
                        src={appLogo}
                        alt=""
                      />
                      <div className="flex-1 min-w-0">
                        <p className="flex justify-between mb-0.5 text-xs text-[var(--secondary-text-color)]">
                          My Salah App
                          <span>{exampleNotifications[0].time}</span>
                        </p>
                        <p className="text-[0.9375rem] font-semibold">
                          {exampleNotifications[0].title}
                        </p>
                        <p className="text-sm text-[var(--secondary-text-color)]">
                          {exampleNotifications[0].body}
                        </p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-[var(--tag-blue-bg)] px-2.5 py-0.5 text-xs font-semibold text-[var(--current-salah-color)]">
                      <LuCheck />
                      Arrives on time
                    </span>
                  </section>
                  <section className="flex flex-col">
                    <IonButton
                      onClick={async () => {
                        if (userPreferences.hasSeenBatteryPrompt === "0") {
                          await requestIgnoreBatteryOptimization();
                          dismissOnboardingSlides();
                          await updateUserPrefs(
                            dbConnection,
                            "hasSeenBatteryPrompt",
                            "1",
                            setUserPreferences,
                          );
                        } else {
                          await promptToOpenDeviceSettings(
                            "Disable Battery Optimization",
                            "To ensure notifications arrive on time, please turn off battery optimization for this app.",
                            AndroidSettings.BatteryOptimization,
                          );
                          dismissOnboardingSlides();
                        }
                        // switchToNextPage();
                      }}
                      className="m-0 font-semibold"
                    >
                      Improve notification reliability
                    </IonButton>
                    <IonButton
                      fill="clear"
                      onClick={() => {
                        // switchToNextPage();
                        dismissOnboardingSlides();
                      }}
                      className="m-0 mt-2 font-semibold [--color:var(--current-salah-color)]"
                    >
                      Skip for now
                    </IonButton>
                  </section>
                </section>
              </SwiperSlide>
            )}

            <SwiperSlide>
              <section className="flex flex-col h-full pt-[calc(env(safe-area-inset-top,0px)+3.5rem)] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                <h1 className="m-0 mb-1.5 text-[1.875rem] font-bold leading-tight">
                  Stay consistent with your Salah
                </h1>
                <p className="text-base text-pretty text-[var(--secondary-text-color)]">
                  Get a reminder at 9 pm each day to log your Salah. You can
                  change the time or turn it off later in Settings.
                </p>
                <section
                  aria-hidden="true"
                  className="flex flex-col justify-center flex-1 py-6"
                >
                  <div className="flex gap-3 p-3.5 rounded-[1.125rem] bg-[var(--sheet-group-bg)]">
                    <img className="rounded-full size-9" src={appLogo} alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="flex justify-between mb-0.5 text-xs text-[var(--secondary-text-color)]">
                        My Salah App
                        <span>09:00 pm</span>
                      </p>
                      <p className="text-[0.9375rem] font-semibold">
                        {exampleNotifications[1].title}
                      </p>
                      <p className="text-sm text-[var(--secondary-text-color)]">
                        {exampleNotifications[1].body}
                      </p>
                    </div>
                  </div>
                </section>
                <section className="flex flex-col">
                  <IonButton
                    onClick={async () => {
                      const permission =
                        await LocalNotifications.requestPermissions();

                      if (permission.display === "granted") {
                        dismissOnboardingSlides();
                        await scheduleFixedTimeDailyNotification(21, 0);
                        await updateUserPrefs(
                          dbConnection,
                          "dailyNotification",
                          "1",
                          setUserPreferences,
                        );
                        await updateUserPrefs(
                          dbConnection,
                          "dailyNotificationTime",
                          "21:00",
                          setUserPreferences,
                        );
                      } else if (permission.display === "denied") {
                        dismissOnboardingSlides();
                      }
                    }}
                    className="m-0 font-semibold"
                  >
                    Remind me each day
                  </IonButton>
                  <IonButton
                    fill="clear"
                    onClick={() => {
                      dismissOnboardingSlides();
                    }}
                    className="m-0 mt-2 font-semibold [--color:var(--current-salah-color)]"
                  >
                    Skip for now
                  </IonButton>
                </section>
              </section>
            </SwiperSlide>
          </Swiper>
        </section>
      </IonContent>
    </IonModal>
  );
};

export default Onboarding;
