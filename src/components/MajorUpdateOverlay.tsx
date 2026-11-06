import { LuBug, LuSparkles } from "react-icons/lu";
// import { LATEST_APP_VERSION } from "../utils/changelog";
import statusSheetPreview from "../assets/images/refresh-update-status.png";
import missedSalahPreview from "../assets/images/refresh-update-missed-salah.png";
interface MajorUpdateOverlayProps {
  setShowMajorUpdateOverlay: React.Dispatch<React.SetStateAction<boolean>>;
}

const MajorUpdateOverlay = ({
  setShowMajorUpdateOverlay,
}: MajorUpdateOverlayProps) => {
  return (
    <section
      className="flex flex-col"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgb(20, 20, 20)",
        color: "#fff",
        padding: 20,
        zIndex: 9999,
        overflowY: "hidden",
        paddingTop: "calc(env(safe-area-inset-top) + 20px)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)",
        paddingLeft: "calc(env(safe-area-inset-left) + 20px)",
        paddingRight: "calc(env(safe-area-inset-right) + 20px)",
      }}
    >
      <section className="flex-1 w-full max-w-xl min-h-0 mx-auto overflow-y-auto">
        <div
          aria-hidden="true"
          className="relative max-w-sm mx-auto mb-6 overflow-hidden h-60"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 70%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 70%, transparent 100%)",
          }}
        >
          <img
            src={statusSheetPreview}
            alt=""
            width={780}
            height={1688}
            className="absolute top-4 left-[8%] w-[38%] -rotate-[8deg] rounded-2xl shadow-2xl"
          />
          <img
            src={missedSalahPreview}
            alt=""
            width={780}
            height={1688}
            className="absolute top-4 right-[8%] w-[38%] rotate-[8deg] rounded-2xl shadow-2xl"
          />
        </div>

        <p className="bg-[#9332ed] py-2 px-3 rounded-lg w-fit text-xs font-bold">
          MAJOR UPDATE
          {/* Version {LATEST_APP_VERSION} */}
        </p>

        <h1 className="mt-3 mb-0 text-2xl font-bold leading-tight">
          A Refreshed Look
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-white/80">
          A few key screens have been redesigned, and the rest have been
          polished.
        </p>

        <section className="pb-4 mt-6 space-y-6">
          <div className="flex gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 bg-[#c583f1]/10">
              <LuSparkles
                aria-hidden="true"
                className="w-5 h-5 text-[#c583f1]"
              />
            </div>

            <div>
              <h2 className="m-0 text-base font-bold text-[#c583f1]">
                New & Improved Design
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Some screens, like logging a Salah, have a whole new design.
                Others have been polished to feel cleaner and more consistent.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 bg-[#f6cf45]/10">
              <LuBug aria-hidden="true" className="w-5 h-5 text-[#f6cf45]" />
            </div>

            <div>
              <h2 className="m-0 text-base font-bold text-[#f6cf45]">
                Minor Bug Fixes
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-white/80">
                A few minor bugs have been fixed.
              </p>
            </div>
          </div>
        </section>
      </section>
      <div className="w-full max-w-xl pt-4 mx-auto">
        <button
          type="button"
          onClick={() => {
            setShowMajorUpdateOverlay(false);
          }}
          className="w-full min-h-12 px-4 py-3 text-lg font-bold text-center bg-[#9332ed] rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Continue
        </button>
      </div>
    </section>
  );
};

export default MajorUpdateOverlay;
