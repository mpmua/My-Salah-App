import {
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
} from "../../utils/constants";
import { changeLogs } from "../../utils/changelog";
import { LATEST_APP_VERSION } from "../../utils/changelog";
import { IonContent, IonFooter, IonModal } from "@ionic/react";
import { useRef } from "react";

interface BottomSheetChangeLogProps {
  setShowChangelogSheet: React.Dispatch<React.SetStateAction<boolean>>;
  showChangelogSheet: boolean;
}

const BottomSheetChangelog = ({
  setShowChangelogSheet,
  showChangelogSheet,
}: BottomSheetChangeLogProps) => {
  const modal = useRef<HTMLIonModalElement>(null);

  return (
    <IonModal
      ref={modal}
      mode="ios"
      className="modal-height"
      isOpen={showChangelogSheet}
      onDidDismiss={() => {
        setShowChangelogSheet(false);
      }}
      initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      breakpoints={MODAL_BREAKPOINTS}
    >
      <IonContent>
        <section className="px-5 pt-6 pb-5">
          <h1 className="mt-0 mb-5 text-2xl font-semibold">What's new?</h1>
          {changeLogs.map((item, i) => (
            <section
              key={i}
              className="p-4 mt-5 bg-[var(--sheet-option-bg)] rounded-2xl"
            >
              <p className="flex items-center justify-between gap-3 text-sm font-semibold">
                v{item.versionNum}
                {item.versionNum === LATEST_APP_VERSION && (
                  <span className="px-2 py-1 text-xs font-medium bg-[var(--card-bg-color)] rounded-md">
                    Latest
                  </span>
                )}
              </p>
              {item.changes.map((item) => (
                <section
                  key={item.heading}
                  className="pt-4 mt-4 border-t border-[var(--app-border-color)]"
                >
                  <h2 className="mt-0 mb-2 text-sm font-semibold leading-snug">
                    {item.heading}
                  </h2>
                  <p className="text-sm leading-relaxed text-[var(--stats-control-text-color)]">
                    {item.text}
                  </p>
                </section>
              ))}
            </section>
          ))}
        </section>
      </IonContent>
      <IonFooter className="ion-no-border">
        <div className="px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] bg-[var(--card-bg-color)] border-t border-[var(--app-border-color)]">
          <button
            type="button"
            onClick={() => modal.current?.dismiss()}
            className="w-full min-h-11 px-4 py-3 text-sm font-semibold text-center text-white bg-[#3880ff] rounded-xl"
          >
            Close
          </button>
        </div>
      </IonFooter>
    </IonModal>
  );
};

export default BottomSheetChangelog;
