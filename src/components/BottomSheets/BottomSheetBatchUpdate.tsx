import {
  IonButton,
  IonContent,
  IonIcon,
  IonModal,
  // IonSpinner,
  IonTextarea,
  useIonLoading,
} from "@ionic/react";

import {
  DBResultSalahStatusDataType,
  SalahNamesType,
  SalahStatusType,
  userPreferencesType,
} from "../../types/types";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
  reasonsStyles,
  salahNamesArr,
  salahStatusColorsHexCodes,
} from "../../utils/constants";
import {
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
} from "date-fns";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { toggleDBConnection } from "../../utils/dbUtils";
import {
  createLocalisedDate,
  showAlert,
  showToast,
  upperCaseFirstLetter,
} from "../../utils/helpers";
import { calendarOutline } from "ionicons/icons";
import { GoClock, GoPeople, GoPerson, GoSkip } from "react-icons/go";
import { PiFlower } from "react-icons/pi";

interface BottomSheetBatchUpdateProps {
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  handleSalahTrackingDataFromDB: (
    DBResultAllSalahData: DBResultSalahStatusDataType[],
    userStartDate: string,
  ) => Promise<void>;
  setShowBatchUpdateModal: React.Dispatch<React.SetStateAction<boolean>>;
  showBatchUpdateModal: boolean;
  // setUserPreferences: React.Dispatch<React.SetStateAction<userPreferencesType>>;
  setShowStartDateSheet: React.Dispatch<React.SetStateAction<boolean>>;

  userPreferences: userPreferencesType;
  // fetchDataFromDB: () => Promise<void>;
}

const BottomSheetBatchUpdate = ({
  dbConnection,
  handleSalahTrackingDataFromDB,
  setShowBatchUpdateModal,
  showBatchUpdateModal,
  // setUserPreferences,
  userPreferences,
  setShowStartDateSheet,
  // fetchDataFromDB,
}: BottomSheetBatchUpdateProps) => {
  const [processedRows, setProcessedRows] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [isBatchUpdating, setIsBatchUpdating] = useState(false);
  const [presentUpdatingSpinner, dismissUpdatingSpinner] = useIonLoading();

  type batchUpdateObj = {
    fromDate: string;
    toDate: string;
    salahs: SalahNamesType[];
    status: SalahStatusType;
    reasons: string[];
    notes: string;
  };

  const [batchUpdateObj, setBatchUpdateObj] = useState<batchUpdateObj>({
    fromDate: "",
    toDate: "",
    salahs: [],
    status: "",
    reasons: [],
    notes: "",
  });

  const statusArr: SalahStatusType[] =
    userPreferences.userGender === "male"
      ? ["group", "male-alone", "late", "missed"]
      : ["female-alone", "excused", "late", "missed"];

  const executeBatchUpdate = async () => {
    try {
      const statement = `INSERT OR REPLACE INTO salahDataTable(date, salahName, salahStatus, reasons, notes) VALUES  (?, ?, ?, ?, ?)`;
      const statements = [];

      const {
        salahs: salahsToUpdate,
        status: salahStatus,
        reasons,
      } = batchUpdateObj;

      const reasonsToInsert =
        reasons.length > 0 &&
        salahStatus !== "group" &&
        salahStatus !== "female-alone" &&
        salahStatus !== "excused"
          ? reasons.join(", ")
          : "";

      const dates = eachDayOfInterval({
        start: parseISO(batchUpdateObj.fromDate),
        end: parseISO(batchUpdateObj.toDate),
      }).map((date) => format(date, "yyyy-MM-dd"));

      const batchSize = 100;

      if (!dbConnection.current) {
        throw new Error("dbConnection / dbconnection.current does not exist");
      }

      setTotalRows(dates.length * salahsToUpdate.length);

      await toggleDBConnection(dbConnection, "open");

      try {
        await dbConnection.current.beginTransaction();

        for (let i = 0; i < salahsToUpdate.length; i++) {
          for (let x = 0; x < dates.length; x++) {
            statements.push({
              statement: statement,
              values: [
                dates[x],
                salahsToUpdate[i],
                salahStatus,
                reasonsToInsert,
                batchUpdateObj.notes,
              ],
            });

            if (statements.length === batchSize) {
              await dbConnection.current.executeSet(statements, false);

              setProcessedRows((previous) => previous + batchSize);
              statements.length = 0;
            }
          }
        }

        if (statements.length > 0) {
          await dbConnection.current.executeSet(statements, false);
          setProcessedRows((previous) => previous + statements.length);
        }

        await dbConnection.current.commitTransaction();
      } catch (error) {
        await dbConnection.current.rollbackTransaction();
        throw error;
      }

      const DBResultSalahStatusData = await dbConnection.current.query(
        `SELECT date, salahName, salahStatus
            FROM salahDataTable`,
      );

      await handleSalahTrackingDataFromDB(
        DBResultSalahStatusData.values ?? [],
        userPreferences.userStartDate,
      );

      showToast(`Bulk Update Successful`, "long");

      setShowBatchUpdateModal(false);
    } catch (error) {
      console.error("Bulk update failed: ", error);
      showToast(`Bulk Update Failed, please try again - ${error}`, "long");
    } finally {
      setProcessedRows(0);
      setTotalRows(0);
      await dismissUpdatingSpinner();
      await toggleDBConnection(dbConnection, "close");
      setIsBatchUpdating(false);
    }
  };

  return (
    <IonModal
      mode="ios"
      className="modal-height"
      expandToScroll={false}
      isOpen={showBatchUpdateModal}
      onDidDismiss={() => {
        setShowBatchUpdateModal(false);
        setBatchUpdateObj({
          fromDate: "",
          toDate: "",
          salahs: [],
          status: "",
          reasons: [],
          notes: "",
        });
      }}
      initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      breakpoints={MODAL_BREAKPOINTS}
    >
      <IonContent className="[--background:var(--sheet-bg-color)]">
        <section className="px-5 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          <h1 className="mb-1 font-bold leading-tight">Bulk update Salah</h1>
          <p className="text-[0.9375rem] leading-relaxed text-[var(--secondary-text-color)]">
            Apply one status across selected dates and Salah.
          </p>
          <div className="mt-[18px] mb-4">
            <div className="">
              <p className="mb-1.5 text-sm font-semibold">Date range</p>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <p className="mb-1 text-[11px] leading-3 text-[var(--secondary-text-color)]">
                    From
                  </p>
                  <div className="relative flex h-10 items-center justify-between gap-1.5 rounded-md border border-[color:var(--sheet-group-border)] bg-[var(--sheet-group-bg)] pl-3.5 pr-3 text-sm">
                    <span
                      className={
                        batchUpdateObj.fromDate !== ""
                          ? ""
                          : "text-[var(--secondary-text-color)]"
                      }
                    >
                      {batchUpdateObj.fromDate !== ""
                        ? format(
                            parseISO(batchUpdateObj.fromDate),
                            "do MMM yyyy",
                          )
                        : "Select date"}
                    </span>
                    <IonIcon
                      aria-hidden="true"
                      icon={calendarOutline}
                      className="shrink-0 text-base text-[var(--secondary-text-color)] max-[359px]:hidden"
                    />
                    <input
                      className="absolute inset-0 h-full w-full opacity-0 [color-scheme:var(--input-color-scheme)]"
                      onKeyDown={(e) => {
                        e.preventDefault();
                      }}
                      onChange={(e) => {
                        setBatchUpdateObj((prev) => ({
                          ...prev,
                          fromDate: e.target.value,
                        }));
                      }}
                      type="date"
                      dir="auto"
                      name="start-date-picker"
                      min={userPreferences.userStartDate}
                      max={new Date().toISOString().split("T")[0]}
                    ></input>
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-[11px] leading-3 text-[var(--secondary-text-color)]">
                    To
                  </p>
                  <div className="relative flex h-10 items-center justify-between gap-1.5 rounded-md border border-[color:var(--sheet-group-border)] bg-[var(--sheet-group-bg)] pl-3.5 pr-3 text-sm">
                    <span
                      className={
                        batchUpdateObj.toDate !== ""
                          ? ""
                          : "text-[var(--secondary-text-color)]"
                      }
                    >
                      {/* {batchUpdateObj.toDate || "Select end date"} */}
                      {batchUpdateObj.toDate !== ""
                        ? format(parseISO(batchUpdateObj.toDate), "do MMM yyyy")
                        : "Select date"}
                    </span>
                    <IonIcon
                      aria-hidden="true"
                      icon={calendarOutline}
                      className="shrink-0 text-base text-[var(--secondary-text-color)] max-[359px]:hidden"
                    />
                    <input
                      className="absolute inset-0 h-full w-full opacity-0 [color-scheme:var(--input-color-scheme)]"
                      onKeyDown={(e) => {
                        e.preventDefault();
                      }}
                      onChange={(e) => {
                        setBatchUpdateObj((prev) => ({
                          ...prev,
                          toDate: e.target.value,
                        }));
                      }}
                      // ref={datePickerRef}
                      type="date"
                      dir="auto"
                      name="start-date-picker"
                      min={userPreferences.userStartDate}
                      max={new Date().toISOString().split("T")[0]}
                    ></input>
                  </div>
                </div>
              </div>
              {/* <p className="mr-2"> */}
              {/* </p> */}
              <p className="mt-2 text-[0.8125rem] leading-snug text-[var(--secondary-text-color)]">
                Your earliest selectable date is{" "}
                {format(
                  parseISO(userPreferences.userStartDate),
                  "do MMMM yyyy",
                )}
                . Need earlier dates?{" "}
                <button
                  className="text-[var(--current-salah-color)]"
                  onClick={() => {
                    setShowStartDateSheet(true);
                  }}
                >
                  Change start date.
                </button>
              </p>

              {/* <div className="flex items-center mb-10 border border-[var(--app-border-color)] p-3 rounded-2xl">
                <p className="mr-4">
                  {" "}
                  <IonIcon className="text-2xl" icon={calendarClearOutline} />
                </p>
                <div className="text-xs">
                  <p className="">This will update x days</p>
                  <p>25 years, 3 months, 23 days</p>
                </div>
              </div> */}
            </div>
          </div>
          <section>
            <div className="mt-6 mb-4">
              <p className="mb-1.5 text-sm font-semibold">Select Salah</p>
              <div className="flex gap-1">
                {salahNamesArr.map((salahName) => {
                  const selected = batchUpdateObj.salahs.includes(salahName);

                  return (
                    <button
                      type="button"
                      aria-pressed={selected}
                      data-selected={selected}
                      className="h-8 flex-1 rounded-xl border border-solid border-[color:var(--sheet-input-border-color)] px-2 text-xs text-[var(--secondary-text-color)] data-[selected=true]:border-transparent data-[selected=true]:bg-[var(--ion-color-primary)] data-[selected=true]:font-semibold data-[selected=true]:text-white"
                      key={salahName}
                      onClick={() => {
                        setBatchUpdateObj((prev) => ({
                          ...prev,
                          salahs: prev.salahs.includes(salahName)
                            ? prev.salahs.filter((s) => s !== salahName)
                            : [...prev.salahs, salahName],
                        }));
                      }}
                    >
                      {salahName === "Asar" ? "Asr" : salahName}
                    </button>
                  );
                })}
              </div>
            </div>
            <section>
              <div className="mb-4">
                <p className="mb-1 text-sm font-semibold">Select status</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {statusArr.map((status) => {
                    const selected = batchUpdateObj.status === status;
                    const StatusIcon =
                      status === "group"
                        ? GoPeople
                        : status === "excused"
                          ? PiFlower
                          : status === "late"
                            ? GoClock
                            : status === "missed"
                              ? GoSkip
                              : GoPerson;
                    return (
                      <button
                        type="button"
                        aria-pressed={selected}
                        data-selected={selected}
                        className="group flex items-center gap-4 rounded-xl border border-solid border-[color:var(--status-tile-border)] bg-[var(--status-tile-bg)] py-[13px] pl-5 pr-3.5 text-left max-[389px]:pl-3.5 data-[selected=true]:border-transparent data-[selected=true]:bg-[var(--status-color)]"
                        style={
                          {
                            "--status-color": salahStatusColorsHexCodes[status],
                            "--status-foreground":
                              status === "excused" ? "#fff" : "#111",
                          } as React.CSSProperties
                        }
                        key={status}
                        onClick={() => {
                          setBatchUpdateObj((prev) => ({
                            ...prev,
                            status: status,
                          }));
                        }}
                      >
                        <StatusIcon
                          aria-hidden="true"
                          className="shrink-0 text-[1.875rem] text-[color:var(--status-color)] group-data-[selected=true]:text-[color:var(--status-foreground)]"
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold leading-5 text-[var(--ion-text-color)] group-data-[selected=true]:text-[color:var(--status-foreground)]">
                            {status === "male-alone"
                              ? "On Time"
                              : status === "female-alone"
                                ? "Prayed"
                                : status === "group"
                                  ? "In Jamaah"
                                  : upperCaseFirstLetter(status)}
                          </span>
                          <span className="mt-[3px] block text-[11px] leading-4 text-[var(--secondary-text-color)] group-data-[selected=true]:text-[color:var(--status-foreground)]">
                            {status === "group"
                              ? "In congregation"
                              : status === "male-alone"
                                ? "Alone, on time"
                                : status === "female-alone"
                                  ? "Prayer completed"
                                  : status === "excused"
                                    ? "Prayer excused"
                                    : status === "late"
                                      ? "After its time"
                                      : "Not prayed"}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          </section>
          {batchUpdateObj.status !== "group" &&
            batchUpdateObj.status !== "excused" &&
            batchUpdateObj.status !== "female-alone" &&
            batchUpdateObj.status !== "" && (
              <section className="mt-4 mb-4">
                {userPreferences.reasons.length > 0 && (
                  <div>
                    <h2 className="mb-3 text-sm font-semibold text-start text-[var(--ion-text-color)]">
                      Reasons (optional)
                    </h2>
                  </div>
                )}
                <div className="flex flex-wrap gap-x-2.5 gap-y-3 text-[var(--ion-text-color)]">
                  {[...userPreferences.reasons]
                    .sort((a, b) => a.localeCompare(b))
                    .map((reason) => {
                      const selected = batchUpdateObj.reasons.includes(reason);
                      return (
                        <motion.p
                          initial={{
                            backgroundColor: "var(--sheet-pill-bg)",
                          }}
                          animate={{
                            backgroundColor: selected
                              ? salahStatusColorsHexCodes[batchUpdateObj.status]
                              : "var(--sheet-pill-bg)",
                          }}
                          transition={{ duration: 0.3 }}
                          data-selected={selected}
                          className={reasonsStyles}
                          key={reason}
                          onClick={() => {
                            setBatchUpdateObj((prev) => ({
                              ...prev,
                              reasons: prev.reasons.includes(reason)
                                ? prev.reasons.filter((r) => r !== reason)
                                : [...prev.reasons, reason],
                            }));
                          }}
                        >
                          {reason}
                        </motion.p>
                      );
                    })}
                </div>
              </section>
            )}
          <div className="mt-4">
            <p className="mb-1 text-sm font-semibold">Notes (optional)</p>
            <IonTextarea
              aria-label="notes"
              autoGrow={true}
              rows={1}
              className="rounded-md border border-[color:var(--sheet-divider-color)] bg-[var(--sheet-group-bg)] text-[0.8125rem] text-[var(--ion-text-color)] ![--padding-start:0.875rem] ![--padding-end:0.875rem] ![--padding-top:0.8125rem] ![--padding-bottom:0.8125rem] ![--placeholder-color:var(--secondary-text-color)] ![--placeholder-opacity:1]"
              placeholder="Add a note..."
              value={batchUpdateObj.notes}
              onIonInput={(e) => {
                setBatchUpdateObj((prev) => ({
                  ...prev,
                  notes: e.detail.value ?? "",
                }));
              }}
            ></IonTextarea>
          </div>
          {/*  ${selectedStartDate ? "opacity-100" : "opacity-20"} */}
          <IonButton
            expand="block"
            disabled={
              !batchUpdateObj.fromDate ||
              !batchUpdateObj.toDate ||
              !batchUpdateObj.salahs.length ||
              !batchUpdateObj.status
            }
            className="mx-0 mb-0 mt-3 text-[0.9375rem] font-semibold transition-opacity duration-300 aria-disabled:opacity-20"
            onClick={async () => {
              const fromDate = startOfDay(parseISO(batchUpdateObj.fromDate));
              const toDate = startOfDay(parseISO(batchUpdateObj.toDate));
              const minDate = startOfDay(
                parseISO(userPreferences.userStartDate),
              );

              if (!batchUpdateObj.fromDate || !batchUpdateObj.toDate) {
                showAlert("No Dates Selected", "Please select dates");
                return;
              }

              const todaysDate = startOfDay(new Date());
              // const fromDate = startOfDay(
              //   new Date(batchUpdateObj.fromDate),
              // );
              // const toDate = startOfDay(new Date(batchUpdateObj.toDate));

              if (isBefore(fromDate, minDate) || isBefore(toDate, minDate)) {
                showAlert(
                  "Invalid Date",
                  `Date cannot be earlier than your start date: ${" "} ${createLocalisedDate(userPreferences.userStartDate)[1]}`,
                );
                return;
              }

              if (isAfter(fromDate, toDate)) {
                showAlert(
                  "Invalid Date Range",
                  "Please select a valid date range",
                );
                return;
              }

              if (
                isAfter(fromDate, todaysDate) ||
                isAfter(toDate, todaysDate)
              ) {
                showAlert("Invalid Date", "Dates cannot be in the future");
                return;
              }

              await presentUpdatingSpinner({
                // message: `${processedRows}`,
                backdropDismiss: false,
                cssClass: "ion-spinner-hidden",
              });
              setIsBatchUpdating(true);
              await executeBatchUpdate();
            }}
          >
            Update selected Salah
          </IonButton>
        </section>
      </IonContent>
      {isBatchUpdating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto bg-black/50">
          <div className="min-w-56 rounded-2xl bg-[var(--sheet-bg-color)] px-6 py-5 text-center">
            <p className="font-semibold">Updating Salah...</p>

            <p className="mt-1 text-sm text-[var(--secondary-text-color)]">
              {processedRows} / {totalRows}
            </p>

            {Math.round((processedRows / totalRows) * 100) < 100 ? (
              <p className="text-sm text-[var(--secondary-text-color)]">
                {Math.round((processedRows / totalRows) * 100)}%{" "}
              </p>
            ) : (
              <p className="animate-pulse text-sm text-[var(--secondary-text-color)]">
                Finishing up...{" "}
              </p>
            )}
          </div>
        </div>
      )}
    </IonModal>
  );
};

export default BottomSheetBatchUpdate;
