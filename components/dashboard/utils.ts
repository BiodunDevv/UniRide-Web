export const formatRevenue = (value: string | number) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "₦0";
  if (num >= 1_000_000) return `₦${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `₦${(num / 1_000).toFixed(1)}K`;
  return `₦${num.toLocaleString()}`;
};

export const formatNumber = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
};

export const parseGrowth = (val: string) => {
  const num = parseFloat(val);
  return { value: isNaN(num) ? 0 : num, isPositive: !isNaN(num) && num >= 0 };
};

export const periodLabels: Record<string, string> = {
  "7days": "Last 7 days",
  "30days": "Last 30 days",
  "90days": "Last 90 days",
  year: "This year",
  all: "All time",
};
