import {
  INITIAL_MODAL_BREAKPOINT,
  MODAL_BREAKPOINTS,
} from "../../utils/constants";
import { IonModal } from "@ionic/react";

interface BottomSheetAboutUsProps {
  triggerId: string;
}

const BottomSheetAboutUs = ({ triggerId }: BottomSheetAboutUsProps) => {
  return (
    <IonModal
      mode="ios"
      expandToScroll={false}
      className="modal-fit-content"
      trigger={triggerId}
      initialBreakpoint={INITIAL_MODAL_BREAKPOINT}
      breakpoints={MODAL_BREAKPOINTS}
    >
      <div className="ion-content-scroll-host max-h-[calc(var(--sheet-max-height)-2.5rem)] overflow-y-auto pb-6 mt-10 rounded-lg">
        <div className="text-center">
          {/* <img
            className="block mx-auto mb-2"
            src={}
            height="50"
            width="40%"
            alt=""
          /> */}

          <p className="p-4 text-sm leading-5"></p>
        </div>

        <div className="mx-4 mt-5 text-xs text-center">
          <p className="mb-[0.2rem]">App Icon by: </p>
          <a
            className="text-xs underline text-inherit"
            href="https://www.flaticon.com/authors/zane-priedite"
            title="number icons"
          >
            Zane Priedite - Flaticon
          </a>
        </div>
      </div>
    </IonModal>
  );
};

export default BottomSheetAboutUs;
