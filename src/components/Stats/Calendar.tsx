import { useState, useRef } from "react";
import { salahStatusColorsHexCodes } from "../../utils/constants";

import {
  format,
  parse,
  startOfMonth,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  startOfWeek,
} from "date-fns";

import {
  SalahRecordsArrayType,
  SalahNamesType,
  SalahsType,
  SalahStatusType,
} from "../../types/types";

import BottomSheetSingleDateView from "../BottomSheets/BottomSheetSingleDateView";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";

interface CalenderProps {
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  fetchedSalahData: SalahRecordsArrayType;
  statsToShow: SalahNamesType | "All";
  setClickedDate: React.Dispatch<React.SetStateAction<string>>;
  clickedDate: string;
  currentMonth: number;
  userStartDateParsed: Date;
  todaysDate: Date;
  formattedMonths: string[];
}

const Calendar = ({
  dbConnection,
  fetchedSalahData,
  statsToShow,
  setClickedDate,
  clickedDate,
  currentMonth,
  userStartDateParsed,
  todaysDate,
  formattedMonths,
}: CalenderProps) => {
  const calenderSingleMonthHeightRef = useRef<HTMLDivElement>(null);
  const [showDailySalahDataModal, setShowDailySalahDataModal] = useState(false);

  const isDayInSpecificMonth = (dayToCheck: Date, currentMonth: string) => {
    const parsedCurrentMonth = parse(currentMonth, "MMMM yyyy", new Date());
    const dayMonth = startOfMonth(dayToCheck);
    return (
      dayMonth.getMonth() === parsedCurrentMonth.getMonth() &&
      dayMonth.getFullYear() === parsedCurrentMonth.getFullYear()
    );
  };

  let firstDayOfMonth;
  const monthlyDates = (month: string) => {
    firstDayOfMonth = parse(month, "MMMM yyyy", new Date());

    const daysInMonth = eachDayOfInterval({
      start: startOfWeek(firstDayOfMonth, { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(firstDayOfMonth), { weekStartsOn: 1 }), // Once we have the first day of the month, endOfMonth calculates the last day of the month, then, endOfWeek is used to find the end of the week for that particular date
    }); // The result here is an array of objects, object at 0 position is Sun Dec 31 2023 00:00:00 GMT+0000 (Greenwich Mean Time), array ends at index 34, which is Sat Feb 03 2024 00:00:00 GMT+0000 (Greenwich Mean Time)
    return daysInMonth;
  };

  function determineRadialColors(date: Date) {
    const colors = {
      fajrColor: "transparent",
      dhuhrColor: "transparent",
      asarColor: "transparent",
      maghribColor: "transparent",
      ishaColor: "transparent",
      individualRadialColor: "transparent",
    };

    if (date < userStartDateParsed || date > todaysDate) {
      return colors;
    }

    const formattedDate = format(date, "yyyy-MM-dd");

    for (const key in fetchedSalahData) {
      // console.log("KEY: ", fetchedSalahData[key].salahs);
      if (fetchedSalahData[key].date === formattedDate) {
        const matchedData = fetchedSalahData[key].salahs;

        for (const [salah, salahStatus] of Object.entries(matchedData) as [
          keyof SalahsType,
          SalahStatusType,
        ][]) {
          if (statsToShow === "All") {
            if (salah === "Fajr") {
              colors.fajrColor = salahStatusColorsHexCodes[salahStatus];
            } else if (salah === "Dhuhr") {
              colors.dhuhrColor = salahStatusColorsHexCodes[salahStatus];
            } else if (salah === "Asar") {
              colors.asarColor = salahStatusColorsHexCodes[salahStatus];
            } else if (salah === "Maghrib") {
              colors.maghribColor = salahStatusColorsHexCodes[salahStatus];
            } else if (salah === "Isha") {
              colors.ishaColor = salahStatusColorsHexCodes[salahStatus];
            }
          } else {
            if (statsToShow === "Fajr" && salah === "Fajr") {
              colors.individualRadialColor =
                salahStatusColorsHexCodes[salahStatus];
            } else if (statsToShow === "Dhuhr" && salah === "Dhuhr") {
              colors.individualRadialColor =
                salahStatusColorsHexCodes[salahStatus];
            } else if (statsToShow === "Asr" && salah === "Asar") {
              colors.individualRadialColor =
                salahStatusColorsHexCodes[salahStatus];
            } else if (statsToShow === "Maghrib" && salah === "Maghrib") {
              colors.individualRadialColor =
                salahStatusColorsHexCodes[salahStatus];
            } else if (statsToShow === "Isha" && salah === "Isha") {
              colors.individualRadialColor =
                salahStatusColorsHexCodes[salahStatus];
            }
          }
        }
      }
    }
    return colors;
  }

  return (
    <>
      {/* <motion.div
        layout
        transition={{ layout: { duration: 0.5, ease: "easeInOut" } }}
      > */}
      <section
        // transition={{ layout: { duration: 0.5, ease: "easeInOut" } }}
        style={{ height: "auto" }}
        className={`bg-[var(--card-bg-color)] mt-5 py-5 calendar-single-month-wrap whitespace-nowrap box-shadow: 0 25px 50px -12px rgb(31, 35, 36) rounded-2xl`}
      >
        <div
          ref={calenderSingleMonthHeightRef}
          className={`month-name-days-dates-wrap`}
        >
          {/* <section className="flex items-center justify-between p-4">
            <p className="font-semibold text-center">
              {formattedMonths[currentMonth]}
            </p>
          </section> */}
          <div className="grid grid-cols-7 px-2 mb-3 place-items-center days-row-wrap">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
              <div
                key={`${day}-${i}`}
                className="w-5 h-5 text-sm font-semibold text-center individual-day"
              >
                {day}
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-7 px-2 gap-y-5 place-items-center month-dates-wrap">
          {monthlyDates(formattedMonths[currentMonth]).map((date, i) => {
            if (isDayInSpecificMonth(date, formattedMonths[currentMonth])) {
              const {
                fajrColor,
                dhuhrColor,
                asarColor,
                maghribColor,
                ishaColor,
                individualRadialColor,
              } = determineRadialColors(date);

              return (
                <div
                  key={format(date, "yyyy-MM-dd") + i}
                  onClick={() => {
                    // if (date <= todaysDate) {
                    if (date >= userStartDateParsed && date <= todaysDate) {
                      const formattedDate = format(date, "yyyy-MM-dd");
                      setClickedDate(formattedDate);
                      setShowDailySalahDataModal(true);
                    }
                  }}
                  className="relative flex items-center justify-center individual-date"
                >
                  {statsToShow === "All" ? (
                    <svg
                      className="absolute"
                      xmlns="http://www.w3.org/2000/svg"
                      id="svg"
                      viewBox="0 0 150 150"
                      style={{ height: "35px", width: "35px" }}
                    >
                      <defs />
                      <path
                        d="M 86.1150408904588 8.928403485284022 A 67 67 0 0 1 134.40308587902058 44.011721763710284"
                        style={{
                          strokeWidth: "11px",
                          strokeLinecap: "round",
                        }}
                        fill="none"
                        stroke={dhuhrColor}
                      />
                      <path
                        d="M 141.272558935669 65.15378589922615 A 67 67 0 0 1 122.82816700032245 121.91978731185029"
                        style={{
                          strokeWidth: "11px",
                          strokeLinecap: "round",
                        }}
                        fill="none"
                        stroke={asarColor}
                      />
                      <path
                        d="M 104.84365305321519 134.98630153992926 A 67 67 0 0 1 45.15634694678482 134.98630153992926"
                        style={{
                          strokeWidth: "11px",
                          strokeLinecap: "round",
                        }}
                        fill="none"
                        stroke={maghribColor}
                      />
                      <path
                        d="M 27.171832999677548 121.91978731185029 A 67 67 0 0 1 8.72744106433099 65.15378589922618"
                        style={{
                          strokeWidth: "11px",
                          strokeLinecap: "round",
                        }}
                        fill="none"
                        stroke={ishaColor}
                      />
                      <path
                        d="M 15.596914120979442 44.01172176371027 A 67 67 0 0 1 63.884959109541164 8.928403485284022"
                        style={{
                          strokeWidth: "11px",
                          strokeLinecap: "round",
                        }}
                        fill="none"
                        stroke={fajrColor}
                      />
                    </svg>
                  ) : (
                    <svg
                      className="absolute"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 150 150"
                      style={{ height: "35px", width: "35px" }}
                    >
                      <circle
                        cx="75"
                        cy="75"
                        r="67"
                        fill="none"
                        stroke={individualRadialColor}
                        strokeWidth="11px"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}

                  <p
                    className={`text-sm cursor-pointer flex items-center justify-center font-semibold h-6 w-6 hover:text-white
  `}
                  >
                    {format(date, "d")}
                  </p>
                </div>
              );
            } else {
              return <div key={format(date, "yyyy-MM-dd") + i}></div>;
            }
          })}
        </div>
      </section>
      {/* </motion.div> */}
      <BottomSheetSingleDateView
        dbConnection={dbConnection}
        setShowDailySalahDataModal={setShowDailySalahDataModal}
        setClickedDate={setClickedDate}
        showDailySalahDataModal={showDailySalahDataModal}
        clickedDate={clickedDate}
        statsToShow={statsToShow}
      />
    </>
  );
};

export default Calendar;
