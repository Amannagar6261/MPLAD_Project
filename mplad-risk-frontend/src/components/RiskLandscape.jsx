import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const COLORS = {
  LOW: "#22c55e",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444",
  CRITICAL: "#7c2d5a"
};

function RiskLandscape({
  distribution,
  totalProjects,
  onRiskClick
}) {
  const data = [
    {
      name: "LOW",
      value: distribution.low
    },
    {
      name: "MEDIUM",
      value: distribution.medium
    },
    {
      name: "HIGH",
      value: distribution.high
    },
    {
      name: "CRITICAL",
      value: distribution.critical
    }
  ];

  return (
    <section className="intelligence-panel risk-landscape-panel">

      <div className="intelligence-panel-header">
        <div>
          <span className="panel-eyebrow">
            RISK ANALYSIS
          </span>

          <h3>Risk Landscape</h3>

          <p>
            Distribution of assessed project risk levels.
          </p>
        </div>
      </div>

      <div className="risk-landscape-content">

        <div className="risk-donut">

          <ResponsiveContainer
            width="100%"
            height={270}
          >
            <PieChart>

              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={82}
                outerRadius={108}
                paddingAngle={3}
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name]}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) => [
                  `${value} projects`,
                  "Projects"
                ]}
              />

            </PieChart>
          </ResponsiveContainer>

          <div className="risk-donut-center">
            <strong>{totalProjects}</strong>
            <span>Projects</span>
          </div>

        </div>

        <div className="risk-legend">

          {data.map((item) => (
            <button
              key={item.name}
              className="risk-legend-row"
              onClick={() => onRiskClick(item.name)}
            >

              <span
                className="risk-legend-dot"
                style={{
                  background: COLORS[item.name]
                }}
              />

              <span className="risk-legend-name">
                {item.name}
              </span>

              <strong>
                {item.value}
              </strong>

              <span className="risk-legend-arrow">
                →
              </span>

            </button>
          ))}

        </div>

      </div>

    </section>
  );
}

export default RiskLandscape;