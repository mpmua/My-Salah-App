import { SalahNamesType } from "../../types/types";

interface SalahSegmentTabsProps {
  setStatsToShow: React.Dispatch<Exclude<SalahNamesType, "Asar"> | "All">;
  statsToShow: Exclude<SalahNamesType, "Asar"> | "All";
}

const salahOptions: (Exclude<SalahNamesType, "Asar"> | "All")[] = [
  "All",
  "Fajr",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
];

const SalahSegmentTabs = ({
  setStatsToShow,
  statsToShow,
}: SalahSegmentTabsProps) => {
  return (
    <section className="mt-5">
      <div
        role="group"
        aria-label="Salah filter"
        className="grid grid-cols-6 gap-2"
      >
        {salahOptions.map((salah) => (
          <button
            key={salah}
            type="button"
            aria-pressed={statsToShow === salah}
            onClick={() => setStatsToShow(salah)}
            className="h-11 min-w-0"
          >
            <span
              className={`flex h-8 w-full items-center justify-center whitespace-nowrap rounded-xl text-[10px] font-semibold min-[375px]:text-xs ${
                statsToShow === salah
                  ? "bg-[#3977db] text-white"
                  : "bg-[var(--stats-control-bg-color)] text-[var(--stats-control-text-color)]"
              }`}
            >
              {salah}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default SalahSegmentTabs;
