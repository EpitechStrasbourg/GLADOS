export interface City {
    code: string;
    name: string;
}
export interface Promo {
    city: City;
    cursus: City;
    promotion_year: number;
    subpromo: string;
}

export interface AdditionalInfos {
}
export interface Student {
    promo: Promo;
    login: string;
    semester: string;
    gpa: string;
    additional_infos: AdditionalInfos;
}

export interface Unit {
    unit: string;
    credits: number;
    scolaryear: number;
}

export interface Roadblock {
    failed: number;
    is_state: boolean;
    obtained: number;
    inprogress: number;
    is_not_alert?: boolean;
    min_required: number;
    units?: Unit[];
}

export interface Roadblocks {
    tepitech: Roadblock;
    innovation: Roadblock;
    softskills: Roadblock;
    duo_stumper: Roadblock;
    solo_stumper: Roadblock;
    total_credits: Roadblock;
    technical_foundation: Roadblock;
    technical_supplement: Roadblock;
    professional_writings: Roadblock;
}
export interface RoadblocksResult {
    student: Student;
    roadblocks: Roadblocks;
    alerts: any[];
}
export interface SauronRoadblocksRequest {
    count: number;
    next: null;
    previous: null;
    results: RoadblocksResult[];
}
