export interface MealItem {
    "id": number,
    "name": string,
    "nutrition": Array<NUTRITION>,
    "ingredients": Array<string>
}

export interface CookableMeal {
    "name": string, 
    "nutrition": Array<NUTRITION>
}

export interface OrderItem {
    id: number, 
    order:number
}

export enum NUTRITION {
    A = "A",
	B = "B",
	C = "C",
	D = "D",
	E = "E",
	F = "F",
	G = "G"
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
        order?: number,
        message: string
    }
}