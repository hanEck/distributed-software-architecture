export interface ReceivedOrderInformation {
    guest: number;
    order: number;
    food: number[];
    drinks: number[];
};
export interface GuestWithOrders {
    guest: number,
    orders: Order[]
}
export interface GuestWithOrder {
    guest: number,
    Order: Order
}
export interface Order {
    order: number,
    food: number[],
    drinks: number[]
}
export interface PreparedFood {
    order: number,
    food: number
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