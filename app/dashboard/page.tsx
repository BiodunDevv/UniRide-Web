"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  FileTextIcon,
  CarIcon,
  UsersIcon,
  DollarSignIcon,
  BellIcon,
  ShieldIcon,
  FlagIcon,
  ClipboardListIcon,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";

const periodLabels: Record<string, string> = {
  "7days": "Last 7 days",
  "30days": "Last 30 days",
  "90days": "Last 90 days",
  year: "This year",
  all: "All time",
};

const formatRevenue = (value: string | number) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "₦0";
  if (num >= 1_000_000) return `₦${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `₦${(num / 1_000).toFixed(1)}K`;
  return `₦${num.toLocaleString()}`;
};

const formatNumber = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
};

const parseGrowth = (val: string) => {
  const num = parseFloat(val);
  return { value: isNaN(num) ? 0 : num, isPositive: !isNaN(num) && num >= 0 };
};

const userGrowthConfig = {
  users: { label: "Users", color: "var(--chart-1)" },
} satisfies ChartConfig;

const revenueConfig = {
  revenue: { label: "Revenue", color: "var(--chart-2)" },
} satisfies ChartConfig;

export default function DashboardPage() {
  const {
    dashboardData: data,
    isLoading,
    currentPeriod,
    getDashboardData,
    setPeriod,
  } = useDashboardStore();

  useEffect(() => {
    getDashboardData();
  }, [getDashboardData]);

  if (isLoading && !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
        <p className="text-sm text-muted-foreground">
          Failed to load dashboard data
        </p>
      </div>
    );
  }

  const o = data.overview;
  const userGrowth = parseGrowth(o.user_growth_percentage);
  const driverGrowth = parseGrowth(o.driver_growth_percentage);
  const revenueGrowth = parseGrowth(o.revenue_growth_percentage);
  const rideCompletionRate = parseFloat(o.ride_completion_rate) || 0;
  const approvalRate = parseFloat(data.driver_applications.approval_rate) || 0;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header with period selector */}
          <div className="flex items-center justify-between px-4 lg:px-6">
            <div>
              <h1 className="text-lg font-semibold">Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                {data.period_info
                  ? `${new Date(data.period_info.start_date).toLocaleDateString("en-NG", { day: "numeric", month: "short" })} – ${new Date(data.period_info.end_date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}`
                  : "Overview of your platform"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isLoading && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              )}
              <Select
                value={currentPeriod}
                onValueChange={(v) =>
                  setPeriod(v as "7days" | "30days" | "90days" | "year" | "all")
                }
              >
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(periodLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Primary stat cards */}
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {/* Total Rides */}
            <Card className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5">
                  <FileTextIcon className="size-3.5" />
                  Total Rides
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {formatNumber(o.total_rides)}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <CheckCircle className="size-3" />
                    {rideCompletionRate.toFixed(1)}%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  {o.completed_rides} completed
                  <span className="text-muted-foreground font-normal">
                    · {o.cancelled_rides} cancelled
                  </span>
                </div>
                <div className="text-muted-foreground">
                  {o.in_progress_rides} ride
                  {o.in_progress_rides !== 1 ? "s" : ""} in progress
                </div>
              </CardFooter>
            </Card>

            {/* Active Drivers */}
            <Card className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5">
                  <CarIcon className="size-3.5" />
                  Active Drivers
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {formatNumber(o.active_drivers)}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    {driverGrowth.isPositive ? (
                      <TrendingUpIcon />
                    ) : (
                      <TrendingDownIcon />
                    )}
                    {driverGrowth.isPositive ? "+" : ""}
                    {driverGrowth.value.toFixed(1)}%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  {o.total_drivers} total drivers
                  {driverGrowth.isPositive ? (
                    <TrendingUpIcon className="size-4" />
                  ) : (
                    <TrendingDownIcon className="size-4" />
                  )}
                </div>
                <div className="text-muted-foreground">
                  {o.new_drivers_this_period} new this period
                </div>
              </CardFooter>
            </Card>

            {/* Registered Users */}
            <Card className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5">
                  <UsersIcon className="size-3.5" />
                  Registered Users
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {formatNumber(o.total_users)}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    {userGrowth.isPositive ? (
                      <TrendingUpIcon />
                    ) : (
                      <TrendingDownIcon />
                    )}
                    {userGrowth.isPositive ? "+" : ""}
                    {userGrowth.value.toFixed(1)}%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  {o.active_users} active users
                  {userGrowth.isPositive ? (
                    <TrendingUpIcon className="size-4" />
                  ) : (
                    <TrendingDownIcon className="size-4" />
                  )}
                </div>
                <div className="text-muted-foreground">
                  {o.new_users_this_period} new this period
                </div>
              </CardFooter>
            </Card>

            {/* Revenue */}
            <Card className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5">
                  <DollarSignIcon className="size-3.5" />
                  Revenue
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {formatRevenue(o.total_revenue)}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    {revenueGrowth.isPositive ? (
                      <TrendingUpIcon />
                    ) : (
                      <TrendingDownIcon />
                    )}
                    {revenueGrowth.isPositive ? "+" : ""}
                    {revenueGrowth.value.toFixed(1)}%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  {revenueGrowth.isPositive
                    ? "Revenue growing"
                    : "Revenue dipped"}
                  {revenueGrowth.isPositive ? (
                    <TrendingUpIcon className="size-4" />
                  ) : (
                    <TrendingDownIcon className="size-4" />
                  )}
                </div>
                <div className="text-muted-foreground">
                  Compared to previous period
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* User Growth Chart */}
          {data.user_growth_chart && data.user_growth_chart.length > 0 && (
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">User Growth</CardTitle>
                  <CardDescription className="text-xs">
                    New user registrations over the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-0">
                  <ChartContainer
                    config={userGrowthConfig}
                    className="aspect-auto h-[200px] w-full"
                  >
                    <AreaChart data={data.user_growth_chart}>
                      <defs>
                        <linearGradient
                          id="fillUsers"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--chart-1)"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--chart-1)"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        minTickGap={32}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                          });
                        }}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            labelFormatter={(value) =>
                              new Date(value).toLocaleDateString("en-NG", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            }
                            indicator="dot"
                          />
                        }
                      />
                      <Area
                        dataKey="users"
                        type="natural"
                        fill="url(#fillUsers)"
                        stroke="var(--chart-1)"
                        stackId="a"
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Revenue Chart */}
          {data.revenue_chart && data.revenue_chart.length > 0 && (
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Revenue Trend</CardTitle>
                  <CardDescription className="text-xs">
                    Revenue performance over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-0">
                  <ChartContainer
                    config={revenueConfig}
                    className="aspect-auto h-[200px] w-full"
                  >
                    <AreaChart data={data.revenue_chart}>
                      <defs>
                        <linearGradient
                          id="fillRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--chart-2)"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--chart-2)"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        minTickGap={32}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            labelFormatter={(value) => String(value)}
                            formatter={(value) => [
                              formatRevenue(value as number),
                              "Revenue",
                            ]}
                            indicator="dot"
                          />
                        }
                      />
                      <Area
                        dataKey="revenue"
                        type="natural"
                        fill="url(#fillRevenue)"
                        stroke="var(--chart-2)"
                        stackId="a"
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Secondary stat cards */}
          <div className="grid grid-cols-2 gap-4 px-4 lg:px-6 @xl/main:grid-cols-4">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-4 gap-1">
                <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center mb-1">
                  <ClipboardListIcon className="h-4 w-4 text-amber-500" />
                </div>
                <span className="text-xl font-bold tabular-nums">
                  {data.driver_applications.pending}
                </span>
                <p className="text-[10px] text-muted-foreground">
                  Pending Applications
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {approvalRate.toFixed(0)}% approval rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-center justify-center p-4 gap-1">
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center mb-1">
                  <FileTextIcon className="h-4 w-4 text-blue-500" />
                </div>
                <span className="text-xl font-bold tabular-nums">
                  {data.support_tickets.open}
                </span>
                <p className="text-[10px] text-muted-foreground">
                  Open Tickets
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {data.support_tickets.total} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-center justify-center p-4 gap-1">
                <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center mb-1">
                  <FlagIcon className="h-4 w-4 text-destructive" />
                </div>
                <span className="text-xl font-bold tabular-nums">
                  {o.flagged_users + o.flagged_drivers}
                </span>
                <p className="text-[10px] text-muted-foreground">
                  Flagged Accounts
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {o.flagged_users} users · {o.flagged_drivers} drivers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-center justify-center p-4 gap-1">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                  <BellIcon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xl font-bold tabular-nums">
                  {o.unread_notifications}
                </span>
                <p className="text-[10px] text-muted-foreground">
                  Unread Notifications
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {o.total_admins} admins · {o.super_admins} super
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Ride & Booking Overview */}
          <div className="grid gap-4 px-4 lg:px-6 @xl/main:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CarIcon className="h-4 w-4 text-primary" />
                  Ride Overview
                </CardTitle>
                <CardDescription className="text-xs">
                  Breakdown of ride statuses
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Completed
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">
                      {o.completed_rides}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {rideCompletionRate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <XCircle className="h-3 w-3 text-destructive" />
                    Cancelled
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">
                      {o.cancelled_rides}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {o.total_rides > 0
                        ? ((o.cancelled_rides / o.total_rides) * 100).toFixed(1)
                        : 0}
                      %
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-amber-500" />
                    In Progress
                  </span>
                  <span className="text-xs font-medium">
                    {o.in_progress_rides}
                  </span>
                </div>
                <div className="pt-1">
                  <div className="h-2 w-full bg-muted overflow-hidden flex">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{
                        width: `${o.total_rides > 0 ? (o.completed_rides / o.total_rides) * 100 : 0}%`,
                      }}
                    />
                    <div
                      className="h-full bg-amber-500 transition-all"
                      style={{
                        width: `${o.total_rides > 0 ? (o.in_progress_rides / o.total_rides) * 100 : 0}%`,
                      }}
                    />
                    <div
                      className="h-full bg-destructive transition-all"
                      style={{
                        width: `${o.total_rides > 0 ? (o.cancelled_rides / o.total_rides) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileTextIcon className="h-4 w-4 text-primary" />
                  Booking Overview
                </CardTitle>
                <CardDescription className="text-xs">
                  Breakdown of booking statuses
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Completed
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">
                      {o.completed_bookings}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {o.total_bookings > 0
                        ? (
                            (o.completed_bookings / o.total_bookings) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <XCircle className="h-3 w-3 text-destructive" />
                    Cancelled
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">
                      {o.cancelled_bookings}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {o.total_bookings > 0
                        ? (
                            (o.cancelled_bookings / o.total_bookings) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-amber-500" />
                    Active
                  </span>
                  <span className="text-xs font-medium">
                    {o.active_bookings}
                  </span>
                </div>
                <div className="pt-1">
                  <div className="h-2 w-full bg-muted overflow-hidden flex">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{
                        width: `${o.total_bookings > 0 ? (o.completed_bookings / o.total_bookings) * 100 : 0}%`,
                      }}
                    />
                    <div
                      className="h-full bg-amber-500 transition-all"
                      style={{
                        width: `${o.total_bookings > 0 ? (o.active_bookings / o.total_bookings) * 100 : 0}%`,
                      }}
                    />
                    <div
                      className="h-full bg-destructive transition-all"
                      style={{
                        width: `${o.total_bookings > 0 ? (o.cancelled_bookings / o.total_bookings) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Support & Applications Summary */}
          <div className="grid gap-4 px-4 lg:px-6 @xl/main:grid-cols-3">
            {data.support_tickets.by_priority &&
              data.support_tickets.by_priority.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">
                      Tickets by Priority
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {data.support_tickets.total} total tickets
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-2">
                    {data.support_tickets.by_priority.map((item) => (
                      <div
                        key={item.priority}
                        className="flex items-center justify-between"
                      >
                        <span className="text-xs text-muted-foreground capitalize">
                          {item.priority}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {item.count}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

            {data.support_tickets.by_category &&
              data.support_tickets.by_category.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">
                      Tickets by Category
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Grouped by issue type
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-2">
                    {data.support_tickets.by_category.map((item) => (
                      <div
                        key={item.category}
                        className="flex items-center justify-between"
                      >
                        <span className="text-xs text-muted-foreground capitalize">
                          {item.category.replace(/_/g, " ")}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {item.count}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Driver Applications</CardTitle>
                <CardDescription className="text-xs">
                  This period&apos;s application stats
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Pending</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {data.driver_applications.pending}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Approved
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {data.driver_applications.approved_this_period}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Rejected
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {data.driver_applications.rejected_this_period}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Approval Rate
                  </span>
                  <span className="text-xs font-medium">
                    {approvalRate.toFixed(1)}%
                  </span>
                </div>
                <div className="pt-1">
                  <div className="h-2 w-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${approvalRate}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Summary */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShieldIcon className="h-4 w-4 text-primary" />
                  Platform Summary
                </CardTitle>
                <CardDescription className="text-xs">
                  Quick glance at platform health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                  <div className="text-center">
                    <p className="text-lg font-bold tabular-nums">
                      {o.total_admins}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Total Admins
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold tabular-nums">
                      {o.super_admins}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Super Admins
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold tabular-nums">
                      {o.average_rating}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Avg Rating
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold tabular-nums">
                      {o.inactive_drivers}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Inactive Drivers
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold tabular-nums">
                      {o.pending_applications}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Pending Apps
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold tabular-nums">
                      {o.total_bookings}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Total Bookings
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
