import { createLocalisedDate } from "../../utils/helpers";
import { streakDatesObjType } from "../../types/types";
import { format, isSameDay } from "date-fns";
import { GoInfo } from "react-icons/go";
import { HiOutlineChevronRight } from "react-icons/hi2";
import wreath from "../../assets/images/wreath.svg";
import { Dialog } from "@capacitor/dialog";
import BottomSheetStreaksHistory from "../BottomSheets/BottomSheetStreaksHistory";
import { useState } from "react";

interface StreakCounterProps {
  streakDatesObjectsArr: streakDatesObjType[];
  activeStreakCount: number;
  userGender: string;
}

const StreakCounter = ({
  streakDatesObjectsArr,
  activeStreakCount,
  userGender,
}: StreakCounterProps) => {
  const [showStreakHistorySheet, setShowStreakHistorySheet] = useState(false);
  const activeStreakObj = streakDatesObjectsArr.filter(
    (obj) => obj.isActive === true,
  )[0];

  const showStreakInfo = async () => {
    await Dialog.alert({
      title: "Streaks Explained",
      message:
        userGender === "male"
          ? `Streaks represent the number of consecutive days you've completed all your Salah, starting from the first day of full completion.

          - Streaks continue if you pray in a group or alone.
          - If you miss a Salah or are late, your streak resets.`
          : `Streaks represent the number of consecutive days you've completed all your Salah, starting from the first day of full completion.
          
          - Streaks continue as long as you pray on time.
          - If you select "Excused", your streak will pause (it won't break, but it also won't increase).`,
    });
  };

  const hasStreakDays = streakDatesObjectsArr.some((obj) => obj.days > 0);

  const filteredStreakDatesObjectsArr = streakDatesObjectsArr.filter(
    (obj) => obj.startDate.getTime() !== obj.endDate.getTime(),
  );

  return (
    <>
      <div className="p-4 mb-5 bg-[var(--card-bg-color)] rounded-2xl">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <button
              type="button"
              aria-label="Current streak explained"
              onClick={showStreakInfo}
              className="flex items-center gap-2 min-h-11 -mt-2 text-sm font-semibold text-[var(--ion-text-color)]"
            >
              Current streak
              <GoInfo aria-hidden="true" className="w-4 h-4 shrink-0" />
            </button>
            <p className="flex flex-wrap items-baseline gap-x-2 text-[var(--ion-text-color)]">
              <span className="text-[2.75rem] leading-none font-bold">
                {activeStreakCount}
              </span>
              <span className="text-xl opacity-80">
                {activeStreakCount !== 1 ? "days" : "day"}
              </span>
            </p>
          </div>
          <span
            aria-hidden="true"
            className="block w-14 h-12 shrink-0 bg-[var(--wreath-color)]"
            style={{
              mask: `url("${wreath}") center / contain no-repeat`,
              WebkitMask: `url("${wreath}") center / contain no-repeat`,
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 text-xs text-[var(--stats-control-text-color)]">
            {activeStreakObj && activeStreakObj.days > 0 && (
              <p className="">
                {`${
                  createLocalisedDate(
                    format(activeStreakObj.startDate, "yyyy-MM-dd"),
                  )[1]
                } ${
                  !isSameDay(activeStreakObj.startDate, activeStreakObj.endDate)
                    ? `- ${
                        createLocalisedDate(
                          format(activeStreakObj.endDate, "yyyy-MM-dd"),
                        )[1]
                      }`
                    : ""
                }`}
              </p>
            )}
          </div>
          {hasStreakDays && filteredStreakDatesObjectsArr.length > 0 && (
            <button
              type="button"
              aria-label="Show streak history"
              onClick={() => {
                setShowStreakHistorySheet(true);
              }}
              className="flex items-center gap-1 min-h-11 -my-3.5 text-sm text-blue-500 shrink-0"
            >
              History
              <HiOutlineChevronRight aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <BottomSheetStreaksHistory
        setShowStreakHistorySheet={setShowStreakHistorySheet}
        showStreakHistorySheet={showStreakHistorySheet}
        filteredStreakDatesObjectsArr={filteredStreakDatesObjectsArr}
      />
    </>
  );
};

export default StreakCounter;
