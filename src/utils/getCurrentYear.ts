/**
 * Get the current scholar year
 * @returns The current scholar year
 */

export default function getCurrentYear(): number {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  return currentMonth >= 1 && currentMonth <= 8 ? currentYear - 1 : currentYear;
}
