import { IonModal, IonRadio, IonRadioGroup, isPlatform } from "@ionic/react";
import {
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
} from "../../utils/constants";
import { themeType, userPreferencesType } from "../../types/types";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { updateUserPrefs } from "../../utils/helpers";

interface BottomSheetAboutUsProps {
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  triggerId: string;
  setUserPreferences: React.Dispatch<React.SetStateAction<userPreferencesType>>;
  userPreferencesTheme: themeType;
  handleTheme: (theme?: themeType) => string;
}

const BottomSheetThemeOptions = ({
  dbConnection,
  triggerId,
  userPreferencesTheme,
  setUserPreferences,
}: BottomSheetAboutUsProps) => {
  return (
    <IonModal
      mode="ios"
      expandToScroll={false}
      className="modal-fit-content"
      trigger={triggerId}
      initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      breakpoints={MODAL_BREAKPOINTS}
    >
      <section className="px-4 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))] text-[var(--ion-text-color)]">
        {/* <h1 className="modal-header-text">Themes</h1> */}
        <h1 className="mb-4 px-2 text-[1.625rem] font-bold leading-tight">
          Theme
        </h1>
        <IonRadioGroup
          aria-label="Theme"
          value={userPreferencesTheme}
          onIonChange={async (e) => {
            await updateUserPrefs(
              dbConnection,
              "theme",
              e.detail.value,
              setUserPreferences,
            );
          }}
        >
          {/* // TODO: May need to add aria-pressed to each button */}
          <IonRadio
            mode={isPlatform("ios") ? "ios" : "md"}
            value="light"
            color="primary"
            labelPlacement="start"
            justify="space-between"
            className="w-full border-b border-[color:var(--table-row-border-color)] px-4 py-4 text-base font-semibold leading-snug [--color:var(--sheet-secondary-text-color)] [&::part(label)]:whitespace-normal before:absolute before:left-0 before:top-1/2 before:h-7 before:w-1 before:-translate-y-1/2 before:rounded-full aria-checked:before:bg-[var(--ion-color-primary)]"
          >
            Light
          </IonRadio>
          <IonRadio
            mode={isPlatform("ios") ? "ios" : "md"}
            value="dark"
            color="primary"
            labelPlacement="start"
            justify="space-between"
            className="w-full border-b border-[color:var(--table-row-border-color)] px-4 py-4 text-base font-semibold leading-snug [--color:var(--sheet-secondary-text-color)] [&::part(label)]:whitespace-normal before:absolute before:left-0 before:top-1/2 before:h-7 before:w-1 before:-translate-y-1/2 before:rounded-full aria-checked:before:bg-[var(--ion-color-primary)]"
          >
            Dark
          </IonRadio>
          <IonRadio
            mode={isPlatform("ios") ? "ios" : "md"}
            value="system"
            color="primary"
            labelPlacement="start"
            justify="space-between"
            className="w-full px-4 py-4 text-base font-semibold leading-snug [--color:var(--sheet-secondary-text-color)] [&::part(label)]:whitespace-normal before:absolute before:left-0 before:top-1/2 before:h-7 before:w-1 before:-translate-y-1/2 before:rounded-full aria-checked:before:bg-[var(--ion-color-primary)]"
          >
            <span>
              System
              <span className="mt-1 block text-sm font-normal leading-snug text-[var(--sheet-secondary-text-color)]">
                Match device appearance
              </span>
            </span>
          </IonRadio>
        </IonRadioGroup>
      </section>
    </IonModal>
  );
};

export default BottomSheetThemeOptions;
