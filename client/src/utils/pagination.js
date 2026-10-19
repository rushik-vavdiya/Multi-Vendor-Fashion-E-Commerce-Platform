// Which page numbers a pager shows.
//
// The current page with one neighbour on each side, plus the first and last, so
// a long catalog reads « 1 … 4 5 6 … 12 » instead of a wall of numbers. Gaps are
// returned as the string "gap" for the caller to draw as an ellipsis.
const WINDOW = 1;

export function pageWindow(page, pages) {
  const wanted = new Set([1, pages]);

  for (let offset = -WINDOW; offset <= WINDOW; offset += 1) {
    const candidate = page + offset;
    if (candidate >= 1 && candidate <= pages) wanted.add(candidate);
  }

  const sorted = [...wanted].sort((a, b) => a - b);
  const rows = [];

  sorted.forEach((number, index) => {
    if (index > 0 && number - sorted[index - 1] > 1) rows.push('gap');
    rows.push(number);
  });

  return rows;
}
