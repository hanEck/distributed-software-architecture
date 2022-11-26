export async function delay(tryAgainIn: number) {
	await new Promise((resolve) => {
		setTimeout(resolve, tryAgainIn);
	});
}

export function getFibonacciSequence(desiredLength = 3) {
	// leave out first two numbers
	let seq = [1, 2];

	for (let i = 2; i <= ( desiredLength - 1 ); i++) {
		seq.push(seq[i - 2] + seq[i - 1]);
	}
	return seq;
}