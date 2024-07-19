import { ApiData } from '@/types/apiData';

export interface UserSauronUnitsResponsible extends ApiData {
  login: string
  units: string[]
}
