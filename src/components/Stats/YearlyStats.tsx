import {
  differenceInCalendarDays,
  endOfMonth,
  getMonth,
  getYear,
  isAfter,
  isBefore,
  isSameMonth,
  parseISO,
} from "date-fns";
import {
  BestMonthStatsType,
  MonthlySalahStatsType,
  SalahNamesType,
  SalahRecordsArrayType,
  SalahStatusType,
} from "../../types/types";
import { salahStatusColorsHexCodes } from "../../utils/constants";
import BestMonthCard from "./BestMonthCard";

interface YearlyStatsPropsType {
  fetchedSalahData: SalahRecordsArrayType;
  selectedYear: number;
  onMonthSelect: (month: Date) => void;
  statsToShow: Exclude<SalahNamesType, "Asar"> | "All";
  userGender: string;
  userStartDateParsed: Date;
  todaysDate: Date;
}

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const minimumLoggingCoverage = 0.7;

const statusDisplayDetails = {
  group: { label: "Jamaah" },
  "male-alone": { label: "Alone" },
  "female-alone": { label: "Prayed" },
  late: { label: "Late" },
  missed: { label: "Missed" },
  excused: { label: "Excused" },
};

const YearlyStats = ({
  fetchedSalahData,
  selectedYear,
  onMonthSelect,
  statsToShow,
  userGender,
  userStartDateParsed,
  todaysDate,
}: YearlyStatsPropsType) => {
  const salahName = statsToShow === "Asr" ? "Asar" : statsToShow;
  const relevantStatuses: Exclude<SalahStatusType, "">[] =
    userGender === "male"
      ? ["group", "male-alone", "late", "missed"]
      : ["female-alone", "excused", "late", "missed"];

  const salahStatsByMonth: MonthlySalahStatsType[] = months.map((month) => ({
    month,
    totalStatusCount: 0,
    statusCounts: {
      group: 0,
      "male-alone": 0,
      "female-alone": 0,
      late: 0,
      missed: 0,
      excused: 0,
    },
    statusPercentages: {
      group: 0,
      "male-alone": 0,
      "female-alone": 0,
      late: 0,
      missed: 0,
      excused: 0,
    },
  }));

  fetchedSalahData.forEach((item) => {
    const itemDate = parseISO(item.date);

    if (getYear(itemDate) !== selectedYear) {
      return;
    }

    const statuses =
      salahName === "All"
        ? [
            item.salahs.Fajr,
            item.salahs.Dhuhr,
            item.salahs.Asar,
            item.salahs.Maghrib,
            item.salahs.Isha,
          ]
        : [item.salahs[salahName]];

    const monthIndex = getMonth(itemDate);

    statuses.forEach((status) => {
      if (status !== "") {
        salahStatsByMonth[monthIndex].statusCounts[status] += 1;
      }
    });
  });

  salahStatsByMonth.forEach((item) => {
    relevantStatuses.forEach((status) => {
      item.totalStatusCount += item.statusCounts[status];
    });

    if (item.totalStatusCount === 0) {
      return;
    }

    relevantStatuses.forEach((status) => {
      item.statusPercentages[status] =
        (item.statusCounts[status] / item.totalStatusCount) * 100;
    });
  });

  const isMonthUnavailable = (monthStart: Date) =>
    isBefore(endOfMonth(monthStart), userStartDateParsed) ||
    isAfter(monthStart, todaysDate);

  const getMonthPerformance = (monthData: MonthlySalahStatsType) => {
    const relevantStatusCount =
      userGender === "male"
        ? monthData.totalStatusCount
        : monthData.statusCounts["female-alone"] +
          monthData.statusCounts.late +
          monthData.statusCounts.missed;

    if (relevantStatusCount === 0) {
      return null;
    }

    const successfulStatusCount =
      userGender === "male"
        ? monthData.statusCounts.group
        : monthData.statusCounts["female-alone"];

    return {
      percentage: (successfulStatusCount / relevantStatusCount) * 100,
      relevantStatusCount,
    };
  };

  let bestMonth: BestMonthStatsType | null = null;

  salahStatsByMonth.forEach((monthData, i) => {
    const monthStart = new Date(selectedYear, i, 1);
    const monthPerformance = getMonthPerformance(monthData);

    if (
      monthPerformance === null ||
      isMonthUnavailable(monthStart) ||
      isSameMonth(monthStart, todaysDate)
    ) {
      return;
    }

    const firstEligibleDate = isSameMonth(monthStart, userStartDateParsed)
      ? userStartDateParsed
      : monthStart;
    const eligibleDayCount =
      differenceInCalendarDays(endOfMonth(monthStart), firstEligibleDate) + 1;
    const possibleSalahEntries =
      eligibleDayCount * (salahName === "All" ? 5 : 1);
    const loggingCoverage =
      monthData.totalStatusCount / possibleSalahEntries;

    if (loggingCoverage < minimumLoggingCoverage) {
      return;
    }

    if (
      bestMonth === null ||
      monthPerformance.percentage > bestMonth.percentage ||
      (monthPerformance.percentage === bestMonth.percentage &&
        monthPerformance.relevantStatusCount > bestMonth.relevantStatusCount)
    ) {
      bestMonth = {
        monthIndex: i,
        percentage: monthPerformance.percentage,
        relevantStatusCount: monthPerformance.relevantStatusCount,
      };
    }
  });

  return (
    <section
      aria-label={`${selectedYear} ${statsToShow} monthly statistics`}
      className="mt-5"
    >
      {bestMonth && (
        <BestMonthCard
          bestMonth={bestMonth}
          selectedYear={selectedYear}
          userGender={userGender}
        />
      )}

      {/* <div className="grid grid-cols-4 gap-2 px-3 py-3 mb-4 text-[10px] bg-[var(--card-bg-color)] rounded-xl">
        {relevantStatuses.map((status) => (
          <div key={status} className="flex items-center gap-1 whitespace-nowrap">
            <span
              aria-hidden="true"
              className="w-2.5 h-2.5 rounded-[0.15rem] shrink-0"
              style={{ backgroundColor: salahStatusColorsHexCodes[status] }}
            />
            <span>{statusDisplayDetails[status].label}</span>
          </div>
        ))}
      </div> */}

      <div className="grid grid-cols-3 gap-3">
        {salahStatsByMonth.map((monthData, i) => {
          const monthStart = new Date(selectedYear, i, 1);
          const isUnavailable = isMonthUnavailable(monthStart);

          return (
            <button
              key={monthData.month}
              type="button"
              aria-label={`View ${monthData.month} ${selectedYear} calendar`}
              disabled={isUnavailable}
              onClick={() => onMonthSelect(monthStart)}
              className={`p-3 text-left bg-[var(--card-bg-color)] rounded-xl ${isUnavailable ? "opacity-30" : ""}`}
            >
              <span className="block text-sm font-semibold">
                {monthData.month}
              </span>

              <span className="flex h-2 my-3 overflow-hidden rounded-full bg-[var(--app-border-color)]">
                {relevantStatuses.map((status) => (
                  <span
                    key={status}
                    aria-hidden="true"
                    style={{
                      width: `${monthData.statusPercentages[status]}%`,
                      backgroundColor: salahStatusColorsHexCodes[status],
                    }}
                  />
                ))}
              </span>

              <span className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                {relevantStatuses.map((status) => (
                  <span
                    key={status}
                    className="flex items-center gap-1 font-semibold whitespace-nowrap"
                  >
                    <span
                      aria-hidden="true"
                      className="w-2.5 h-2.5 rounded-[0.15rem] shrink-0"
                      style={{
                        backgroundColor: salahStatusColorsHexCodes[status],
                      }}
                    />
                    <span className="sr-only">
                      {statusDisplayDetails[status].label}:{" "}
                    </span>
                    <span>
                      {Math.round(monthData.statusPercentages[status])}%
                    </span>
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default YearlyStats;
