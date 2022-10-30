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