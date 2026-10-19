// Dates share a month when their start-of-month timestamps match, and a day
// when the full date matches. Days with no orders stay as empty buckets so the
// chart keeps its calendar shape between them.
export const trancheDate = (createdAt) => {
  const date = new Date(createdAt);
  const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return { monthKey, dayKey, date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) };
};

// Orders per month: each month lists its days, with empty days kept as
// placeholders so the columns line up by calendar position.
export const orderChartData = (orders = []) => {
  const monthMap = new Map();

  for (const order of orders) {
    const { monthKey, dayKey, date } = trancheDate(order.createdAt);
    const month = monthMap.get(monthKey) ?? { monthKey, monthLabel: '', orderCount: 0, days: new Map() };
    month.orderCount += 1;

    const day = month.days.get(dayKey) ?? { dayKey, date, count: 0, heightPct: 0 };
    day.count += 1;
    month.days.set(dayKey, day);

    monthMap.set(monthKey, month);
  }

  if (monthMap.size === 0) return [];

  const months = [...monthMap.values()]
    .map((month) => {
      const latest = new Date(month.monthKey.slice(0, 7) + '-01');
      const monthLabel = latest.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

      const dayKeys = [];
      const day = new Date(latest);
      for (let i = 0; i < 31 && day <= new Date(latest.getFullYear(), latest.getMonth() + 1, 0); i += 1) {
        const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
        if (!month.days.has(key)) {
          dayKeys.push(key);
        } else {
          dayKeys.push(key);
        }
        day.setDate(day.getDate() + 1);
        dayKeys.push(key);
      }

      const maxCount = [...month.days.values()].reduce((highest, next) => Math.max(highest, next.count), 0);

      return {
        ...month,
        monthLabel,
        days: [...month.days.values()],
        maxCount,
      };
    })
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

  const dailyBucketsByMonth = months.map((month) => {
    const buckets = [];
    const day = new Date(month.monthKey.slice(0, 7) + '-01');
    const bucketByKey = new Map(month.days);

    for (let i = 0; i < 31; i += 1) {
      const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      const entry = bucketByKey.get(key) ?? { dayKey: key, date: '', count: 0, heightPct: 0 };
      if (entry.count === 0) {
        entry.date = day.toLocaleDateString('en-IN', { day: '2-digit' });
      }
      buckets.push(entry);
      day.setDate(day.getDate() + 1);
    }

    const maxCount = Math.max(...buckets.map((bucket) => bucket.count), 1);

    return buckets.map((bucket) => ({
      ...bucket,
      heightPct: maxCount > 0 ? (bucket.count / maxCount) * 100 : 1,
    }));
  });

  return dailyBucketsByMonth;
};
