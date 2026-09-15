import { GoCalendar, GoGraph } from "react-icons/go";
// import { LATEST_APP_VERSION } from "../utils/changelog";
import monthlyStatsPreview from "../assets/images/stats-update-monthly.png";
import yearlyStatsPreview from "../assets/images/stats-update-yearly.png";
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
          className="relative max-w-sm mx-auto mb-6 overflow-hidden h-72"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 70%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 70%, transparent 100%)",
          }}
        >
          <img
            src={monthlyStatsPreview}
            alt=""
            width={780}
            height={1688}
            className="absolute top-4 left-[4%] w-[45%] -rotate-[8deg] rounded-2xl shadow-2xl"
          />
          <img
            src={yearlyStatsPreview}
            alt=""
            width={780}
            height={1688}
            className="absolute top-4 right-[4%] w-[45%] rotate-[8deg] rounded-2xl shadow-2xl"
          />
        </div>

        <p className="bg-[#9332ed] py-2 px-3 rounded-lg w-fit text-xs font-bold">
          MAJOR UPDATE
          {/* Version {LATEST_APP_VERSION} */}
        </p>

        <h1 className="mt-3 mb-0 text-2xl font-bold leading-tight">
          A New Look for Your Salah Stats
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-white/80">
          See your Salah stats by month, by year, or across your whole history.
        </p>

        <section className="pb-4 mt-6 space-y-6">
          <div className="flex gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 bg-[#c583f1]/10">
              <GoCalendar
                aria-hidden="true"
                className="w-5 h-5 text-[#c583f1]"
              />
            </div>

            <div>
              <h2 className="m-0 text-base font-bold text-[#c583f1]">
                Monthly, Yearly & Overall
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Pick a Salah or view all five. Tap a year or month to explore
                your history. Yearly mode also highlights your best month.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 bg-[#f6cf45]/10">
              <GoGraph aria-hidden="true" className="w-5 h-5 text-[#f6cf45]" />
            </div>

            <div>
              <h2 className="m-0 text-base font-bold text-[#f6cf45]">
                A Clearer Stats Page
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-white/80">
                The stats page has a cleaner look, with a clearer Salah
                breakdown, refreshed streak card, and tabs for reasons instead
                of swiping.
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
