function formatDate(date){
    const year = date.getFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(date.getUTCDate()).padStart(2, '0');
    // Format the date as YYYY-MM-DD
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}


export {formatDate};