import "react-virtualized/styles.css";
import { Column, Table, AutoSizer } from "react-virtualized";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineChevronDoubleUp,
  HiChevronDoubleDown,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
} from "react-icons/hi2";

import {
  SalahNamesType,
  SalahByDateObjType,
  userPreferencesType,
} from "../../types/types";
import BottomSheetSalahStatus from "../BottomSheets/BottomSheetSalahStatus";
import BottomSheetMultiEditIntro from "../BottomSheets/BottomSheetMultiEditIntro";

import { LuDot } from "react-icons/lu";
import { TbEdit } from "react-icons/tb";
import { SalahRecordsArrayType } from "../../types/types";
import {
  salahStatusColorsHexCodes,
  salahNamesArr,
} from "../../utils/constants";
// import { TbEdit } from "react-icons/tb";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { useEffect, useRef, useState } from "react";
import { format, parse } from "date-fns";
import {
  salahTableIndividualSquareStyles,
  // updateUserPrefs,
} from "../../utils/helpers";
import { IonButton } from "@ionic/react";

interface SalahTableProps {
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  // setUserPreferences: React.Dispatch<React.SetStateAction<userPreferencesType>>;
  setShowMultiEditIntro: React.Dispatch<React.SetStateAction<boolean>>;
  showMultiEditIntro: boolean;
  setFetchedSalahData: React.Dispatch<
    React.SetStateAction<SalahRecordsArrayType>
  >;
  fetchedSalahData: SalahRecordsArrayType;
  userPreferences: userPreferencesType;
  setSelectedSalahAndDate: React.Dispatch<
    React.SetStateAction<SalahByDateObjType>
  >;
  selectedSalahAndDate: SalahByDateObjType;
  setIsMultiEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  isMultiEditMode: boolean;
  setShowUpdateStatusModal: React.Dispatch<React.SetStateAction<boolean>>;
  showUpdateStatusModal: boolean;
  generateStreaks: (fetchedSalahData: SalahRecordsArrayType) => void;
}

const SalahTable = ({
  dbConnection,
  // setUserPreferences,
  setShowMultiEditIntro,
  showMultiEditIntro,
  setFetchedSalahData,
  fetchedSalahData,
  userPreferences,
  setSelectedSalahAndDate,
  selectedSalahAndDate,
  setIsMultiEditMode,
  isMultiEditMode,
  setShowUpdateStatusModal,
  showUpdateStatusModal,
  generateStreaks,
}: SalahTableProps) => {
  const showBtnsRef = useRef<number | null>(null);
  const currentIndexRef = useRef(0);
  const hasMountedRef = useRef(false);

  const resetSelectedSalahAndDate = () => {
    setSelectedSalahAndDate({});
  };
  const [showBoxAnimation, setShowBoxAnimation] = useState(false);
  const clonedSelectedSalahAndDate = useRef<SalahByDateObjType>({});
  const [showSingleCellHint, setShowSingleCellHint] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const tableRef = useRef<Table | null>(null);

  useEffect(() => {
    if (Object.keys(selectedSalahAndDate).length > 0) {
      clonedSelectedSalahAndDate.current = { ...selectedSalahAndDate };
    }
  }, [selectedSalahAndDate]);

  useEffect(() => {
    return () => {
      if (showBtnsRef.current) {
        clearTimeout(showBtnsRef.current);
      }
    };
  }, []);

  const hideButtons = (timeout: number) => {
    if (showBtnsRef.current) {
      clearTimeout(showBtnsRef.current);
    }

    setIsScrolling(true);

    showBtnsRef.current = window.setTimeout(() => {
      setIsScrolling(false);
    }, timeout);
    // }, 10000000000);
  };

  const handleTableCellClick = (
    salahName: SalahNamesType,
    rowDataDate: string,
  ) => {
    setSelectedSalahAndDate((prev) => {
      let newArr = { ...prev };

      if (prev[rowDataDate]?.includes(salahName)) {
        newArr[rowDataDate] = prev[rowDataDate].filter(
          (item) => item !== salahName,
        );

        if (newArr[rowDataDate].length === 0) {
          delete newArr[rowDataDate];
        }
      } else {
        newArr[rowDataDate] = prev[rowDataDate]
          ? [...prev[rowDataDate], salahName]
          : [salahName];
      }
      return newArr;
    });

    if (!isMultiEditMode) {
      setShowUpdateStatusModal(true);
    }
  };

  return (
    <section className="salah-table-wrap hide-scrollbar">
      <div className="relative h-[95%]">
        <AutoSizer>
          {({ height, width }) => (
            <Table
              ref={tableRef}
              onScroll={() => {
                if (!hasMountedRef.current) {
                  hasMountedRef.current = true;
                  return;
                }

                hideButtons(2000);
                // if (showBtnsRef.current) {
                //   clearTimeout(showBtnsRef.current);
                // }

                // setIsScrolling(true);

                // showBtnsRef.current = window.setTimeout(() => {
                //   setIsScrolling(false);
                // }, 1000);
              }}
              // scrollToAlignment="center"
              onRowsRendered={({ startIndex }) => {
                currentIndexRef.current = startIndex;
                // <setScrollIndex>(startIndex);
                // console.log("ROW RENDERED");
                // console.log("startIndex: ", startIndex);
                // console.log("currentIndex: ", currentIndexRef.current);
              }}
              style={{
                textTransform: "none",
                fontSize: "3rem",
              }}
              className="text-center"
              rowCount={fetchedSalahData.length}
              rowGetter={({ index }) => fetchedSalahData[index]}
              rowHeight={72}
              headerHeight={40}
              height={height}
              width={width}
              scrollToAlignment="start"
            >
              <Column
                style={{ marginLeft: "0" }}
                // className="items-center text-left"
                className="text-left"
                label=""
                dataKey="date"
                headerRenderer={() => (
                  <IonButton
                    fill="clear"
                    size="large"
                    className={`size-8 min-h-0 [--background:var(--table-pencil-bg-color)] [--border-radius:9999px] [--padding-end:0] [--padding-start:0] ${isMultiEditMode ? "invisible" : ""}`}
                    onClick={() => {
                      if (isMultiEditMode) return;
                      setIsMultiEditMode(true);
                    }}
                    // className={`flex items-center justify-center`}
                  >
                    {/* <IonIcon
                      className={`multi-edit-icon text-[var(--ion-text-color)] ${
                        showMultiEditIntro && multiEditIconAnimation
                          ? "animate-bounce"
                          : ""
                      }`}
                      size="small"
                      icon={createOutline}
                    /> */}

                    <TbEdit className="text-[var(--ion-text-color)] text-lg" />
                  </IonButton>
                )}
                cellRenderer={({ rowData }) => {
                  const parsedDate = parse(
                    rowData.date,
                    "yyyy-MM-dd",
                    new Date(),
                  );

                  return (
                    <section className="">
                      <p className="text-[0.9375rem] font-semibold leading-tight">
                        {format(parsedDate, "EEE")}
                      </p>
                      <p className="text-[0.8125rem] leading-tight text-[var(--secondary-text-color)]">
                        {format(parsedDate, "d MMM ’yy")}
                      </p>
                    </section>
                  );
                }}
                width={180}
                flexGrow={1}
              />
              {salahNamesArr.map((salahName) => (
                <Column
                  key={salahName}
                  style={{ marginLeft: "0" }}
                  className="items-center text-sm"
                  label={salahName === "Asar" ? "Asr" : salahName}
                  dataKey={""}
                  width={120}
                  flexGrow={1}
                  cellRenderer={({ rowData }) => {
                    let isChecked = selectedSalahAndDate[
                      rowData.date
                    ]?.includes(salahName)
                      ? true
                      : false;
                    return (
                      <section
                        onClick={() => {
                          if (isMultiEditMode) return;
                          if (showSingleCellHint) {
                            setShowSingleCellHint(false);
                            setShowMultiEditIntro(false);
                          }
                          handleTableCellClick(salahName, rowData.date);
                        }}
                      >
                        {rowData.salahs[salahName] === "" ? (
                          <LuDot
                            style={{
                              color: "var(--table-dot-icon-color)",
                            }}
                            className={`${salahTableIndividualSquareStyles} fill-current [stroke-width:3] ${
                              showSingleCellHint &&
                              !isMultiEditMode &&
                              salahName === "Fajr"
                                ? "!rounded-full outline outline-2 outline-offset-[6px] outline-[var(--current-salah-color)]"
                                : ""
                            } 
                                `}
                            // ${
                            //   showMultiEditIntro && salahName === "Asar"
                            //     ? "animate-bounce"
                            //     : ""
                            // }
                          />
                        ) : (
                          <AnimatePresence>
                            <motion.div
                              // key={`${i}-${rowData.date}`}
                              {...(showBoxAnimation &&
                              clonedSelectedSalahAndDate.current[
                                rowData.date
                              ]?.includes(salahName)
                                ? {
                                    initial: { scale: 0 },
                                    // animate: { scale: [1.3, 1] },
                                    animate: { scale: [0, 1] },
                                    transition: {
                                      type: "spring",
                                      stiffness: 300,
                                      damping: 10,
                                      mass: 1,
                                      delay: 0.3,
                                    },
                                  }
                                : {})}
                              onAnimationComplete={() => {
                                setShowBoxAnimation(false);
                                clonedSelectedSalahAndDate.current = {};
                              }}
                              style={{
                                backgroundColor:
                                  salahStatusColorsHexCodes[
                                    rowData.salahs[
                                      salahName
                                    ] as keyof typeof salahStatusColorsHexCodes
                                  ],
                              }}
                              className={`${salahTableIndividualSquareStyles}`}
                            ></motion.div>
                          </AnimatePresence>
                        )}
                        <div
                          className={`absolute inset-0 transition-[opacity,visibility] duration-300 ${
                            isMultiEditMode ? "" : "invisible opacity-0"
                          }`}
                        >
                          <label className="absolute inset-0 before:absolute before:left-1/2 before:top-1/2 before:size-10 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-xl before:border before:border-[var(--multi-edit-tile-border-color)] before:bg-[var(--multi-edit-tile-color)] has-[:checked]:before:border-2 has-[:checked]:before:border-[var(--multi-edit-accent-color)]">
                            <input
                              type="checkbox"
                              className="absolute left-[calc(50%+1.1rem)] top-[calc(50%-1.1rem)] -translate-x-1/2 -translate-y-1/2 opacity-0 checked:!text-[var(--multi-edit-accent-color)] checked:opacity-100"
                              checked={isChecked}
                              onChange={() => {
                                handleTableCellClick(salahName, rowData.date);
                              }}
                            ></input>
                          </label>
                        </div>
                      </section>
                    );
                  }}
                />
              ))}
            </Table>
          )}
        </AutoSizer>
        {showSingleCellHint && !isMultiEditMode && (
          <div className="absolute inset-x-4 top-[7.5rem] z-10 flex items-start gap-3 rounded-[0.875rem] bg-[var(--sheet-group-bg)] px-3.5 py-3 text-sm leading-snug">
            <p className="flex-1">
              You can also update a Salah on its own by tapping its dot.
            </p>
            <button
              type="button"
              className="font-semibold text-[var(--current-salah-color)]"
              onClick={() => {
                setShowSingleCellHint(false);
                setShowMultiEditIntro(false);
              }}
            >
              Got it
            </button>
          </div>
        )}
      </div>
      {isScrolling && (
        <motion.div
          initial={{ x: "-50%", y: "100%", scale: 0.5, opacity: 0 }}
          animate={{ y: "-4vh", scale: 1, opacity: 1 }}
          exit={{ y: "100%", scale: 0.5, opacity: 0 }}
          className="shadow-md absolute left-1/2 bottom-0 -translate-x-1/2 flex bg-[var(--card-bg-color)] border rounded-2xl border-[var(--app-border-color)] py-2 px-4 gap-6"
        >
          <div className="">
            <button
              aria-label="Jump up 1 year"
              color={"medium"}
              className="flex flex-col items-center text-xs whitespace-nowrap"
              onClick={() => {
                hideButtons(2000);

                const next = Math.max(currentIndexRef.current - 365, 0);

                currentIndexRef.current = next;
                tableRef.current?.scrollToRow(next);
              }}
            >
              <HiOutlineChevronDoubleUp className="mb-1 text-lg " />1 Year
            </button>
          </div>
          <button
            aria-label="Jump up 30 days"
            color={"medium"}
            className="flex flex-col items-center text-xs whitespace-nowrap"
            onClick={() => {
              hideButtons(2000);
              const next = Math.max(currentIndexRef.current - 30, 0);

              currentIndexRef.current = next;
              tableRef.current?.scrollToRow(next);
            }}
          >
            <HiOutlineChevronUp className="mb-1 text-lg " />
            30 Days
          </button>
          <button
            aria-label="Jump down 30 days"
            color={"medium"}
            className="flex flex-col items-center text-xs whitespace-nowrap"
            onClick={() => {
              hideButtons(2000);
              const next = Math.min(
                currentIndexRef.current + 30,
                fetchedSalahData.length - 1,
              );

              currentIndexRef.current = next;
              tableRef.current?.scrollToRow(next);
            }}
          >
            {" "}
            <HiOutlineChevronDown className="mb-1 text-lg " />
            30 Days
          </button>
          <button
            color={"medium"}
            aria-label="Jump down 1 year"
            className="flex flex-col items-center text-xs whitespace-nowrap"
            onClick={() => {
              hideButtons(2000);
              const next = Math.min(
                currentIndexRef.current + 365,
                fetchedSalahData.length - 1,
              );

              currentIndexRef.current = next;
              tableRef.current?.scrollToRow(next);
            }}
          >
            <HiChevronDoubleDown className="mb-1 text-lg " />1 Year
          </button>
        </motion.div>
      )}
      <BottomSheetMultiEditIntro
        showMultiEditIntroSheet={showMultiEditIntro && !showSingleCellHint}
        setShowSingleCellHint={setShowSingleCellHint}
        setIsMultiEditMode={setIsMultiEditMode}
      />
      <BottomSheetSalahStatus
        setFetchedSalahData={setFetchedSalahData}
        fetchedSalahData={fetchedSalahData}
        userPreferences={userPreferences}
        setShowBoxAnimation={setShowBoxAnimation}
        selectedSalahAndDate={selectedSalahAndDate}
        resetSelectedSalahAndDate={resetSelectedSalahAndDate}
        setIsMultiEditMode={setIsMultiEditMode}
        isMultiEditMode={isMultiEditMode}
        dbConnection={dbConnection}
        setShowUpdateStatusModal={setShowUpdateStatusModal}
        showUpdateStatusModal={showUpdateStatusModal}
        generateStreaks={generateStreaks}
      />
    </section>
  );
};

export default SalahTable;
