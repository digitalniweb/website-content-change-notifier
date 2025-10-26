export default function truncate(str: string, length = 20) {
	return str.length > length ? str.slice(0, length) + "…" : str;
}
