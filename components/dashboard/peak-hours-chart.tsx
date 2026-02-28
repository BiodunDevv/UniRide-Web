"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ClockIcon } from "lucide-react";

const config = {
  rides: { label: "Rides", color: "var(--chart-3)" },
} satisfies ChartConfig;

interface PeakHoursChartProps {
  data: { hour: number; rides: number }[];
}

export function PeakHoursChart({ data }: PeakHoursChartProps) {
  if (!data || data.length === 0) return null;

  const formatted = data.map((item) => ({
    hour: `${item.hour.toString().padStart(2, "0")}:00`,
    rides: item.rides,
  }));

  const peakHour = data.reduce(
    (max, item) => (item.rides > max.rides ? item : max),
    data[0],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-primary" />
          Peak Hours
        </CardTitle>
        <CardDescription className="text-xs">
          Busiest hour:{" "}
          <span className="font-medium text-foreground">
            {peakHour.hour.toString().padStart(2, "0")}:00
          </span>{" "}
          with {peakHour.rides} rides
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-0">
        <ChartContainer
          config={config}
          className="aspect-auto h-[200px] w-full"
        >
          <BarChart data={formatted}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              fontSize={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              fontSize={10}
              width={30}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `${value}`}
                  indicator="dot"
                />
              }
            />
            <Bar dataKey="rides" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
