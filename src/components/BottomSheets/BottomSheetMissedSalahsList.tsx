import { FixedSizeList as List } from "react-window";

import {
  SalahByDateObjType,
  restructuredMissedSalahListProp,
  SalahNamesType,
  SalahRecordsArrayType,
} from "../../types/types";
import {
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
  salahStatusColorsHexCodes,
} from "../../utils/constants";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";

import { useEffect, useMemo, useState } from "react";
import {
  IonContent,
  IonIcon,
  IonLabel,
  IonModal,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import { toggleDBConnection } from "../../utils/dbUtils";
import { format, parse } from "date-fns";
import { LuCheck } from "react-icons/lu";
import { swapVerticalOutline } from "ionicons/icons";
import { AutoSizer } from "react-virtualized";

interface MissedSalahsListBottomSheetProps {
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  setFetchedSalahData: React.Dispatch<
    React.SetStateAction<SalahRecordsArrayType>
  >;

  setShowMissedSalahsSheet: React.Dispatch<React.SetStateAction<boolean>>;
  showMissedSalahsSheet: boolean;
  missedSalahList: SalahByDateObjType;
}

const MissedSalahsListBottomSheet = ({
  dbConnection,
  setFetchedSalahData,
  setShowMissedSalahsSheet,
  showMissedSalahsSheet,
  missedSalahList,
}: MissedSalahsListBottomSheetProps) => {
  const [isClickedItem, setIsClickedItem] = useState<string>();
  // const [showCompletedMsg, setShowCompletedMsg] = useState(false);
  const [salahToShow, setSalahToShow] = useState<
    Exclude<SalahNamesType, "Asar"> | "All"
  >("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("oldest");

  // TODO :Below useEffect was put in place to re-open the DB connection when app came back to the foreground after being put in the background however, while it re-opens the connection, something else is closing it, this will require further investigation
  // useEffect(() => {
  //   let appStateInMissedSalahListSheet: PluginListenerHandle;

  //   (async () => {
  //     appStateInMissedSalahListSheet = await App.addListener(
  //       "appStateChange",
  //       ({ isActive }) => {
  //         if (isActive) {
  //           (async () => {
  //             if (showMissedSalahsSheet && isActive) {

  //               await toggleDBConnection(dbConnection, "open");
  //             }
  //           })();
  //         }
  //       },
  //     );
  //   })();

  //   return () => {
  //     appStateInMissedSalahListSheet?.remove();
  //   };
  // }, [showMissedSalahsSheet]);

  useEffect(() => {
    if (!showMissedSalahsSheet) return;

    const openDBConnection = async () => {
      await toggleDBConnection(dbConnection, "open");
    };

    const closeDBConnection = async () => {
      await toggleDBConnection(dbConnection, "close");
    };

    openDBConnection();

    return () => {
      closeDBConnection();
    };
  }, [showMissedSalahsSheet]);

  const restructuredMissedSalahList = useMemo(() => {
    const list: restructuredMissedSalahListProp[] = [];

    const sortedArr = Object.fromEntries(
      Object.entries(missedSalahList).sort(([dateA], [dateB]) =>
        sortOrder === "newest"
          ? dateB.localeCompare(dateA)
          : dateA.localeCompare(dateB),
      ),
    );

    for (let date in sortedArr) {
      sortedArr[date].forEach((item) => {
        if (
          salahToShow === "All" ||
          item === salahToShow ||
          (salahToShow === "Asr" && item === "Asar")
        ) {
          list.push({ [date]: item });
        }
      });
    }

    return list;
  }, [salahToShow, missedSalahList, sortOrder]);

  const modifySalahStatusInDB = async (
    date: string,
    salahName: SalahNamesType,
  ) => {
    const query = `UPDATE salahDataTable SET salahStatus = ? WHERE date = ? AND salahName = ?`;
    const values = ["late", date, salahName];
    if (!dbConnection.current) {
      throw new Error("dbConnection.current does not exist");
    }
    await dbConnection.current.run(query, values);

    setTimeout(() => {
      setFetchedSalahData((prev) => {
        const copy = [...prev];
        for (let i = 0; i < prev.length; i++) {
          if (copy[i].date === date) {
            for (let salah in copy[i].salahs) {
              if (salah === salahName) {
                copy[i].salahs[salah] = "late";
              }
            }
          }
        }
        return copy;
      });
    }, 1000);
  };

  const Row = ({
    index,
    style,
    data,
  }: {
    index: number;
    style: React.CSSProperties;
    data: restructuredMissedSalahListProp[];
  }) => {
    // const item = restructuredMissedSalahList[index];
    const item = data[index];

    const date = Object.keys(item)[0];
    const salah = Object.values(item)[0];
    const key = `${date}-${salah}`;

    return (
      <div
        // key={key}
        // style={style}
        style={style}
        className="flex items-center gap-3 border-b border-[color:var(--sheet-divider-color)] text-[var(--ion-text-color)]"
      >
        <div
          style={{
            backgroundColor:
              isClickedItem === key
                ? salahStatusColorsHexCodes["late"]
                : salahStatusColorsHexCodes["missed"],
            transition: "background-color 250ms ease",
          }}
          className="h-9 w-1 shrink-0 rounded-full"
        />
        <div
          // style={{ borderBottom: "1px solid var(--app-border-color)" }}
          className="min-w-0 flex-1"
        >
          <p className="text-base font-medium leading-snug">
            {salah === "Asar" ? "Asr" : salah}
          </p>
          <p className="mt-0.5 text-[0.8125rem] text-[var(--secondary-text-color)]">
            {format(parse(date, "yyyy-MM-dd", new Date()), "EEE d MMM ’yy")}
          </p>
        </div>
        <button
          data-done={isClickedItem === key}
          style={
            {
              "--late-color": salahStatusColorsHexCodes["late"],
            } as React.CSSProperties
          }
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-[var(--missed-salah-sheet-btn-color)] pl-2.5 pr-3 text-[0.8125rem] font-semibold text-[var(--current-salah-color)] transition-colors duration-[250ms] data-[done=true]:bg-[var(--late-color)] data-[done=true]:text-[#111]"
          onClick={async () => {
            setIsClickedItem(key);
            // TODO: Below toggle has been put in place as DB connection was being closed if app went to the background then came back to the foreground, this toggle ensures DB connection is opened before DB operations take place, a better solution is needed in the future, could just open and close DB connection each time users clicks on 'mark as done' as opposed to opening/closing connection when sheet is opened/closed
            await toggleDBConnection(dbConnection, "open");
            await modifySalahStatusInDB(date, salah);
          }}
        >
          <LuCheck aria-hidden="true" className="text-sm" />
          {isClickedItem === key ? "Made up" : "Done"}
        </button>
      </div>
    );
  };

  return (
    <IonModal
      mode="ios"
      className="modal-height"
      isOpen={showMissedSalahsSheet}
      onWillPresent={() => {
        // setShowCompletedMsg(false);
      }}
      onDidDismiss={() => {
        setShowMissedSalahsSheet(false);
        // setShowCompletedMsg(false);
        setIsClickedItem("");
      }}
      initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      breakpoints={MODAL_BREAKPOINTS}
    >
      <IonContent
        scrollY={false}
        className="relative [--background:var(--sheet-bg-color)]"
      >
        <section className="flex h-full flex-col px-5 pt-8 pb-[env(safe-area-inset-bottom)]">
          <h1 className="mb-1 mt-0 font-bold leading-tight">Missed Salah</h1>
          {!(
            restructuredMissedSalahList.length === 0 && salahToShow === "All"
          ) && (
            <>
              <p
                className={`text-[0.9375rem] text-[var(--secondary-text-color)]
              `}
                //  ${showCompletedMsg ? "invisible" : "visible"}
              >
                <span className="font-semibold text-[var(--ion-text-color)]">
                  {restructuredMissedSalahList.length}
                </span>{" "}
                {salahToShow !== "All" ? `${salahToShow} ` : ""}Salah to make up
              </p>

              <IonSegment
                mode="ios"
                className="stats-period-segment mt-5"
                value={salahToShow}
                onIonChange={(e) => {
                  const value =
                    e.detail.value === "Asar" ? "Asr" : e.detail.value;
                  setSalahToShow(
                    value as Exclude<SalahNamesType, "Asar"> | "All",
                  );
                }}
              >
                <IonSegmentButton
                  className="stats-period-segment-button"
                  value="All"
                >
                  <IonLabel>All</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton
                  className="stats-period-segment-button"
                  value="Fajr"
                >
                  <IonLabel>Fajr</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton
                  className="stats-period-segment-button"
                  value="Dhuhr"
                >
                  <IonLabel>Dhuhr</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton
                  className="stats-period-segment-button"
                  value="Asr"
                >
                  <IonLabel>Asr</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton
                  className="stats-period-segment-button"
                  value="Maghrib"
                >
                  <IonLabel>Maghrib</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton
                  className="stats-period-segment-button"
                  value="Isha"
                >
                  <IonLabel>Isha</IonLabel>
                </IonSegmentButton>
              </IonSegment>

              <section className="mb-1 mt-2 flex justify-end">
                <button
                  type="button"
                  className="flex h-8 items-center gap-1 text-[0.8125rem] font-medium text-[var(--current-salah-color)]"
                  onClick={() =>
                    setSortOrder((prev) =>
                      prev === "newest" ? "oldest" : "newest",
                    )
                  }
                >
                  <IonIcon
                    aria-hidden="true"
                    icon={swapVerticalOutline}
                    className="text-base"
                  />
                  {sortOrder === "newest" ? "Newest first" : "Oldest first"}
                </button>
              </section>
            </>
          )}

          {restructuredMissedSalahList.length > 0 ? (
            <div className="min-h-0 flex-1">
              <AutoSizer>
                {({ height, width }) => (
                  <List
                    className="ion-content-scroll-host"
                    height={height}
                    width={width}
                    itemData={restructuredMissedSalahList}
                    itemCount={restructuredMissedSalahList.length}
                    itemSize={68}
                  >
                    {Row}
                  </List>
                )}
              </AutoSizer>
            </div>
          ) : (
            <div className="mt-28 flex flex-col items-center text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-[var(--missed-salah-sheet-btn-color)] text-[var(--current-salah-color)]">
                <LuCheck aria-hidden="true" className="text-[1.875rem]" />
              </div>
              <p className="mt-4 text-xl font-semibold">All caught up</p>
              <p className="mt-1.5 text-[0.9375rem] text-[var(--secondary-text-color)]">
                No missed {salahToShow !== "All" ? `${salahToShow} ` : ""}Salah
                to make up.
              </p>
            </div>
          )}

          {/* {showCompletedMsg && (
            <motion.div
              className="text-center center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.3,
                // layout: { duration: 0.2 },
              }}
            >
              <h2 className="text-lg text-center text-[var(--ion-text-color)]">
                You're all caught up
              </h2>
              <IonButton
                onClick={() => {
                  setShowMissedSalahsSheet(false);
                }}
                className="w-3/4"
              >
                Close
              </IonButton>
            </motion.div>
          )} */}
        </section>
      </IonContent>
    </IonModal>
  );
};

export default MissedSalahsListBottomSheet;
