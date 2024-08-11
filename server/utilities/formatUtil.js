/**
 * The function formatDate takes a date object as input and returns a formatted date string in the
 * format YYYY-MM-DD.
 * @param date - The `formatDate` function takes a `Date` object as a parameter and formats it into a
 * string in the format "YYYY-MM-DD". The function extracts the year, month, and day components from
 * the `Date` object and pads the month and day with leading zeros if necessary to ensure a
 * @returns The `formatDate` function returns a formatted date string in the format "YYYY-MM-DD".
 */
function formatDate(date) {
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-indexed
	const day = String(date.getUTCDate()).padStart(2, '0');
	// Format the date as YYYY-MM-DD
	const formattedDate = `${year}-${month}-${day}`;
	return formattedDate;
}

export { formatDate };