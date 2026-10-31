import { clickedDateDataObj } from "../../types/types";
import { useEffect, useState } from "react";

import { SalahNamesType } from "../../types/types";
import {
  salahStatusColorsHexCodes,
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
} from "../../utils/constants";
import format from "date-fns/format";
import parse from "date-fns/parse";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { IonContent, IonModal } from "@ionic/react";
import { toggleDBConnection } from "../../utils/dbUtils";

interface BottomSheetSingleDateViewProps {
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  showDailySalahDataModal: boolean;
  setShowDailySalahDataModal: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedDate: React.Dispatch<React.SetStateAction<string>>;
  clickedDate: string;
  statsToShow: SalahNamesType | "All";
}

const BottomSheetSingleDateView = ({
  dbConnection,
  showDailySalahDataModal,
  setShowDailySalahDataModal,
  setClickedDate,
  clickedDate,
  statsToShow,
}: BottomSheetSingleDateViewProps) => {
  const [clickedDateData, setClickedDateData] = useState<clickedDateDataObj[]>(
    [],
  );

  const salahNamesOrder: SalahNamesType[] = [
    "Fajr",
    "Dhuhr",
    "Asar",
    "Maghrib",
    "Isha",
  ];

  const formatDateWithOrdinal = (clickedDate: string) => {
    const date = parse(clickedDate, "yyyy-MM-dd", new Date());
    const formattedDate = format(date, "EEEE, do MMMM yyyy");
    return formattedDate;
  };

  const grabSingleDateData = async (clickedDate: string) => {
    try {
      await toggleDBConnection(dbConnection, "open");
      const query = `SELECT * FROM salahDataTable WHERE date = ?`;
      const data = await dbConnection.current!.query(query, [clickedDate]);

      const sortedData: clickedDateDataObj[] = data.values!.sort(
        (a: clickedDateDataObj, b: clickedDateDataObj) =>
          salahNamesOrder.indexOf(a.salahName) -
          salahNamesOrder.indexOf(b.salahName),
      );

      const placeholderData: clickedDateDataObj[] = salahNamesOrder.map(
        (salah) => {
          const salahData = sortedData.find((obj) => {
            return obj.salahName === salah;
          });

          if (salahData) {
            return {
              id: null,
              date: clickedDate,
              salahName:
                salahData.salahName === "Asar" ? "Asr" : salahData.salahName,
              salahStatus: salahData.salahStatus,
              reasons: salahData.reasons,
              notes: salahData.notes,
            };
          } else {
            return {
              id: null,
              date: clickedDate,
              salahName: salah === "Asar" ? "Asr" : salah,
              salahStatus: "",
              reasons: "",
              notes: "",
            };
          }
        },
      );

      setClickedDateData(
        statsToShow === "All"
          ? placeholderData
          : placeholderData.filter((item) => item.salahName === statsToShow),
      );
    } catch (error) {
      console.error(error);
    } finally {
      await toggleDBConnection(dbConnection, "close");
    }
  };

  useEffect(() => {
    if (clickedDate) {
      grabSingleDateData(clickedDate);
    }
  }, [clickedDate]);

  return (
    <IonModal
      mode="ios"
      className="modal-height"
      isOpen={showDailySalahDataModal}
      onDidDismiss={() => {
        setShowDailySalahDataModal(false);
        setClickedDate("");
      }}
      initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      breakpoints={MODAL_BREAKPOINTS}
    >
      <IonContent className="[--background:var(--sheet-bg-color)]">
        <section className="px-5 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          <h1 className="mb-2 font-bold leading-tight">
            {clickedDate ? formatDateWithOrdinal(clickedDate) : null}
          </h1>

          {clickedDateData.map((item) => {
            return (
              <div
                key={item.date + item.salahName}
                className="border-b border-[var(--sheet-divider-color)] py-3 last:border-b-0"
              >
                <div className="grid grid-cols-2 items-center">
                  <p className="text-[1.0625rem] font-semibold">
                    {item.salahName === "Asar" ? "Asr" : item.salahName}
                  </p>
                  <div className="flex min-h-9 gap-3">
                    <span
                      style={{
                        backgroundColor:
                          salahStatusColorsHexCodes[item.salahStatus],
                      }}
                      className="w-1.5 shrink-0 rounded-full"
                    />
                    <div className="min-w-0 self-center">
                      <p className="capitalize-first-letter text-[1.0625rem] font-semibold">
                        {item.salahStatus === "group"
                          ? "In Jamaah"
                          : item.salahStatus === "male-alone"
                            ? "Alone"
                            : item.salahStatus === "female-alone"
                              ? "prayed"
                              : item.salahStatus || "No data"}
                      </p>
                      {item.reasons.length > 0 && (
                        <p className="text-[0.9375rem] text-[var(--secondary-text-color)]">
                          {item.reasons.split(",").length > 1
                            ? "Reasons: "
                            : "Reason: "}
                          {item.reasons
                            .split(", ")
                            .filter((reason) => reason.length > 0)
                            .sort()
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {item.notes.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--secondary-text-color)]">
                      Note
                    </p>
                    <p className="mt-1">{item.notes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </IonContent>
    </IonModal>
  );
};

export default BottomSheetSingleDateView;
