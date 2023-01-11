export async function delay(tryAgainIn: number) {
	await new Promise((resolve) => {
		setTimeout(resolve, tryAgainIn);
	});
}
