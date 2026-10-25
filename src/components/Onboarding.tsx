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
          {onboardingMode === "newUser" && activeSlideIndex > 0 && (
            <>
              <IonButton
                style={{
                  top: "calc(env(safe-area-inset-top, 0px) - 10px)",
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
                <h1 className="text-3xl">I am a...</h1>
                <section>
                  <IonButton
                    expand="block"
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
                    <div>
                      <p>Brother</p>
                    </div>
                  </IonButton>

                  <IonButton
                    color="tertiary"
                    className="mt-5"
                    expand="block"
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
                    <div>
                      <p>Sister</p>
                    </div>
                  </IonButton>
                </section>
              </section>
            </SwiperSlide>
            <SwiperSlide>
              <section className="flex flex-col justify-center h-full">
                <section className="m-4 text-center">
                  <h1 className="mb-2 text-2xl font-bold">
                    Do you want to turn on Salah times?
                  </h1>
                  <p>Turn on Salah times</p>
                </section>
                <section className="flex flex-col ">
                  <IonButton
                    onClick={async () => {
                      switchToNextPage();
                      // setIsSalahTimesOnboarding(true);
                    }}
                    className="mb-4"
                  >
                    Yes
                  </IonButton>
                  <IonButton
                    fill="clear"
                    onClick={() => {
                      swiperRef.current?.slideTo(8, 0);
                      // setIsSalahTimesOnboarding(false);
                    }}
                    className="text-center text-white mb- rounded-2xl"
                  >
                    No
                  </IonButton>
                </section>
              </section>
            </SwiperSlide>
            <SwiperSlide>
              <section
                style={{ marginTop: "calc(env(safe-area-inset-top, 0px))" }}
                className="flex flex-col items-center justify-center"
              >
                <section className="m-4 text-center">
                  <h1 className="mb-2 text-2xl font-bold">Location</h1>
                  <p>Select your Location</p>
                </section>
                <section className="relative">
                  <AddLocationOptions
                    dbConnection={dbConnection}
                    setUserLocations={setUserLocations}
                    userLocations={userLocations}
                    setShowLocationFailureToast={setShowLocationFailureToast}
                    setShowLocationAddedToast={setShowLocationAddedToast}
                    onboardingMode={onboardingMode}
                    switchToNextPage={switchToNextPage}
                  />
                </section>
                <IonButton
                  onClick={async () => {
                    switchToNextPage();
                  }}
                  className={`absolute bottom-5 w-full ${userLocations.length === 0 ? "hidden" : "visible"}`}
                >
                  Next
                </IonButton>
              </section>
            </SwiperSlide>
            <SwiperSlide>
              <section
                style={{ marginTop: "calc(env(safe-area-inset-top, 0px))" }}
                className="flex flex-col justify-center h-full"
              >
                <section className="m-4 text-center">
                  <h1 className="mb-2 text-2xl font-bold">
                    Calculation Method
                  </h1>
                  <p>Select your calculation method</p>
                </section>
                <CalculationMethodOptions
                  dbConnection={dbConnection}
                  setSegmentOption={setSegmentOption}
                  segmentOption={segmentOption}
                  userLocations={userLocations}
                  userPreferences={userPreferences}
                  setUserPreferences={setUserPreferences}
                />
                {/* <section className=""> */}
              </section>
              <IonButton
                disabled={
                  userPreferences.prayerCalculationMethod === "" ? true : false
                }
                onClick={async () => {
                  switchToNextPage();
                }}
                className={`absolute bottom-5 w-full ${userPreferences.prayerCalculationMethod === "" ? "hidden" : "visible"}`}
              >
                Next
              </IonButton>
            </SwiperSlide>
            <SwiperSlide>
              <section className="flex flex-col justify-center h-full">
                <section className="m-4 text-center">
                  <h1 className="mb-2 text-2xl font-bold">Madhab</h1>
                  <p>Select Madhab</p>
                </section>
                <section className="mx-4">
                  <IonButton
                    expand="block"
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
                    <div>
                      <p className="mt-0">Shafi'i, Maliki & Hanbali</p>
                      <p className="mt-2 text-xs">Earlier Asr time</p>
                    </div>
                  </IonButton>
                  <IonButton
                    color="secondary"
                    className="mt-5"
                    expand="block"
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
                    <div>
                      <p className="mt-0">Hanafi</p>
                      <p className="mt-2 text-xs">Later Asr time</p>
                    </div>
                  </IonButton>
                </section>
              </section>
            </SwiperSlide>
            <SwiperSlide>
              <section className="flex flex-col justify-center h-full">
                <section className="m-4 text-center">
                  <h1 className="mb-2 text-2xl font-bold">
                    Enable Notifications
                  </h1>
                  <p>
                    We’ll notify you at each Salah time and once daily to log
                    your Salahs. You can change sounds and customise individual
                    reminders later.
                  </p>
                </section>
                <section className="flex flex-col ">
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
                    className="mb-4"
                  >
                    Allow notifications
                  </IonButton>
                  <IonButton
                    fill="clear"
                    onClick={() => {
                      dismissOnboardingSlides();
                    }}
                    className="mb-2 text-center rounded-2xl text-[var(--ion-text-color)]"
                  >
                    Skip for now
                  </IonButton>
                </section>
              </section>
            </SwiperSlide>

            {isBatteryOptEnabled && (
              <SwiperSlide>
                <section className="flex flex-col justify-center h-full">
                  <section className="m-4 text-center">
                    <h1 className="mb-2 text-2xl font-bold">
                      Make sure reminders arrive on time
                    </h1>
                    <p>
                      Some phones delay notifications to save battery. Turning
                      off battery optimisation helps ensure Salah reminders are
                      delivered on time.
                    </p>
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
                      className="mb-4"
                    >
                      Improve notification reliability
                    </IonButton>
                    <IonButton
                      fill="clear"
                      onClick={() => {
                        // switchToNextPage();
                        dismissOnboardingSlides();
                      }}
                      className="mb-2 text-center text-[var(--ion-text-color)] rounded-2xl"
                    >
                      Skip for now
                    </IonButton>
                  </section>
                </section>
              </SwiperSlide>
            )}

            <SwiperSlide>
              <section className="flex flex-col justify-center h-full">
                <section className="m-4 text-center">
                  <h1 className="mb-2 text-2xl font-bold">
                    Stay Consistent with Your Salah
                  </h1>
                  <p>
                    We’ll send you a gentle reminder each day to log which
                    Salahs you prayed or missed. You can adjust the time or turn
                    this off anytime in settings.
                  </p>
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
                    className="mb-4"
                  >
                    Remind me each day
                  </IonButton>
                  <IonButton
                    fill="clear"
                    onClick={() => {
                      dismissOnboardingSlides();
                    }}
                    className="text-[var(--ion-text-color)] mb-2text-center rounded-2xl"
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
