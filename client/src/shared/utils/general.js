export const truncateText = (text, length, reverse = false) => {
  if (reverse) {
    return text.length > length
      ? "..." + text.slice(text.length - length)
      : text;
  } else {
    return text.length > length ? text.slice(0, length) + "..." : text;
  }
};

export const camelCaseToStandardEnglish = (inputString) => {
  // Use a regular expression to insert a space before all capital letters
  // and convert the entire string to lowercase
  const result = inputString
    .replace(/([A-Z])/g, " $1")
    .toLowerCase()
    .trim();

  return result;
};

export const getMostRecentDate = (dates) => {
  /**
   * Takes an array of UTC date strings in the format "yyyy-mm-ddThh:mm:ss.ssssss" and returns the most recent date as a UTC Date object.
   * @param {Array} dates - An array of UTC date strings.
   * @returns {Date} The most recent date in UTC format.
   */
  // Convert each date string to a Date object and store in an array
  const dateObjects = dates.map((dateString) => new Date(dateString));

  // Use the reduce() method to find the maximum Date object in the array
  const maxDate = dateObjects.reduce(
    (max, date) => (date > max ? date : max),
    new Date(0)
  );

  // Return the maximum date as a UTC Date object
  return new Date(
    Date.UTC(
      maxDate.getFullYear(),
      maxDate.getMonth(),
      maxDate.getDate(),
      maxDate.getHours(),
      maxDate.getMinutes(),
      maxDate.getSeconds(),
      maxDate.getMilliseconds()
    )
  );
};
