import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Calendar from "../components/Stats/Calendar";
import YearlyStats from "../components/Stats/YearlyStats";
import {
  reasonsToShowType,
  SalahNamesType,
  ReasonCountsByStatusType,
  SalahRecordsArrayType,
  SalahStatusType,
  StatsDateRangeType,
  userPreferencesType,
} from "../types/types";
import DonutPieChart from "../components/Stats/DonutPieChart";
import ReasonsCard from "../components/Stats/ReasonsCard";
import BottomSheetReasons from "../components/BottomSheets/BottomSheetReasons";
import StreakCounter from "../components/Stats/StreakCounter";
import { streakDatesObjType } from "../types/types";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import {
  // pageTransitionStyles,
  salahStatusColorsHexCodes,
} from "../utils/constants";

import {
  IonContent,
  IonHeader,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import { useLocation } from "react-router-dom";
import SalahSegmentTabs from "../components/Stats/SalahSegmentTabs";
import { toggleDBConnection } from "../utils/dbUtils";
import {
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import {
  eachMonthOfInterval,
  endOfMonth,
  endOfYear,
  format,
  isAfter,
  isBefore,
  parse,
  parseISO,
} from "date-fns";

// import StreakCount from "../components/Stats/StreakCount";

interface StatsPageProps {
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  userPreferences: userPreferencesType;
  fetchedSalahData: SalahRecordsArrayType;
  streakDatesObjectsArr: streakDatesObjType[];
  activeStreakCount: number;
}

type StatsPeriodType = "overall" | "monthly" | "yearly";

const StatsPage = ({
  dbConnection,
  userPreferences,
  fetchedSalahData,
  streakDatesObjectsArr,
  activeStreakCount,
}: StatsPageProps) => {
  const location = useLocation();
  const isStatsPage = location.pathname === "/StatsPage";
  const reasonsFetchQueue = useRef<Promise<void>>(Promise.resolve());

  const [reasonCountsByStatus, setReasonCountsByStatus] =
    useState<ReasonCountsByStatusType>({
      "male-alone": {},
      late: {},
      missed: {},
    });
  const [showReasonsSheet, setShowReasonsSheet] = useState(false);
  const [reasonsToShow, setReasonsToShow] = useState<reasonsToShowType>();
  const [statsToShow, setStatsToShow] = useState<
    Exclude<SalahNamesType, "Asar"> | "All"
  >("All");
  const [statsPeriod, setStatsPeriod] = useState<StatsPeriodType>("monthly");

  const salahStatusesOverallArr: SalahStatusType[] = [];

  const [clickedDate, setClickedDate] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const userStartDateParsed = parse(
    userPreferences.userStartDate,
    "yyyy-MM-dd",
    new Date(),
  );
  const todaysDate = new Date();
  const earliestYear = userStartDateParsed.getFullYear();
  const currentYear = todaysDate.getFullYear();

  const monthsBetween = eachMonthOfInterval({
    start: userStartDateParsed,
    end: todaysDate,
  });

  const formattedMonths = monthsBetween.map((month) =>
    format(month, "MMMM yyyy"),
  );
  formattedMonths.reverse();

  let activeDateRange: StatsDateRangeType | null = null;

  if (statsPeriod === "monthly") {
    const selectedMonthDate = parse(
      formattedMonths[currentMonth],
      "MMMM yyyy",
      todaysDate,
    );
    activeDateRange = {
      start: selectedMonthDate,
      end: endOfMonth(selectedMonthDate),
    };
  } else if (statsPeriod === "yearly") {
    const selectedYearDate = new Date(selectedYear, 0, 1);
    activeDateRange = {
      start: selectedYearDate,
      end: endOfYear(selectedYearDate),
    };
  }

  const handleMonthSelect = (month: Date) => {
    const monthIndex = formattedMonths.indexOf(format(month, "MMMM yyyy"));

    if (monthIndex === -1) {
      return;
    }

    setCurrentMonth(monthIndex);
    setStatsPeriod("monthly");
  };

  const getAllSalahStatuses = () => {
    for (let i = 0; i < fetchedSalahData.length; i++) {
      if (activeDateRange) {
        const itemDate = parseISO(fetchedSalahData[i].date);

        if (
          isBefore(itemDate, activeDateRange.start) ||
          isAfter(itemDate, activeDateRange.end)
        ) {
          continue;
        }
      }

      if (statsToShow === "All") {
        Object.values(fetchedSalahData[i].salahs).forEach((status) => {
          if (status !== "" && typeof status === "string") {
            salahStatusesOverallArr.push(status as SalahStatusType);
          }
        });
      } else if (statsToShow === "Fajr") {
        if (fetchedSalahData[i].salahs.Fajr) {
          salahStatusesOverallArr.push(fetchedSalahData[i].salahs.Fajr);
        }
      } else if (statsToShow === "Dhuhr") {
        if (fetchedSalahData[i].salahs.Dhuhr) {
          salahStatusesOverallArr.push(fetchedSalahData[i].salahs.Dhuhr);
        }
      } else if (statsToShow === "Asr") {
        if (fetchedSalahData[i].salahs.Asar) {
          salahStatusesOverallArr.push(fetchedSalahData[i].salahs.Asar);
        }
      } else if (statsToShow === "Maghrib") {
        if (fetchedSalahData[i].salahs.Maghrib) {
          salahStatusesOverallArr.push(fetchedSalahData[i].salahs.Maghrib);
        }
      } else if (statsToShow === "Isha") {
        if (fetchedSalahData[i].salahs.Isha) {
          salahStatusesOverallArr.push(fetchedSalahData[i].salahs.Isha);
        }
      }
    }
  };

  getAllSalahStatuses();

  const filterSalahStatuses = (salahStatus: SalahStatusType) =>
    salahStatusesOverallArr.filter((status) => status === salahStatus);

  const salahStatusStatistics = {
    salahInGroupDatesOverall: filterSalahStatuses("group").length,
    salahMaleAloneDatesOverall: filterSalahStatuses("male-alone").length,
    salahFemaleAloneDatesOverall: filterSalahStatuses("female-alone").length,
    salahExcusedDatesOverall: filterSalahStatuses("excused").length,
    salahMissedDatesOverall: filterSalahStatuses("missed").length,
    salahLateDatesOverall: filterSalahStatuses("late").length,
  };

  const donutPieChartData = [
    userPreferences.userGender === "male"
      ? {
          title: "In Jamaah",
          value: salahStatusStatistics.salahInGroupDatesOverall,
          color: salahStatusColorsHexCodes.group,
        }
      : {
          title: "Prayed",
          value: salahStatusStatistics.salahFemaleAloneDatesOverall,
          color: salahStatusColorsHexCodes["female-alone"],
        },
    userPreferences.userGender === "male"
      ? {
          title: "Alone",
          value: salahStatusStatistics.salahMaleAloneDatesOverall,
          color: salahStatusColorsHexCodes["male-alone"],
        }
      : {
          title: "Excused",
          value: salahStatusStatistics.salahExcusedDatesOverall,
          color: salahStatusColorsHexCodes.excused,
        },

    {
      title: "Late",
      value: salahStatusStatistics.salahLateDatesOverall,
      color: salahStatusColorsHexCodes.late,
    },
    {
      title: "Missed",
      value: salahStatusStatistics.salahMissedDatesOverall,
      color: salahStatusColorsHexCodes.missed,
    },
  ];

  const reasonStatuses: (keyof ReasonCountsByStatusType)[] =
    userPreferences.userGender === "male"
      ? ["male-alone", "late", "missed"]
      : ["late", "missed"];

  const rangeStartTime = activeDateRange?.start.getTime();
  const rangeEndTime = activeDateRange?.end.getTime();

  useEffect(() => {
    if (!isStatsPage) {
      return;
    }

    let cancelled = false;
    setReasonCountsByStatus({ "male-alone": {}, late: {}, missed: {} });

    const fetchSalahDataFromDB = async () => {
      try {
        await toggleDBConnection(dbConnection, "open");

        let query = `SELECT date, salahName, salahStatus, reasons, notes
        FROM salahDataTable
        WHERE date >= ?`;
        const queryValues: string[] = [userPreferences.userStartDate];

        if (rangeStartTime !== undefined && rangeEndTime !== undefined) {
          query += " AND date >= ? AND date <= ?";
          queryValues.push(
            format(rangeStartTime, "yyyy-MM-dd"),
            format(rangeEndTime, "yyyy-MM-dd"),
          );
        }

        const DBResultAllSalahData = await dbConnection.current!.query(
          query,
          queryValues,
        );

        if (!DBResultAllSalahData.values) {
          throw new Error("DBResultAllSalahData.values are undefined");
        }

        const DBResultAllSalahDataValues = DBResultAllSalahData.values;

        const maleAloneReasonsArr: string[] = [];
        const lateReasonsArr: string[] = [];
        const missedReasonsArr: string[] = [];

        const salahStatusesWithoutReasons = [
          "group",
          "excused",
          "female-alone",
        ];

        const populateReasonsArrays = (i: number) => {
          const reasons = DBResultAllSalahDataValues[i].reasons.split(", ");
          const salahStatus = DBResultAllSalahDataValues[i].salahStatus;

          if (salahStatus === "male-alone") {
            maleAloneReasonsArr.push(reasons);
          } else if (salahStatus === "late") {
            lateReasonsArr.push(reasons);
          } else if (salahStatus === "missed") {
            missedReasonsArr.push(reasons);
          }
        };

        for (let i = 0; i < DBResultAllSalahDataValues.length; i++) {
          if (
            !salahStatusesWithoutReasons.includes(
              DBResultAllSalahDataValues[i].salahStatus,
            ) &&
            DBResultAllSalahDataValues[i].reasons !== ""
          ) {
            const salahName: SalahNamesType =
              DBResultAllSalahDataValues[i].salahName;

            if (statsToShow === "All") {
              populateReasonsArrays(i);
            } else if (statsToShow === "Fajr" && salahName === "Fajr") {
              populateReasonsArrays(i);
            } else if (statsToShow === "Dhuhr" && salahName === "Dhuhr") {
              populateReasonsArrays(i);
            } else if (statsToShow === "Asr" && salahName === "Asar") {
              populateReasonsArrays(i);
            } else if (statsToShow === "Maghrib" && salahName === "Maghrib") {
              populateReasonsArrays(i);
            } else if (statsToShow === "Isha" && salahName === "Isha") {
              populateReasonsArrays(i);
            }
          }
        }
        const obj: ReasonCountsByStatusType = {
          "male-alone": {},
          late: {},
          missed: {},
        };

        const calculateReasonAmounts = (
          arr: string[],
          status: keyof ReasonCountsByStatusType,
        ) => {
          arr.forEach((reason: string) => {
            if (reason === "") return;

            if (obj[status][reason]) {
              obj[status][reason] += 1;
            } else {
              obj[status][reason] = 1;
            }
          });

          const sortedObj = Object.entries(obj[status])
            .sort((a, b) => a[1] - b[1])
            .reverse();

          obj[status] = Object.fromEntries(sortedObj);
        };

        calculateReasonAmounts(maleAloneReasonsArr.flat(), "male-alone");
        calculateReasonAmounts(lateReasonsArr.flat(), "late");
        calculateReasonAmounts(missedReasonsArr.flat(), "missed");

        if (!cancelled) {
          setReasonCountsByStatus(obj);
        }
      } catch (error) {
        console.error(error);
      } finally {
        await toggleDBConnection(dbConnection, "close");
      }
    };

    // Finish closing the previous request's connection before starting another.
    reasonsFetchQueue.current = reasonsFetchQueue.current
      .then(async () => {
        if (!cancelled) {
          await fetchSalahDataFromDB();
        }
      })
      .catch((error) => console.error(error));

    return () => {
      cancelled = true;
    };
  }, [
    dbConnection,
    fetchedSalahData,
    statsToShow,
    isStatsPage,
    rangeStartTime,
    rangeEndTime,
    userPreferences.userStartDate,
  ]);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="page-header-toolbar">
          <IonTitle>Stats</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <motion.section
          // {...pageTransitionStyles}
          className={`stats-page-wrap`}
        >
          <section className="stats-page-components-wrap">
            <StreakCounter
              streakDatesObjectsArr={streakDatesObjectsArr}
              activeStreakCount={activeStreakCount}
              userGender={userPreferences.userGender}
            />
            {/* <div className="sticky z-10 top-[56px] bg-white dark:bg-[#121212]"> */}

            <IonSegment
              className="mt-5 stats-period-segment"
              mode="ios"
              value={statsPeriod}
              onIonChange={(e) => {
                setStatsPeriod(e.detail.value as StatsPeriodType);
              }}
            >
              <IonSegmentButton
                className="stats-period-segment-button"
                value="monthly"
              >
                <IonLabel>Monthly</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton
                className="stats-period-segment-button"
                value="yearly"
              >
                <IonLabel>Yearly</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton
                className="stats-period-segment-button"
                value="overall"
              >
                <IonLabel>Overall</IonLabel>
              </IonSegmentButton>
            </IonSegment>

            <SalahSegmentTabs
              setStatsToShow={setStatsToShow}
              statsToShow={statsToShow}
            />

            {statsPeriod === "monthly" && (
              <div className="flex items-center justify-between py-2 my-5">
                <button
                  type="button"
                  aria-label="Previous year"
                  disabled={currentMonth + 1 > formattedMonths.length - 1}
                  className="flex items-center justify-center w-10 h-10 text-2xl disabled:opacity-30"
                  onClick={() => {
                    setCurrentMonth((prev) => {
                      if (prev + 12 > formattedMonths.length - 1) {
                        return formattedMonths.length - 1;
                      }
                      return prev + 12;
                    });
                  }}
                >
                  <HiOutlineChevronDoubleLeft />
                </button>
                <button
                  type="button"
                  aria-label="Previous month"
                  disabled={currentMonth === formattedMonths.length - 1}
                  onClick={() => {
                    setCurrentMonth((prev) => {
                      if (prev === formattedMonths.length - 1) {
                        return prev;
                      }
                      return prev + 1;
                    });
                  }}
                  className="flex items-center justify-center w-10 h-10 text-2xl disabled:opacity-30"
                >
                  <HiOutlineChevronLeft />
                </button>
                <span className="text-lg font-semibold tracking-wide text-center">
                  {formattedMonths[currentMonth]}
                </span>
                <button
                  type="button"
                  aria-label="Next month"
                  disabled={currentMonth === 0}
                  onClick={() => {
                    setCurrentMonth((prev) => {
                      if (prev === 0) {
                        return prev;
                      }
                      return prev - 1;
                    });
                  }}
                  className="flex items-center justify-center w-10 h-10 text-2xl disabled:opacity-30"
                >
                  <HiOutlineChevronRight />
                </button>
                <button
                  type="button"
                  aria-label="Next year"
                  disabled={currentMonth === 0}
                  onClick={() => {
                    setCurrentMonth((prev) => {
                      if (prev - 12 <= 0) {
                        return 0;
                      }
                      return prev - 12;
                    });
                  }}
                  className="flex items-center justify-center w-10 h-10 text-2xl disabled:opacity-30"
                >
                  <HiOutlineChevronDoubleRight />
                </button>
              </div>
            )}

            {statsPeriod === "yearly" && (
              <div className="flex items-center justify-between px-6 py-2 my-5">
                <button
                  type="button"
                  aria-label="Previous year"
                  disabled={selectedYear <= earliestYear}
                  onClick={() =>
                    setSelectedYear((previousYear) =>
                      Math.max(previousYear - 1, earliestYear),
                    )
                  }
                  className="flex items-center justify-center w-10 h-10 text-2xl disabled:opacity-30"
                >
                  <HiOutlineChevronLeft />
                </button>
                <span className="text-xl font-semibold tracking-wide">
                  {selectedYear}
                </span>
                <button
                  type="button"
                  aria-label="Next year"
                  disabled={selectedYear >= currentYear}
                  onClick={() =>
                    setSelectedYear((previousYear) =>
                      Math.min(previousYear + 1, currentYear),
                    )
                  }
                  className="flex items-center justify-center w-10 h-10 text-2xl disabled:opacity-30"
                >
                  <HiOutlineChevronRight />
                </button>
              </div>
            )}

            {statsPeriod === "overall" && (
              <div className="flex items-center justify-center py-2 my-5">
                <span className="flex items-center text-lg font-semibold tracking-wide text-center min-h-10">
                  {format(userStartDateParsed, "do MMMM yyyy")} – Today
                </span>
              </div>
            )}

            {/* </div> */}
            <AnimatePresence mode="wait">
              <motion.section
                key={`${statsPeriod}-${statsToShow}`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {Object.values(donutPieChartData).some((obj) => obj.value) && (
                  <DonutPieChart donutPieChartData={donutPieChartData} />
                )}
                {statsPeriod === "monthly" && (
                  <Calendar
                    dbConnection={dbConnection}
                    fetchedSalahData={fetchedSalahData}
                    statsToShow={statsToShow}
                    setClickedDate={setClickedDate}
                    clickedDate={clickedDate}
                    currentMonth={currentMonth}
                    userStartDateParsed={userStartDateParsed}
                    todaysDate={todaysDate}
                    formattedMonths={formattedMonths}
                  />
                )}
                {statsPeriod === "yearly" && (
                  <YearlyStats
                    fetchedSalahData={fetchedSalahData}
                    selectedYear={selectedYear}
                    onMonthSelect={handleMonthSelect}
                    statsToShow={statsToShow}
                    userGender={userPreferences.userGender}
                    userStartDateParsed={userStartDateParsed}
                    todaysDate={todaysDate}
                  />
                )}
                <ReasonsCard
                  setReasonsToShow={setReasonsToShow}
                  setShowReasonsSheet={setShowReasonsSheet}
                  reasonCountsByStatus={reasonCountsByStatus}
                  statuses={reasonStatuses}
                  statsToShow={statsToShow}
                />
              </motion.section>
            </AnimatePresence>
            <BottomSheetReasons
              // triggerId="open-reasons-sheet"
              setShowReasonsSheet={setShowReasonsSheet}
              showReasonsSheet={showReasonsSheet}
              reasonCountsByStatus={reasonCountsByStatus}
              status={reasonsToShow}
            />
          </section>
        </motion.section>
      </IonContent>
    </IonPage>
  );
};

export default StatsPage;
