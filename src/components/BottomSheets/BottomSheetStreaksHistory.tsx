import {
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
  salahStatusColorsHexCodes,
} from "../../utils/constants";
import {
  SalahRecordsArrayType,
  SalahStatusType,
  streakDatesObjType,
} from "../../types/types";
import { eachDayOfInterval, format } from "date-fns";
import { IonModal } from "@ionic/react";
import { useMemo } from "react";

interface BottomSheetStreaksHistoryProps {
  setShowStreakHistorySheet: React.Dispatch<React.SetStateAction<boolean>>;
  showStreakHistorySheet: boolean;
  filteredStreakDatesObjectsArr: streakDatesObjType[];
  fetchedSalahData: SalahRecordsArrayType;
  userGender: string;
}
const BottomSheetStreaksHistory = ({
  setShowStreakHistorySheet,
  showStreakHistorySheet,
  filteredStreakDatesObjectsArr,
  fetchedSalahData,
  userGender,
}: BottomSheetStreaksHistoryProps) => {
  const statusesToCount = useMemo<SalahStatusType[]>(
    () =>
      userGender === "male"
        ? ["group", "male-alone"]
        : ["female-alone", "excused"],
    [userGender],
  );

  const longestStreakDays = Math.max(
    ...filteredStreakDatesObjectsArr.map((streak) => streak.days),
  );

  const statusCountsByStreak = useMemo(() => {
    if (!showStreakHistorySheet) return [];

    const salahsByDate = new Map(
      fetchedSalahData.map((record) => [record.date, record.salahs]),
    );

    return filteredStreakDatesObjectsArr.map((streak) =>
      statusesToCount.map((status) =>
        eachDayOfInterval({
          start: streak.startDate,
          end: streak.endDate,
        }).reduce((total, day) => {
          const salahs = salahsByDate.get(format(day, "yyyy-MM-dd"));
          return (
            total +
            (salahs
              ? Object.values(salahs).filter((salah) => salah === status).length
              : 0)
          );
        }, 0),
      ),
    );
  }, [
    showStreakHistorySheet,
    filteredStreakDatesObjectsArr,
    fetchedSalahData,
    statusesToCount,
  ]);

  return (
    <IonModal
      mode="ios"
      className="modal-fit-content"
      isOpen={showStreakHistorySheet}
      onDidDismiss={() => {
        setShowStreakHistorySheet(false);
      }}
      initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      breakpoints={MODAL_BREAKPOINTS}
    >
      <section className="ion-content-scroll-host max-h-[var(--sheet-max-height)] overflow-y-auto px-5 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))] text-[var(--ion-text-color)]">
        <h1 className="mb-1 font-bold leading-tight">Streaks</h1>
        <p className="mb-4 text-[0.9375rem] leading-relaxed text-[var(--secondary-text-color)]">
          Longest streak:{" "}
          <span className="font-semibold text-[var(--ion-text-color)]">
            {longestStreakDays} {longestStreakDays !== 1 ? "days" : "day"}
          </span>
        </p>

        {/* {filteredStreakDatesObjectsArr.slice(1).map((item, i) => { */}
        <ul>
          {filteredStreakDatesObjectsArr.map((item, i) => {
            return (
              item.days > 0 && (
                <li
                  key={i}
                  className="border-t border-[color:var(--sheet-divider-color)] py-3.5 first:border-t-0"
                >
                  <section className="flex items-baseline justify-between gap-3">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.9375rem] font-medium">
                      {`${format(item.startDate, "d MMM ’yy")} – ${format(item.endDate, "d MMM ’yy")}`}
                      {item.isActive && (
                        <span className="rounded-full bg-[var(--tag-blue-bg)] px-2 py-px text-[11px] font-semibold text-[var(--current-salah-color)]">
                          Current
                        </span>
                      )}
                    </p>

                    <p className="whitespace-nowrap text-[0.9375rem] font-semibold">
                      {item.days}
                      <span className="ml-1 text-[0.8125rem] font-normal text-[var(--secondary-text-color)]">
                        {item.days !== 1 ? "days" : "day"}
                      </span>
                    </p>
                  </section>
                  <section className="mt-2 flex gap-4 text-[0.8125rem] font-medium text-[var(--secondary-text-color)]">
                    {statusesToCount.map((status, statusIndex) => (
                      <span key={status} className="flex items-center gap-1.5">
                        <span
                          aria-hidden="true"
                          style={{
                            backgroundColor: salahStatusColorsHexCodes[status],
                          }}
                          className="size-2.5 rounded-[3px]"
                        />
                        {statusCountsByStreak[i]?.[statusIndex]}
                      </span>
                    ))}
                  </section>
                </li>
              )
            );
          })}
        </ul>
      </section>
    </IonModal>
  );
};

export default BottomSheetStreaksHistory;
