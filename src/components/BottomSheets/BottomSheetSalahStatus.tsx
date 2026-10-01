import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GoPerson } from "react-icons/go";
import { GoPeople } from "react-icons/go";
import { GoSkip } from "react-icons/go";
import { GoClock } from "react-icons/go";
import { PiFlower } from "react-icons/pi";
import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { InAppReview } from "@capacitor-community/in-app-review";
import { Keyboard, KeyboardResize } from "@capacitor/keyboard";
import {
  SalahNamesType,
  SalahRecordsArrayType,
  SalahStatusType,
  SalahByDateObjType,
  userPreferencesType,
} from "../../types/types";

import {
  salahStatusColorsHexCodes,
  reasonsStyles,
  salahNamesArr,
  validSalahStatuses,
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
} from "../../utils/constants";

import { isToday, isYesterday, parse } from "date-fns";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { IonModal, IonTextarea } from "@ionic/react";
import { toggleDBConnection } from "../../utils/dbUtils";
import {
  createLocalisedDate,
  isValidDate,
  showConfirmMsg,
} from "../../utils/helpers";

interface SalahStatusBottomSheetProps {
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  setFetchedSalahData: React.Dispatch<
    React.SetStateAction<SalahRecordsArrayType>
  >;
  fetchedSalahData: SalahRecordsArrayType;
  userPreferences: userPreferencesType;
  setShowBoxAnimation: React.Dispatch<React.SetStateAction<boolean>>;
  showUpdateStatusModal: boolean;
  setShowUpdateStatusModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedSalahAndDate: SalahByDateObjType;
  resetSelectedSalahAndDate: () => void;
  setIsMultiEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  isMultiEditMode: boolean;
  generateStreaks: (fetchedSalahData: SalahRecordsArrayType) => void;
}

const BottomSheetSalahStatus = ({
  dbConnection,
  setFetchedSalahData,
  fetchedSalahData,
  selectedSalahAndDate,
  setShowBoxAnimation,
  resetSelectedSalahAndDate,
  setIsMultiEditMode,
  isMultiEditMode,
  userPreferences,
  showUpdateStatusModal,
  setShowUpdateStatusModal,
  generateStreaks,
}: SalahStatusBottomSheetProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const modalSheetSalahReasonsWrap = useRef<HTMLDivElement>(null);
  const modalSheetHiddenSalahReasonsWrap = useRef<HTMLDivElement>(null);
  const [salahStatus, setSalahStatus] = useState<SalahStatusType>("");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [reasonsHeight, setReasonsHeight] = useState(0);

  const [notes, setNotes] = useState("");
  const handleNotes = (e: CustomEvent<{ value: string }>) => {
    setNotes(e.detail.value);
  };

  const sheetWrapper = useRef<HTMLDivElement | null>(null);

  if (Capacitor.getPlatform() === "ios") {
    window.addEventListener("keyboardWillShow", (e) => {
      const app: HTMLElement | null = document.querySelector("ion-app");
      if (app) {
        app.style.marginBottom = (e as any).keyboardHeight + "px";
      }
    });
    window.addEventListener("keyboardWillHide", () => {
      const app: HTMLElement | null = document.querySelector("ion-app");

      if (app) {
        app.style.marginBottom = "0px";
      }
    });
  }

  const onSheetCloseCleanup = async () => {
    setShowUpdateStatusModal(false);
    resetSelectedSalahAndDate();
    setSalahStatus("");
    setSelectedReasons([]);
    setNotes("");

    if (isMultiEditMode) {
      setIsMultiEditMode(false);
    }
  };

  const doesSalahAndDateExists = async (): Promise<boolean> => {
    const selectedDate = Object.keys(selectedSalahAndDate).toString();
    const selectedSalah = Object.values(selectedSalahAndDate).toString();

    try {
      await toggleDBConnection(dbConnection, "open");

      const res = await dbConnection.current!.query(
        `SELECT * FROM salahDataTable 
      WHERE date = ? AND salahName = ?;`,
        [selectedDate, selectedSalah],
      );

      if (res && res.values && res.values.length === 0) {
        return false;
      } else if (res && res.values && res.values.length > 0) {
        setSalahStatus(res.values[0].salahStatus);
        setNotes(res.values[0].notes);

        if (res.values[0].reasons.length > 0) {
          setSelectedReasons(res.values[0].reasons.split(", "));
        }
        return true;
      }
    } catch (error) {
      console.error(error);
    } finally {
      await toggleDBConnection(dbConnection, "close");
    }

    return false;
  };

  const checkDBForSalah = async () => {
    if (isMultiEditMode) return;
    try {
      await doesSalahAndDateExists();
    } catch (error) {
      console.error(error);
    }
  };

  const addOrModifySalah = async () => {
    const salahDataToInsertIntoDB = [];

    try {
      await toggleDBConnection(dbConnection, "open");

      const reasonsToInsert =
        selectedReasons.length > 0 &&
        salahStatus !== "group" &&
        salahStatus !== "female-alone" &&
        salahStatus !== "excused"
          ? selectedReasons.join(", ")
          : "";

      for (let [date, salahArr] of Object.entries(selectedSalahAndDate)) {
        if (!isValidDate(date)) {
          console.error(
            `Date is not valid: ${date},  skipping this iteration...`,
          );
          continue;
        }

        if (
          !salahArr.every((salahName) =>
            salahNamesArr.includes(salahName as SalahNamesType),
          )
        ) {
          console.error(
            `Salah name is not valid: ${salahArr.join(
              ", ",
            )}, skipping this iteration......`,
          );
          continue;
        }

        if (!validSalahStatuses.includes(salahStatus)) {
          console.error(
            `salahStatus is not valid: ${salahStatus}, skipping this iteration...`,
          );
          continue;
        }

        for (let i = 0; i < salahArr.length; i++) {
          salahDataToInsertIntoDB.push([
            date,
            salahArr[i],
            salahStatus,
            reasonsToInsert,
            notes,
          ]);
        }
      }

      let query = `INSERT OR REPLACE INTO salahDataTable(date, salahName, salahStatus, reasons, notes`;

      const placeholder = salahDataToInsertIntoDB[0].map(() => "?").join(", ");
      const placeholders = salahDataToInsertIntoDB
        .map(() => `(${placeholder})`)
        .join(",");

      query += `) VALUES ${placeholders}`;
      const flattenedSalahDBValues = salahDataToInsertIntoDB.flat();

      await dbConnection.current!.run(query, flattenedSalahDBValues);
      // TODO: Shouldn't be mutating here, this code works but needs improvement
      for (const obj of fetchedSalahData) {
        if (selectedSalahAndDate[obj.date]) {
          selectedSalahAndDate[obj.date].forEach((item) => {
            obj.salahs[item as SalahNamesType] = salahStatus as SalahStatusType;
          });
        }
      }

      setFetchedSalahData((prev) => [...prev]);

      const saveButtonTapCountQuery = await dbConnection.current!.query(
        `SELECT * FROM userPreferencesTable WHERE preferenceName = ?;`,
        ["saveButtonTapCount"],
      );

      const incrementedSaveButtonTapCount =
        Number(saveButtonTapCountQuery.values![0].preferenceValue) + 1;

      if (Capacitor.isNativePlatform()) {
        if (
          incrementedSaveButtonTapCount === 3 ||
          incrementedSaveButtonTapCount === 10 ||
          incrementedSaveButtonTapCount === 20 ||
          incrementedSaveButtonTapCount % 50 === 0
        ) {
          InAppReview.requestReview();
        }
      }

      await dbConnection.current!.run(
        `UPDATE userPreferencesTable SET preferenceValue = ? WHERE preferenceName = ?`,
        [incrementedSaveButtonTapCount.toString(), "saveButtonTapCount"],
      );

      generateStreaks(fetchedSalahData);
    } catch (error) {
      console.error(error);
    } finally {
      await toggleDBConnection(dbConnection, "close");
    }
  };

  if (Capacitor.getPlatform() === "ios") {
    Keyboard.setResizeMode({
      mode: KeyboardResize.None,
    });

    window.addEventListener("keyboardWillShow", (e) => {
      if (sheetRef.current) {
        let height = (e as any).keyboardHeight;
        sheetRef.current.style.setProperty(
          "margin-bottom",
          height + "px",
          "important",
        );
      }
    });
    window.addEventListener("keyboardWillHide", () => {
      if (sheetRef.current) {
        sheetRef.current.style.setProperty(
          "margin-bottom",
          "env(safe-area-inset-bottom)",
          // 0 + "px",
          "important",
        );
      }
    });
  }

  const determineDateRecency = (date: string) => {
    const parsedDate = parse(date, "yyyy-MM-dd", new Date());
    if (isToday(parsedDate)) {
      return "today";
    } else if (isYesterday(parsedDate)) {
      return "yesterday";
    } else {
      const [, formatDate] = createLocalisedDate(date);
      return `on ${formatDate}`;
    }
  };

  const reducedMotion = useReducedMotion();
  const salahStatusVariants = {
    default: { y: 0, transition: { duration: reducedMotion ? 0 : 0.2 } },
    animate: { y: -2, transition: { duration: reducedMotion ? 0 : 0.2 } },
  };

  // const statusBoxStyles =
  //   "h-full px-5 py-3 rounded-xl mx-auto text-center flex flex-col items-center justify-around w-full";
  const statusBoxStyles =
    "group relative flex min-h-[104px] flex-col items-start justify-center overflow-hidden rounded-xl border border-[color:var(--status-tile-border)] bg-[var(--status-tile-bg)] [background-image:linear-gradient(var(--status-color),var(--status-color))] [background-origin:border-box] [background-repeat:no-repeat] [background-size:5px_100%] px-4 py-3 text-left text-[var(--ion-text-color)] transition-[background-size] duration-500 data-[selected=true]:[background-size:100%_100%] data-[selected=true]:border-transparent data-[selected=true]:text-[color:var(--status-foreground)] motion-reduce:transition-none";

  useEffect(() => {
    if (
      modalSheetHiddenSalahReasonsWrap &&
      modalSheetHiddenSalahReasonsWrap.current
    ) {
      if (
        salahStatus === "male-alone" ||
        salahStatus === "late" ||
        salahStatus === "missed"
      ) {
        // setReasonsHeight(modalSheetHiddenSalahReasonsWrap.current.offsetHeight);
        const rawHeight = modalSheetHiddenSalahReasonsWrap.current.offsetHeight;
        const clampedHeight = Math.min(rawHeight, window.innerHeight * 0.35);
        setReasonsHeight(clampedHeight);
      } else {
        setReasonsHeight(0);
      }
    }
  }, [showUpdateStatusModal, salahStatus]);

  return (
    <section>
      <IonModal
        className="modal-fit-content"
        mode="ios"
        onWillPresent={() => {
          checkDBForSalah();
        }}
        onDidDismiss={() => {
          setShowUpdateStatusModal(false);
          onSheetCloseCleanup();
        }}
        isOpen={showUpdateStatusModal}
        initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
        breakpoints={MODAL_BREAKPOINTS}
      >
        {" "}
        <section
          ref={sheetWrapper}
          className="w-[90%] mx-auto mb-5 rounded-lg text-white pb-env-safe-area-inset-bottom transition-all duration-300 ease-in-out"
        >
          <h1 className="mb-2 text-left text-[1.375rem] font-bold leading-tight text-[var(--ion-text-color)]">
            How did you pray{" "}
            {Object.keys(selectedSalahAndDate).length === 1 &&
            Object.values(selectedSalahAndDate)[0].length === 1
              ? `${Object.values(selectedSalahAndDate)[0][0] === "Asar" ? "Asr" : Object.values(selectedSalahAndDate)[0][0]} ${determineDateRecency(
                  Object.keys(selectedSalahAndDate)[0],
                )}?`
              : `these Salah?`}
          </h1>
          <p className="mb-6 text-sm leading-normal text-[var(--ion-text-color)] opacity-60">
            Choose the status that matches your prayer.
          </p>

          <div className="grid items-stretch grid-cols-2 gap-2">
            {userPreferences.userGender === "male" ? (
              <motion.button
                type="button"
                variants={salahStatusVariants}
                initial="default"
                animate={salahStatus === "group" ? "animate" : "default"}
                aria-pressed={salahStatus === "group"}
                data-selected={salahStatus === "group"}
                onClick={() => {
                  setSalahStatus("group");
                }}
                style={
                  {
                    "--status-color": salahStatusColorsHexCodes.group,
                    "--status-foreground": "#111",
                    borderLeft: `5px solid ${salahStatusColorsHexCodes.group}`,
                  } as React.CSSProperties
                }
                className={statusBoxStyles}
              >
                <GoPeople
                  aria-hidden="true"
                  className="relative z-10 mb-1 text-[1.75rem] group-data-[selected=false]:text-[color:var(--status-color)]"
                />
                <span className="relative z-10 text-[0.9375rem] font-semibold leading-snug">
                  In Jamaah
                </span>
                <span className="relative z-10 mt-0.5 text-[0.8125rem] leading-snug group-data-[selected=false]:opacity-70">
                  In congregation
                </span>
              </motion.button>
            ) : (
              <motion.button
                type="button"
                variants={salahStatusVariants}
                initial="default"
                animate={salahStatus === "female-alone" ? "animate" : "default"}
                aria-pressed={salahStatus === "female-alone"}
                data-selected={salahStatus === "female-alone"}
                onClick={() => {
                  setSalahStatus("female-alone");
                }}
                style={
                  {
                    "--status-color":
                      salahStatusColorsHexCodes["female-alone"],
                    "--status-foreground": "#111",
                    borderLeft: `5px solid ${salahStatusColorsHexCodes["female-alone"]}`,
                  } as React.CSSProperties
                }
                className={statusBoxStyles}
              >
                <GoPerson
                  aria-hidden="true"
                  className="relative z-10 mb-1 text-[1.75rem] group-data-[selected=false]:text-[color:var(--status-color)]"
                />
                <span className="relative z-10 text-[0.9375rem] font-semibold leading-snug">
                  Prayed
                </span>
                <span className="relative z-10 mt-0.5 text-[0.8125rem] leading-snug group-data-[selected=false]:opacity-70">
                  Prayer completed
                </span>
              </motion.button>
            )}
            {userPreferences.userGender === "male" ? (
              <>
                <motion.button
                  type="button"
                  variants={salahStatusVariants}
                  initial="default"
                  animate={salahStatus === "male-alone" ? "animate" : "default"}
                  aria-pressed={salahStatus === "male-alone"}
                  data-selected={salahStatus === "male-alone"}
                  onClick={() => {
                    setSalahStatus("male-alone");
                  }}
                  style={
                    {
                      "--status-color":
                        salahStatusColorsHexCodes["male-alone"],
                      "--status-foreground": "#111",
                      borderLeft: `5px solid ${salahStatusColorsHexCodes["male-alone"]}`,
                    } as React.CSSProperties
                  }
                  className={statusBoxStyles}
                >
                  <GoPerson
                    aria-hidden="true"
                    className="relative z-10 mb-1 text-[1.75rem] group-data-[selected=false]:text-[color:var(--status-color)]"
                  />
                  <span className="relative z-10 text-[0.9375rem] font-semibold leading-snug">
                    On Time
                  </span>
                  <span className="relative z-10 mt-0.5 text-[0.8125rem] leading-snug group-data-[selected=false]:opacity-70">
                    Alone, on time
                  </span>
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  type="button"
                  variants={salahStatusVariants}
                  initial="default"
                  animate={salahStatus === "excused" ? "animate" : "default"}
                  aria-pressed={salahStatus === "excused"}
                  data-selected={salahStatus === "excused"}
                  onClick={() => {
                    setSalahStatus("excused");
                  }}
                  style={
                    {
                      "--status-color": salahStatusColorsHexCodes.excused,
                      "--status-foreground": "#fff",
                      borderLeft: `5px solid ${salahStatusColorsHexCodes.excused}`,
                    } as React.CSSProperties
                  }
                  className={statusBoxStyles}
                >
                  <PiFlower
                    aria-hidden="true"
                    className="relative z-10 mb-1 text-[1.75rem] group-data-[selected=false]:text-[color:var(--status-color)]"
                  />
                  <span className="relative z-10 text-[0.9375rem] font-semibold leading-snug">
                    Excused
                  </span>
                  <span className="relative z-10 mt-0.5 text-[0.8125rem] leading-snug group-data-[selected=false]:opacity-70">
                    Prayer excused
                  </span>
                </motion.button>
              </>
            )}

            <motion.button
              type="button"
              variants={salahStatusVariants}
              initial="default"
              animate={salahStatus === "late" ? "animate" : "default"}
              aria-pressed={salahStatus === "late"}
              data-selected={salahStatus === "late"}
              onClick={() => {
                setSalahStatus("late");
              }}
              style={
                {
                  "--status-color": salahStatusColorsHexCodes.late,
                  "--status-foreground": "#111",
                  borderLeft: `5px solid ${salahStatusColorsHexCodes.late}`,
                } as React.CSSProperties
              }
              className={statusBoxStyles}
            >
              <GoClock
                aria-hidden="true"
                className="relative z-10 mb-1 text-[1.75rem] group-data-[selected=false]:text-[color:var(--status-color)]"
              />
              <span className="relative z-10 text-[0.9375rem] font-semibold leading-snug">
                Late
              </span>
              <span className="relative z-10 mt-0.5 text-[0.8125rem] leading-snug group-data-[selected=false]:opacity-70">
                After its time
              </span>
            </motion.button>

            <motion.button
              type="button"
              variants={salahStatusVariants}
              initial="default"
              animate={salahStatus === "missed" ? "animate" : "default"}
              aria-pressed={salahStatus === "missed"}
              data-selected={salahStatus === "missed"}
              onClick={() => {
                setSalahStatus("missed");
              }}
              style={
                {
                  "--status-color": salahStatusColorsHexCodes.missed,
                  "--status-foreground": "#111",
                  borderLeft: `5px solid ${salahStatusColorsHexCodes.missed}`,
                } as React.CSSProperties
              }
              className={statusBoxStyles}
            >
              <GoSkip
                aria-hidden="true"
                className="relative z-10 mb-1 text-[1.75rem] group-data-[selected=false]:text-[color:var(--status-color)]"
              />
              <span className="relative z-10 text-[0.9375rem] font-semibold leading-snug">
                Missed
              </span>
              <span className="relative z-10 mt-0.5 text-[0.8125rem] leading-snug group-data-[selected=false]:opacity-70">
                Not prayed
              </span>
            </motion.button>
          </div>
          <section
            style={{ maxHeight: reasonsHeight + "px" }}
            ref={modalSheetSalahReasonsWrap}
            className="mt-8 mb-5 overflow-x-hidden salah-status-modal-reasons-wrap scrollable-container"
          >
            {userPreferences.reasons.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-semibold text-start text-[var(--ion-text-color)]">
                  Reasons (optional)
                </h2>
              </div>
            )}
            {Array.isArray(userPreferences.reasons) && (
              <div className="flex flex-wrap gap-2 text-[var(--ion-text-color)]">
                <AnimatePresence>
                  {[
                    ...new Set([
                      ...selectedReasons,
                      ...userPreferences.reasons,
                    ]),
                  ]
                    .sort((a, b) => a.localeCompare(b))

                    .map((item) => (
                      <motion.p
                        // layout="position"
                        initial={{
                          backgroundColor:
                            "var(--reasons-bg-color-status-sheet)",
                        }}
                        animate={{
                          backgroundColor: selectedReasons.includes(item)
                            ? "var(--reasons-bg-active-color-status-sheet)"
                            : "var(--reasons-bg-color-status-sheet)",
                        }}
                        transition={{ duration: 0.3 }}
                        exit={{ scale: [1, 1.2, 0], opacity: 0 }}
                        key={item}
                        data-selected={selectedReasons.includes(item)}
                        className={reasonsStyles}
                        onClick={async () => {
                          if (!selectedReasons.includes(item)) {
                            setSelectedReasons((prev) => [...prev, item]);
                          } else if (selectedReasons.includes(item)) {
                            if (!userPreferences.reasons.includes(item)) {
                              const confirmMsgRes = await showConfirmMsg(
                                "Confirm",
                                "This reason has been deleted from the reasons list, deselecting it will cause it to be removed permanently from this Salah entry, proceed?",
                              );
                              if (!confirmMsgRes) return;
                            }
                            setSelectedReasons((prev) =>
                              prev.filter((reason) => reason !== item),
                            );
                          }
                        }}
                      >
                        {item}
                      </motion.p>
                    ))}
                </AnimatePresence>
              </div>
            )}
          </section>
          <div className="text-sm notes-wrap">
            <h2 className="mb-2 text-sm font-semibold text-[var(--ion-text-color)]">
              Notes (optional)
            </h2>
            <IonTextarea
              aria-label="notes"
              autoGrow={true}
              rows={1}
              className="rounded-lg border border-[color:var(--sheet-input-border-color)] bg-[var(--sheet-bg-color)] text-[var(--ion-text-color)] [--padding-start:1rem] [--padding-end:1rem] [--placeholder-color:var(--sheet-input-placeholder-color)] [--placeholder-opacity:1]"
              placeholder="Add a note..."
              value={notes}
              onIonInput={(e) => {
                // @ts-ignore
                handleNotes(e);
              }}
            ></IonTextarea>
          </div>
          <motion.button
            animate={{
              opacity: salahStatus ? 1 : 0.2,
            }}
            transition={{ duration: 0.3 }}
            onClick={async () => {
              if (salahStatus) {
                await addOrModifySalah();
                setShowUpdateStatusModal(false);
                setShowBoxAnimation(true);
                onSheetCloseCleanup();
              }
            }}
            className={`mt-3 w-full rounded-lg bg-[var(--ion-color-primary)] px-4 py-3 text-[0.9375rem] font-semibold text-[var(--ion-color-primary-contrast)] ${
              salahStatus ? "opacity-100" : "opacity-20"
            }`}
          >
            Save
          </motion.button>
        </section>
      </IonModal>

      {/* BELOW IS DUPLICATE SO HEIGHT CAN BE ANIMATED */}
      <div
        className="DUPLICATE-REASONS z-[-10000] absolute bottom-0 opacity-0"
        ref={modalSheetHiddenSalahReasonsWrap}
      >
        <div>
          <div className="overflow-x-hidden salah-status-modal-reasons-wrap">
            {userPreferences.reasons.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-semibold text-start text-[var(--ion-text-color)]">
                  Reasons (optional)
                </h2>
              </div>
            )}
          </div>
        </div>

        {Array.isArray(userPreferences.reasons) && (
          <div className="flex flex-wrap gap-2">
            {[...new Set([...selectedReasons, ...userPreferences.reasons])]
              .sort((a, b) => a.localeCompare(b))
              .map((item) => (
                <p
                  key={item}
                  data-selected={selectedReasons.includes(item)}
                  style={{
                    backgroundColor: selectedReasons.includes(item)
                      ? "var(--reasons-bg-active-color-status-sheet)"
                      : "",
                  }}
                  className={reasonsStyles}
                  onClick={async () => {
                    if (!selectedReasons.includes(item)) {
                      setSelectedReasons((prev) => [...prev, item]);
                    } else if (selectedReasons.includes(item)) {
                      if (!userPreferences.reasons.includes(item)) {
                        const confirmMsgRes = await showConfirmMsg(
                          "Confirm",
                          "This reason has been deleted from the reasons list in the settings page, deselecting it will cause it to be removed permanently from this Salah entry, proceed?",
                        );
                        if (!confirmMsgRes) return;
                      }
                      setSelectedReasons((prev) =>
                        prev.filter((reason) => reason !== item),
                      );
                    }
                  }}
                >
                  {item}
                </p>
              ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BottomSheetSalahStatus;
