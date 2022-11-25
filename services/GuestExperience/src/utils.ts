export function delay(timeoutInMS: number) {
    return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), timeoutInMS);
    });
}

export async function getPossibleDelay() {
    const propability = parseFloat(process.env.OVERWORKED_MANAGER) || 0.1;
    const delayTime = parseInt(process.env.OVERWORKED_MANAGER_DELAY, 10) || 60;

    if(Math.random() < propability) {
        console.log("Manager: I'm working... I need more time")
        await delay(delayTime*1000)
    }
}

export function isEmptyObject (obj: any) {
    return JSON.stringify(obj) === '{}';
}

