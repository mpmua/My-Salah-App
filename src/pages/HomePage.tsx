import MissedSalahsListBottomSheet from "../components/BottomSheets/BottomSheetMissedSalahsList";
import { AnimatePresence, motion } from "framer-motion";
import SalahTable from "../components/SalahTable/SalahTable";
import MissedSalahCounter from "../components/Stats/MissedSalahCounter";
import { Dialog } from "@capacitor/dialog";
import { TbEdit } from "react-icons/tb";

import {
  SalahRecordsArrayType,
  userPreferencesType,
  SalahByDateObjType,
} from "../types/types";
import { useEffect, useRef, useState } from "react";
import { getMissedSalahCount } from "../utils/helpers";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

interface HomePageProps {
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  setUserPreferences: React.Dispatch<React.SetStateAction<userPreferencesType>>;
  setShowMultiEditIntro: React.Dispatch<React.SetStateAction<boolean>>;
  showMultiEditIntro: boolean;
  setFetchedSalahData: React.Dispatch<
    React.SetStateAction<SalahRecordsArrayType>
  >;
  fetchedSalahData: SalahRecordsArrayType;
  userPreferences: userPreferencesType;
  setShowMissedSalahsSheet: React.Dispatch<React.SetStateAction<boolean>>;
  showMissedSalahsSheet: boolean;
  setMissedSalahList: React.Dispatch<React.SetStateAction<SalahByDateObjType>>;
  missedSalahList: SalahByDateObjType;
  setIsMultiEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  isMultiEditMode: boolean;
  activeStreakCount: number;
  generateStreaks: (fetchedSalahData: SalahRecordsArrayType) => void;
}

const HomePage = ({
  dbConnection,
  setUserPreferences,
  setShowMultiEditIntro,
  showMultiEditIntro,
  setFetchedSalahData,
  fetchedSalahData,
  userPreferences,
  setShowMissedSalahsSheet,
  showMissedSalahsSheet,
  missedSalahList,
  setIsMultiEditMode,
  isMultiEditMode,
  activeStreakCount,
  generateStreaks,
}: HomePageProps) => {
  const [selectedSalahAndDate, setSelectedSalahAndDate] =
    useState<SalahByDateObjType>({});
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [animateStreakCounter, setAnimateStreakCounter] =
    useState<boolean>(false);
  const prevActiveStreakCount = useRef<number>(0);
  const selectedSalahCount = Object.values(selectedSalahAndDate).flat().length;

  // const page = useRef(null);

  // const [presentingElement, setPresentingElement] =
  //   useState<HTMLElement | null>(null);

  // useEffect(() => {
  //   setPresentingElement(page.current);
  // }, []);

  const showStreakInfoHomePage = async () => {
    await Dialog.alert({
      title: "Streaks Explained",
      message: `Your current streak shows how many consecutive days you've completed all your Salah, starting from the first day where all Salah have been prayed. ${
        userPreferences.userGender === "male"
          ? "If you miss a Salah or are late, the streak will reset."
          : "If you're late, the streak will reset, selecting 'Excused' will pause the streak, but won't break it."
      }`,
    });
  };

  useEffect(() => {
    if (activeStreakCount > prevActiveStreakCount.current) {
      setAnimateStreakCounter(true);
    }
    prevActiveStreakCount.current = activeStreakCount;
  }, [activeStreakCount]);

  return (
    <IonPage
    // ref={page}
    >
      <IonHeader className="ion-no-border">
        <IonToolbar
          className={`page-header-toolbar ${isMultiEditMode ? "hidden" : ""}`}
        >
          <IonTitle>Home</IonTitle>
          <IonButtons slot="secondary">
            <IonButton
              style={{
                "--padding-end": "12px",
                "--ripple-color": "transparent",
              }}
            >
              {" "}
              {getMissedSalahCount(missedSalahList) > 0 &&
              userPreferences.showMissedSalahCount === "1" ? (
                <MissedSalahCounter
                  dbConnection={dbConnection}
                  setShowMissedSalahsSheet={setShowMissedSalahsSheet}
                  isMultiEditMode={isMultiEditMode}
                  missedSalahList={missedSalahList}
                  setUserPreferences={setUserPreferences}
                  userPreferences={userPreferences}
                />
              ) : null}
            </IonButton>
          </IonButtons>
          <IonButtons slot="primary">
            <IonButton
              style={{
                "--ripple-color": "transparent",
              }}
            >
              {" "}
              <div className="mr-3" onClick={showStreakInfoHomePage}>
                <div className="relative flex items-center justify-center w-full">
                  <svg
                    className="w-4 h-7"
                    xmlns="http://www.w3.org/2000/svg"
                    width="351"
                    height="547"
                    viewBox="0 0 351 547"
                    fill="none"
                  >
                    <path
                      d="M206.353 6.13331C221.018 29.3333 225.95 59.4666 218.485 80.5333C212.752 96.9333 204.62 107.067 177.024 132C155.027 151.867 135.297 178.667 121.832 206.667C81.1711 291.467 91.8362 387.867 150.495 465.6C168.359 489.333 199.421 516.533 225.95 531.867C238.215 538.933 240.215 540.933 238.882 544.667C237.549 548 233.549 546.933 221.418 539.733C203.954 529.467 189.556 518.8 174.091 504.933L160.36 492.4L148.361 498.267C116.633 513.467 88.77 512.933 64.7734 496.533C50.6421 486.933 30.9116 464.4 31.9781 458.933C33.0446 453.467 60.5074 441.333 78.6381 438.533C93.7026 436.133 113.167 439.467 123.298 446C124.898 447.067 126.498 448 126.898 448C127.298 448 125.031 443.733 122.099 438.4C119.032 433.2 114.366 423.733 111.7 417.467L106.767 406.267L90.2365 406.533C69.8394 406.933 57.3078 404.533 43.9764 397.867C24.7792 388.133 8.91475 366.133 2.11572 339.6C-1.61708 325.467 -0.950506 323.733 8.51481 322.4C38.9105 318.267 66.6398 325.733 84.104 342.8L91.9695 350.4L91.303 342.933C90.7697 338.667 90.1031 329.2 89.5699 321.867L88.77 308.4L81.7043 306.8C72.3723 304.667 54.9082 296.133 45.8428 289.333C31.9781 278.8 22.7794 264.4 18.9133 246.8C16.3804 235.867 16.7803 205.067 19.4466 198.267C21.313 193.733 24.2459 193.6 36.5108 197.867C50.7754 202.8 55.7081 205.2 65.3067 211.467C79.7046 221.067 88.77 232.8 95.0358 250C95.7023 252 96.6355 250.533 98.5019 243.6C99.9684 238.533 102.901 229.6 105.168 223.733L109.3 212.933L102.901 207.6C64.7734 175.867 56.7746 140.4 77.7049 97.8666C88.2367 76.8 90.1031 76.6666 109.7 96.4C128.764 115.733 135.43 129.067 136.896 151.2L137.696 162.933L141.829 157.2C144.229 154 150.761 146 156.627 139.467L167.159 127.6L162.893 119.467C160.493 114.933 156.894 106.533 154.894 100.667C151.694 91.6 151.161 87.7333 151.161 74.6666C151.028 56.5333 153.827 46.4 162.493 33.7333C172.491 19.4666 194.222 -2.85009e-05 200.221 -2.85009e-05C201.421 -2.85009e-05 204.22 2.79997 206.353 6.13331Z"
                      fill="var(--wreath-color)"
                    ></path>
                    <path
                      d="M324.204 88.2667C328.203 94.4 335.402 111.6 336.869 118.4C338.868 128.267 338.735 140.933 336.335 148.8C333.003 160 325.137 170.267 303.54 192C269.945 225.6 253.681 254 244.349 296C240.882 311.6 240.082 348.533 242.882 365.2C252.881 424.933 286.343 473.733 339.002 505.6C348.734 511.467 351 513.467 351 516.133C351 521.467 346.867 520.667 333.936 512.8C320.471 504.8 309.939 496.8 296.608 484.933L288.076 477.333L277.944 482C263.546 488.933 248.748 491.6 236.616 489.6C225.285 487.6 212.086 480.933 202.088 472C193.023 463.867 184.624 452 185.824 448.933C186.89 445.867 206.354 436.533 217.019 433.867C227.151 431.333 242.615 431.867 251.681 435.067C254.88 436.267 257.68 437.067 257.813 436.933C257.947 436.8 255.014 430.533 251.281 422.933L244.615 409.333H230.484C206.754 409.333 193.023 404.133 180.224 390.4C172.092 381.6 164.893 367.733 161.56 354.267C158.627 342.533 159.427 341.733 173.692 340.533C194.222 338.933 214.22 344.533 226.218 355.333L231.684 360.267V353.733C231.684 350 231.284 343.333 230.884 338.933L229.951 330.8L223.152 328.533C188.49 317.333 171.559 293.467 173.425 258.667C174.092 245.333 175.692 239.467 178.625 238.4C181.558 237.2 194.356 241.2 204.888 246.4C217.686 252.667 229.151 263.733 233.817 274.133L237.15 281.733L241.149 270.533C243.415 264.4 245.548 258.267 245.948 256.933C246.482 255.067 244.482 252.4 237.949 246.533C222.352 232.4 213.02 214.267 213.02 198.133C213.02 184.8 220.752 162.4 228.751 152.133C232.75 147.2 237.283 149.333 249.681 161.733C263.146 175.2 268.612 185.6 270.878 201.467L272.478 212.4L274.744 208.933C275.944 207.067 280.61 201.6 285.009 196.933L293.008 188.267L288.342 178.533C271.945 143.6 279.544 114.133 310.739 91.0667C319.804 84.5333 321.538 84.1333 324.204 88.2667Z"
                      fill="var(--wreath-color)"
                    ></path>
                  </svg>
                  <div className="mt-1">
                    <AnimatePresence mode="wait">
                      <motion.p
                        className="text-xs text-white"
                        key={activeStreakCount}
                        {...(animateStreakCounter
                          ? {
                              initial: { opacity: 0, y: -10 },
                              animate: {
                                opacity: 1,
                                y: 0,
                                transition: {
                                  type: "spring",
                                  stiffness: 100,
                                  damping: 5,
                                  // delay: 0.2,
                                },
                              },
                              exit: { opacity: 0, y: 10 },
                            }
                          : {})}
                      >
                        {activeStreakCount}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                  <svg
                    className="w-4 h-7 mr-[-0.5rem]"
                    xmlns="http://www.w3.org/2000/svg"
                    width="352"
                    height="547"
                    viewBox="0 0 352 547"
                    fill="none"
                  >
                    <path
                      d="M144.667 6.13331C130 29.3333 125.067 59.4666 132.533 80.5333C138.267 96.9333 146.4 107.067 174 132C196 151.867 215.733 178.667 229.2 206.667C269.867 291.467 259.2 387.867 200.533 465.6C182.667 489.333 151.6 516.533 125.067 531.867C112.8 538.933 110.8 540.933 112.133 544.667C113.467 548 117.467 546.933 129.6 539.733C147.067 529.467 161.467 518.8 176.933 504.933L190.667 492.4L202.667 498.267C234.4 513.467 262.267 512.933 286.267 496.533C300.4 486.933 320.133 464.4 319.067 458.933C318 453.467 290.533 441.333 272.4 438.533C257.333 436.133 237.867 439.467 227.733 446C226.133 447.067 224.533 448 224.133 448C223.733 448 226 443.733 228.933 438.4C232 433.2 236.667 423.733 239.333 417.467L244.267 406.267L260.8 406.533C281.2 406.933 293.733 404.533 307.067 397.867C326.267 388.133 342.133 366.133 348.933 339.6C352.667 325.467 352 323.733 342.533 322.4C312.133 318.267 284.4 325.733 266.933 342.8L259.067 350.4L259.733 342.933C260.267 338.667 260.933 329.2 261.467 321.867L262.267 308.4L269.333 306.8C278.667 304.667 296.133 296.133 305.2 289.333C319.067 278.8 328.267 264.4 332.133 246.8C334.667 235.867 334.267 205.067 331.6 198.267C329.733 193.733 326.8 193.6 314.533 197.867C300.267 202.8 295.333 205.2 285.733 211.467C271.333 221.067 262.267 232.8 256 250C255.333 252 254.4 250.533 252.533 243.6C251.067 238.533 248.133 229.6 245.867 223.733L241.733 212.933L248.133 207.6C286.267 175.867 294.267 140.4 273.333 97.8666C262.8 76.8 260.933 76.6666 241.333 96.4C222.267 115.733 215.6 129.067 214.133 151.2L213.333 162.933L209.2 157.2C206.8 154 200.267 146 194.4 139.467L183.867 127.6L188.133 119.467C190.533 114.933 194.133 106.533 196.133 100.667C199.333 91.6 199.867 87.7333 199.867 74.6666C200 56.5333 197.2 46.4 188.533 33.7333C178.533 19.4666 156.8 -2.85009e-05 150.8 -2.85009e-05C149.6 -2.85009e-05 146.8 2.79997 144.667 6.13331Z"
                      fill="var(--wreath-color)"
                    ></path>
                    <path
                      d="M26.8 88.2667C22.8 94.4 15.6 111.6 14.1333 118.4C12.1333 128.267 12.2667 140.933 14.6667 148.8C18 160 25.8667 170.267 47.4667 192C81.0667 225.6 97.3333 254 106.667 296C110.133 311.6 110.933 348.533 108.133 365.2C98.1333 424.933 64.6667 473.733 12 505.6C2.26667 511.467 0 513.467 0 516.133C0 521.467 4.13333 520.667 17.0667 512.8C30.5333 504.8 41.0667 496.8 54.4 484.933L62.9333 477.333L73.0667 482C87.4667 488.933 102.267 491.6 114.4 489.6C125.733 487.6 138.933 480.933 148.933 472C158 463.867 166.4 452 165.2 448.933C164.133 445.867 144.667 436.533 134 433.867C123.867 431.333 108.4 431.867 99.3333 435.067C96.1333 436.267 93.3333 437.067 93.2 436.933C93.0667 436.8 96 430.533 99.7333 422.933L106.4 409.333H120.533C144.267 409.333 158 404.133 170.8 390.4C178.933 381.6 186.133 367.733 189.467 354.267C192.4 342.533 191.6 341.733 177.333 340.533C156.8 338.933 136.8 344.533 124.8 355.333L119.333 360.267V353.733C119.333 350 119.733 343.333 120.133 338.933L121.067 330.8L127.867 328.533C162.533 317.333 179.467 293.467 177.6 258.667C176.933 245.333 175.333 239.467 172.4 238.4C169.467 237.2 156.667 241.2 146.133 246.4C133.333 252.667 121.867 263.733 117.2 274.133L113.867 281.733L109.867 270.533C107.6 264.4 105.467 258.267 105.067 256.933C104.533 255.067 106.533 252.4 113.067 246.533C128.667 232.4 138 214.267 138 198.133C138 184.8 130.267 162.4 122.267 152.133C118.267 147.2 113.733 149.333 101.333 161.733C87.8667 175.2 82.4 185.6 80.1333 201.467L78.5333 212.4L76.2667 208.933C75.0667 207.067 70.4 201.6 66 196.933L58 188.267L62.6667 178.533C79.0667 143.6 71.4667 114.133 40.2667 91.0667C31.2 84.5333 29.4667 84.1333 26.8 88.2667Z"
                      fill="var(--wreath-color)"
                    ></path>
                  </svg>
                </div>
              </div>
            </IonButton>
          </IonButtons>
        </IonToolbar>
        {isMultiEditMode && (
          <IonToolbar className="page-header-toolbar">
            <div className="flex items-center gap-3 px-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-[var(--multi-edit-accent-color)] text-white">
                <TbEdit aria-hidden="true" />
              </span>
              <p className="flex-1 text-[1.0625rem] font-semibold">
                Select Salah
              </p>
              <p
                aria-live="polite"
                className={`rounded-full px-3 py-1 text-[0.8125rem] font-semibold ${
                  selectedSalahCount > 0
                    ? "bg-[var(--multi-edit-chip-color)] text-[var(--multi-edit-chip-text-color)]"
                    : "bg-[var(--multi-edit-chip-muted-color)] text-[var(--secondary-text-color)]"
                }`}
              >
                {selectedSalahCount > 0
                  ? `${selectedSalahCount} selected`
                  : "None yet"}
              </p>
            </div>
          </IonToolbar>
        )}
      </IonHeader>
      <IonContent>
        <motion.section
          // {...pageTransitionStyles}
          className={`home-page-wrap h-full`}
        >
          <section className="h-full home-page-components-wrap">
            <SalahTable
              dbConnection={dbConnection}
              // setUserPreferences={setUserPreferences}
              setShowMultiEditIntro={setShowMultiEditIntro}
              showMultiEditIntro={showMultiEditIntro}
              userPreferences={userPreferences}
              setFetchedSalahData={setFetchedSalahData}
              fetchedSalahData={fetchedSalahData}
              setSelectedSalahAndDate={setSelectedSalahAndDate}
              selectedSalahAndDate={selectedSalahAndDate}
              setIsMultiEditMode={setIsMultiEditMode}
              isMultiEditMode={isMultiEditMode}
              setShowUpdateStatusModal={setShowUpdateStatusModal}
              showUpdateStatusModal={showUpdateStatusModal}
              generateStreaks={generateStreaks}
            />
            <MissedSalahsListBottomSheet
              dbConnection={dbConnection}
              setFetchedSalahData={setFetchedSalahData}
              setShowMissedSalahsSheet={setShowMissedSalahsSheet}
              showMissedSalahsSheet={showMissedSalahsSheet}
              missedSalahList={missedSalahList}
            />
          </section>
        </motion.section>
      </IonContent>
      {isMultiEditMode && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <IonFooter
            mode="ios"
            className="ion-no-border border-t border-[var(--table-row-border-color)]"
          >
            <IonToolbar className="[--background:var(--primary-color)] [--padding-end:1rem] [--padding-start:1rem]">
              <div className="flex items-center gap-3">
                <IonButton
                  className="m-0 flex-1 text-[0.9375rem] font-semibold [--background:var(--multi-edit-cancel-color)] [--color:var(--ion-text-color)]"
                  onClick={() => {
                    setIsMultiEditMode(false);
                    setSelectedSalahAndDate({});
                  }}
                >
                  Cancel
                </IonButton>
                <span className="h-8 w-px bg-[var(--multi-edit-divider-color)]" />
                <IonButton
                  className="m-0 flex-[2] text-[0.9375rem] font-semibold"
                  disabled={selectedSalahCount === 0}
                  onClick={() => setShowUpdateStatusModal(true)}
                >
                  {selectedSalahCount > 0
                    ? `Set status for ${selectedSalahCount}`
                    : "Set status"}
                </IonButton>
              </div>
            </IonToolbar>
          </IonFooter>
        </motion.div>
      )}
    </IonPage>
  );
};

export default HomePage;
