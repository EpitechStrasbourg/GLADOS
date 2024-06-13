import getCurrentYear from '@/utils/getCurrentYear';

/**
 * Get the promotion year from the TEK year
 * @param tekYear - The TEK year
 * @param cursusNbYear - The number of year in the cursus (default 5)
 * @returns The promotion year
 */
export default function getPromotionFromTekYear(tekYear: number, cursusNbYear: number = 5): number {
  return getCurrentYear() + cursusNbYear - tekYear + 1;
}
