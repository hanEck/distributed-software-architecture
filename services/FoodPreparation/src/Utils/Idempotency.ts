export default class Idempotency {
    receivedMessages: string[] = [];
    checkMessage(id: string): boolean {
        if(id === undefined) { return true}
        if(this.receivedMessages.includes(id)) {
            return false;
        } else {
            this.receivedMessages.push(id);
            return true;
        }
    }
}