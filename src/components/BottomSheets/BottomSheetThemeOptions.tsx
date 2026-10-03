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
  theme: themeType;
  handleTheme: (theme?: themeType) => string;
}

const BottomSheetThemeOptions = ({
  dbConnection,
  triggerId,
  theme,
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
      <section className="px-4 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))] text-[var(--ion-text-color)] theme-sheet-content-wrap">
        {/* <h1 className="modal-header-text">Themes</h1> */}
        <h1 className="mb-4 px-2 text-[1.625rem] font-bold leading-tight">
          Theme
        </h1>
        <IonRadioGroup
          aria-label="Theme"
          value={theme}
          onIonChange={async (e) => {
            await updateUserPrefs(
              dbConnection,
              "theme",
              e.detail.value,
              setUserPreferences,
            );
          }}
        >
          <ul className="notification-ul-wrap">
            {/* // TODO: May need to add aria-pressed to each button */}
            <li className="relative border-b border-[color:var(--table-row-border-color)]">
              {theme === "light" && (
                <span aria-hidden="true" className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-full bg-[var(--ion-color-primary)]" />
              )}
              <IonRadio
                mode={isPlatform("ios") ? "ios" : "md"}
                value="light"
                color="primary"
                labelPlacement="start"
                justify="space-between"
                className="w-full px-4 py-4 text-base font-semibold leading-snug [--color:var(--sheet-input-placeholder-color)] [&::part(label)]:whitespace-normal"
              >
                Light
              </IonRadio>
            </li>
            <li className="relative border-b border-[color:var(--table-row-border-color)]">
              {theme === "dark" && (
                <span aria-hidden="true" className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-full bg-[var(--ion-color-primary)]" />
              )}
              <IonRadio
                mode={isPlatform("ios") ? "ios" : "md"}
                value="dark"
                color="primary"
                labelPlacement="start"
                justify="space-between"
                className="w-full px-4 py-4 text-base font-semibold leading-snug [--color:var(--sheet-input-placeholder-color)] [&::part(label)]:whitespace-normal"
              >
                Dark
              </IonRadio>
            </li>
            <li className="relative">
              {theme === "system" && (
                <span aria-hidden="true" className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-full bg-[var(--ion-color-primary)]" />
              )}
              <IonRadio
                mode={isPlatform("ios") ? "ios" : "md"}
                value="system"
                color="primary"
                labelPlacement="start"
                justify="space-between"
                className="w-full px-4 py-4 text-base font-semibold leading-snug [--color:var(--sheet-input-placeholder-color)] [&::part(label)]:whitespace-normal"
              >
                <span>
                  System
                  <span className="mt-1 block text-sm font-normal leading-snug text-[var(--sheet-input-placeholder-color)]">
                    Match device appearance
                  </span>
                </span>
              </IonRadio>
            </li>
          </ul>
        </IonRadioGroup>
      </section>
    </IonModal>
  );
};

export default BottomSheetThemeOptions;
