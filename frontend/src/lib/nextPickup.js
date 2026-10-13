const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const parseWindow = (time) => {
  const m = String(time).match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!m) return { start: 6 * 60, end: 9 * 60 };
  return { start: +m[1] * 60 + +m[2], end: +m[3] * 60 + +m[4] };
};

const runsOn = (days, dayName) => days.includes('Daily') || days.includes(dayName);

/** Next pickup from `now` -> { date, label, active } */
export function nextPickup(route, now = new Date()) {
  const { start, end } = parseWindow(route.collectionTime);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (let offset = 0; offset <= 7; offset++) {
    const d = new Date(now);
    d.setDate(now.getDate() + offset);
    if (!runsOn(route.collectionDays, DAYS[d.getDay()])) continue;
    if (offset === 0 && nowMin >= start && nowMin < end) return { date: now, label: 'Collecting now', active: true };
    if (offset === 0 && nowMin >= end) continue;
    d.setHours(Math.floor(start / 60), start % 60, 0, 0);
    const hrs = (d - now) / 36e5;
    let label;
    if (hrs < 1) label = `Next pickup in ${Math.max(1, Math.round(hrs * 60))} min`;
    else if (hrs < 24) label = `Next pickup in ${Math.round(hrs)} hr${Math.round(hrs) === 1 ? '' : 's'}`;
    else {
      const days = Math.round(hrs / 24);
      label = `Next pickup in ${days} day${days === 1 ? '' : 's'}`;
    }
    return { date: d, label, active: false };
  }
  return { date: null, label: 'Schedule unavailable', active: false };
}

/** Upcoming 7 days for the timeline */
export function weekSchedule(route, now = new Date()) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    return {
      key: i,
      day: DAYS[d.getDay()],
      date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      pickup: runsOn(route.collectionDays, DAYS[d.getDay()]),
      today: i === 0,
    };
  });
}
