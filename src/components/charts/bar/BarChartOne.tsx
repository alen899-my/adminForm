"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function BarChartOne() {
  const [chartData, setChartData] = useState(Array(12).fill(0));

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/analytics/leads");
        const result = await res.json();

        console.log("API RESULT:", result);

        if (!result.success) return;

        const monthly = Array(12).fill(0);
        result.data.forEach((entry) => {
          monthly[entry._id - 1] = entry.count;
        });

        setChartData(monthly);
      } catch (error) {
        console.error("Chart Fetch Error:", error);
      }
    }

    fetchData();
  }, []);

  const options = {
    colors: ["#465fff"],
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 6,
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 4, colors: ["transparent"] },
    xaxis: {
      categories: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} Leads`,
      },
    },
  };

  const series = [
    {
      name: "Total Leads",
      data: chartData,
    },
  ];

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div id="chartOne" className="min-w-[1000px]">
        <ReactApexChart
          key={chartData.join(",")}
          options={options}
          series={series}
          type="bar"
          height={180}
        />
      </div>
    </div>
  );
}
