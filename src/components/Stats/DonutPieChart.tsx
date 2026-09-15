const DonutPieChart = ({
  donutPieChartData,
}: {
  donutPieChartData: { title: string; value: number; color: string }[];
}) => {
  const totalStatusCount = donutPieChartData.reduce(
    (total, item) => total + item.value,
    0,
  );

  const statusData = donutPieChartData.map((item) => ({
    ...item,
    percentage: (item.value / totalStatusCount) * 100,
  }));

  return (
    <section className="px-4 pb-4 pt-1 mt-5 bg-[var(--card-bg-color)] rounded-2xl">
      <h2 className="text-base font-semibold">Status breakdown</h2>

      <div
        role="img"
        aria-label={statusData
          .map((item) => `${item.title}: ${Math.round(item.percentage)}%`)
          .join(", ")}
        className="flex h-3 mt-4 overflow-hidden rounded-full bg-[var(--app-border-color)]"
      >
        {statusData.map((item) => (
          <span
            key={item.title}
            aria-hidden="true"
            style={{
              width: `${item.percentage}%`,
              backgroundColor: item.color,
            }}
          />
        ))}
      </div>

      <div className="grid grid-cols-4 gap-1 mt-4">
        {statusData.map((item) => (
          <div key={item.title} className="min-w-0">
            <div className="flex items-center gap-1">
              <span
                aria-hidden="true"
                className="w-2 h-2 rounded-[0.15rem] shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px] truncate min-[375px]:text-xs">
                {item.title}
              </span>
            </div>
            <p className="pl-3 mt-1 text-xs font-semibold">
              {Math.round(item.percentage)}%
            </p>
            <p className="pl-3 mt-0.5 text-[10px] leading-tight opacity-60 min-[375px]:text-[11px]">
              {item.value.toLocaleString()} {item.value === 1 ? "prayer" : "prayers"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DonutPieChart;
