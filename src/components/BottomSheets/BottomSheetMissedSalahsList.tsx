import { FixedSizeList as List } from "react-window";

import {
  SalahByDateObjType,
  restructuredMissedSalahListProp,
  SalahNamesType,
  SalahRecordsArrayType,
} from "../../types/types";
import { salahStatusColorsHexCodes } from "../../utils/constants";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";

import { useEffect, useMemo, useState } from "react";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonModal,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { toggleDBConnection } from "../../utils/dbUtils";
import { createLocalisedDate } from "../../utils/helpers";
import { AutoSizer } from "react-virtualized";

import { swapVerticalOutline } from "ionicons/icons";

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
    }, 500);
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
        style={{
          ...style,
          height: (style.height as number) - 12,
          top: (style.top as number) + 6,
        }}
        className="bg-[var(--card-bg-color)] px-4 rounded-2xl"
      >
        <div className="flex items-center justify-between text-[var(--ion-text-color)] py-3 border-b border-[var(--app-border-color)]">
          <p>{salah === "Asar" ? "Asr" : salah}</p>
          <div
            style={{
              backgroundColor:
                isClickedItem === key
                  ? salahStatusColorsHexCodes["late"]
                  : salahStatusColorsHexCodes["missed"],
              transition: "background-color 250ms ease",
            }}
            className="w-[1.3rem] h-[1.3rem] rounded-md"
          />
        </div>
        <div
          // style={{ borderBottom: "1px solid var(--app-border-color)" }}
          className="flex items-center justify-between text-[var(--ion-text-color)] py-3"
        >
          <p className="text-sm opacity-80">{createLocalisedDate(date)[1]}</p>
          <button
            className="rounded-full bg-[var(--missed-salah-sheet-btn-color)]"
            onClick={async () => {
              setIsClickedItem(key);
              // TODO: Below toggle has been put in place as DB connection was being closed if app went to the background then came back to the foreground, this toggle ensures DB connection is opened before DB operations take place, a better solution is needed in the future, could just open and close DB connection each time users clicks on 'mark as done' as opposed to opening/closing connection when sheet is opened/closed
              await toggleDBConnection(dbConnection, "open");
              await modifySalahStatusInDB(date, salah);
            }}
          >
            <section className="flex items-center justify-between w-full px-3 py-2 text-sm">
              <p>Mark As Done</p>
            </section>
          </button>
        </div>
      </div>
    );
  };

  return (
    <IonModal
      mode="ios"
      // className="modal-height"
      isOpen={showMissedSalahsSheet}
      onWillPresent={() => {
        // setShowCompletedMsg(false);
      }}
      onDidDismiss={() => {
        setShowMissedSalahsSheet(false);
        // setShowCompletedMsg(false);
        setIsClickedItem("");
      }}
      // initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      // breakpoints={MODAL_BREAKPOINTS}
    >
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>Missed Salah</IonTitle>
          <IonButtons slot="end">
            <IonButton
              // strong={true}
              onClick={() => setShowMissedSalahsSheet(false)}
            >
              Close
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent scrollY={false} className="relative">
        <section className="mt-10 mb-10">
          <p
            className={`mx-2 my-4 text-center text-[var(--ion-text-color)] 
              `}
            //  ${showCompletedMsg ? "invisible" : "visible"}
          >
            You have{" "}
            <span className="text-[rgb(230,57,70)]">
              {restructuredMissedSalahList.length}{" "}
            </span>{" "}
            {salahToShow !== "All" ? salahToShow : ""} Salah to make up
          </p>

          <section className="px-4 mb-6">
            <IonSegment
              mode="ios"
              value={salahToShow}
              onIonChange={(e) => {
                const value =
                  e.detail.value === "Asar" ? "Asr" : e.detail.value;
                setSalahToShow(
                  value as Exclude<SalahNamesType, "Asar"> | "All",
                );
              }}
            >
              <IonSegmentButton value="All">
                <IonLabel>All</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="Fajr">
                <IonLabel>Fajr</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="Dhuhr">
                <IonLabel>Dhuhr</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="Asr">
                <IonLabel>Asr</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="Maghrib">
                <IonLabel>Maghrib</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="Isha">
                <IonLabel>Isha</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </section>

          <section className="mx-4 border border-[var(--app-border-color)] rounded-lg mb-4">
            <IonSelect
              className="w-full px-2 pl-2 text-sm sort-select"
              value={sortOrder}
              labelPlacement="stacked"
              aria-label="Sort missed salahs"
              interface="popover"
              placeholder="Sort missed salahs"
              onIonChange={(e) => setSortOrder(e.detail.value)}
            >
              <IonIcon
                className="mr-[5px]"
                slot="start"
                icon={swapVerticalOutline}
                aria-hidden="true"
              />
              <IonSelectOption value="newest">Newest first</IonSelectOption>
              <IonSelectOption value="oldest">Oldest first</IonSelectOption>
            </IonSelect>
          </section>

          <div className="px-4">
            <AutoSizer disableHeight>
              {({ width }) => (
                <List
                  height={800}
                  width={width}
                  itemData={restructuredMissedSalahList}
                  itemCount={restructuredMissedSalahList.length}
                  itemSize={125}
                >
                  {Row}
                </List>
              )}
            </AutoSizer>
          </div>

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
        </section>{" "}
      </IonContent>
    </IonModal>
  );
};

export default MissedSalahsListBottomSheet;
