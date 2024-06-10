import getCurrentYear from "@/utils/getCurrentYear"

/**
 * Get the TEK year from the promotion year
 * @param promotionYear - The promotion year (1, 2, 3, 4, 5)
 * @param cursusNbYear - The number of year in the cursus (default 5)
 * @returns The TEK year
 */
export default function getTekYearFromPromotion(
  promotionYear: number,
  cursusNbYear: number = 5
): number {
  const baseYear = getCurrentYear()
  return cursusNbYear + 1 - (promotionYear - baseYear)
}
