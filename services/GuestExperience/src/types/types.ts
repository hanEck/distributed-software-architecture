export interface Menu {
    guest: number, 
    food: MenuItem[], 
    drinks: MenuItem[]
}
export interface MenuItem { 
    id: number; 
    name: string; 
    nutrition: string[]; 
    price: number; 
}

export interface PriceItem {
    id: number;
    price: number;
}

export enum NUTRITION {
    A = "A",
	B = "B",
	C = "C",
	D = "D",
	E = "E",
	F = "F",
	G = "G",
    H = "H"
}

export enum LOG_TYPE {
    INFO = "INFO",
    WARN = "WARN",
    DEBUG = "DEBUG",
    ERROR = "ERROR"
}
// turn this into a ts interface
export interface Log {
    type: LOG_TYPE,
    timestamp: number,
    serviceName: string,
    event: {
        method: string,
        order: number,
        message: string
    }
}