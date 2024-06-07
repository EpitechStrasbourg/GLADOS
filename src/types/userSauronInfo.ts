export interface City {
  code: string
  name: string
}

export type roles = "dpr" | "pedago" | "units_responsible" | "admin" | "student"

export interface UserSauronInfo extends ApiData {
  login: string
  cities: City[]
  roles: roles[]
  promo?: {
    city: City
    cursus: {
      code: string
      name: string
    }
    promotion_year: number
    subpromo: string
  }
  is_active?: boolean
  firstname?: string
  lastname?: string
}
