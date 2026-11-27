import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

function RiskTrend({ data }) {
  return (
    <section className="intelligence-panel">

      <div className="intelligence-panel-header">

        <div>
          <span className="panel-eyebrow">
            RISK MONITORING
          </span>

          <h3>Risk Trend</h3>

          <p>
            Average assessed risk by project year.
          </p>
        </div>

      </div>

      <div className="risk-trend-chart">

        {data.length === 0 ? (

          <div className="chart-empty">
            Risk trend data is not available yet.
          </div>

        ) : (

          <ResponsiveContainer
            width="100%"
            height={260}
          >

            <AreaChart data={data}>

              <defs>

                <linearGradient
                  id="riskTrendFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >

                  <stop
                    offset="0%"
                    stopColor="#4f46e5"
                    stopOpacity={0.22}
                  />

                  <stop
                    offset="100%"
                    stopColor="#4f46e5"
                    stopOpacity={0}
                  />

                </linearGradient>

              </defs>

              <CartesianGrid
                stroke="#edf0f4"
                vertical={false}
              />

              <XAxis
                dataKey="year"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                  fill: "#8b95a7"
                }}
              />

              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 11,
                  fill: "#8b95a7"
                }}
              />

              <Tooltip
                formatter={(value) => [
                  `${value}`,
                  "Average Risk"
                ]}
              />

              <Area
                type="monotone"
                dataKey="averageRisk"
                stroke="#4f46e5"
                strokeWidth={3}
                fill="url(#riskTrendFill)"
              />

            </AreaChart>

          </ResponsiveContainer>

        )}

      </div>

    </section>
  );
}

export default RiskTrend;