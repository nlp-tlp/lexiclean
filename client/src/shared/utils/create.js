export const getCorpusLength = (corpus) => {
  return Object.keys(corpus).length;
};

export const normaliseSpecialTokens = (specialTokens) => {
  /**
   * Splits list of special tokens on comma
   */
  return specialTokens
    .split(",")
    .map((i) => i.trim())
    .filter((n) => n); // remove empty items (e.g. if trailing , on input)
};

export const getContrastTextColor = (hexColor) => {
  if (hexColor.indexOf("#") === 0) {
    hexColor = hexColor.slice(1);
  }

  // Convert 3-digit hex color to 6-digits.
  if (hexColor.length === 3) {
    hexColor =
      hexColor[0] +
      hexColor[0] +
      hexColor[1] +
      hexColor[1] +
      hexColor[2] +
      hexColor[2];
  }

  const r = parseInt(hexColor.substring(0, 2), 16) / 255;
  const g = parseInt(hexColor.substring(2, 4), 16) / 255;
  const b = parseInt(hexColor.substring(4, 6), 16) / 255;

  // Calculating the relative luminance of the color.
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // Return white for dark colors and black for light colors.
  return luminance < 0.5 ? "#FFFFFF" : "#000000";
};
