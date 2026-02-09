export function formatMagnitudeFull(n: number): string {
	const abs = Math.abs(n);

	if (abs >= 1e12) return (n / 1e12).toFixed(2).replace(/\.00$/, "") + "T";
	if (abs >= 1e9) return (n / 1e9).toFixed(2).replace(/\.00$/, "") + "B";
	if (abs >= 1e6) return (n / 1e6).toFixed(2).replace(/\.00$/, "") + "M";
	if (abs >= 1e3) return (n / 1e3).toFixed(2).replace(/\.00$/, "") + "k";
	if (abs >= 1) return n.toString(); // base number

	// Small units
	if (abs >= 1e-3) return (n * 1e3).toFixed(2).replace(/\.00$/, "") + "m"; // milli
	if (abs >= 1e-6) return (n * 1e6).toFixed(2).replace(/\.00$/, "") + "µ"; // micro

	return n.toString(); // extremely small fallback
}
