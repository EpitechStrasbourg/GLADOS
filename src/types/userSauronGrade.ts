import { ApiData } from '@/types/apiData';

export interface Module {
    code_module: string;
    name: string;
}

export interface Instance {
    city_code: string;
    module: Module;
    code_instance: string;
    year: number;
    start: Date;
    end: Date;
    end_register: Date;
    max_registered: null;
}

export interface Result {
    login: string;
    instance: Instance;
    credits: number;
    grade: string;
}

export interface SauronGradesRequest extends ApiData {
    count: number;
    results: Result[];
}
