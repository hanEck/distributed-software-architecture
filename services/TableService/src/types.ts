export interface Order { 
    guest: number, 
    food: number[], 
    drinks: number[], 
    order: number
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
