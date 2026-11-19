const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export function formatRupiah(amount: number): string {
  const rounded = Math.max(0, Math.round(amount));
  return `Rp ${String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

export function formatKm(distance: number): string {
  const rounded = Math.round(distance * 100) / 100;
  const text = rounded
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1");

  return `${text.replace(".", ",")} km`;
}

export function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${hours}.${minutes}`;
}

export function formatTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${String(date.getHours()).padStart(2, "0")}.${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}
