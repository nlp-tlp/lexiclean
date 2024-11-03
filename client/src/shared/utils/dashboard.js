import { camelCaseToStandardEnglish } from "./general";

export const downloadFile = ({ data, name }) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `${name.slice(0, 25).replace(" ", "_")}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getReadableString = (variableName) => {
  // Check for a manual mapping first
  const manualMapping = {
    specialTokens: "special tokens",
    parallelCorpus: "parallel corpus",
    createdAt: "created on",
    removeLowerCase: "Casing removed",
    removeDuplicates: "Duplicates removed",
    digitsIV: "Digits are in-vocabulary",
    removeChars: "Characters removed",
  };

  // Return the manual mapping if it exists
  if (manualMapping[variableName]) {
    return manualMapping[variableName];
  }

  // Otherwise, use the automated conversion
  return camelCaseToStandardEnglish(variableName);
};

export const getColor = (value) => {
  // Define start and end colors in RGB
  const startColor = { r: 244, g: 67, b: 54 }; // MUI Red
  const endColor = { r: 0, g: 150, b: 136 }; // MUI Teal

  // Calculate the ratio (0.0 to 1.0) based on the input value
  const ratio = value / 100;

  // Linearly interpolate between the start and end colors
  const r = Math.round(startColor.r + ratio * (endColor.r - startColor.r));
  const g = Math.round(startColor.g + ratio * (endColor.g - startColor.g));
  const b = Math.round(startColor.b + ratio * (endColor.b - startColor.b));

  // Return the interpolated color in RGB format
  return `rgb(${r}, ${g}, ${b})`;
};

export const getContrastYIQ = (rgb) => {
  // Extract the RGB values from the input
  const values = rgb.match(/\d+/g).map(Number); // Assuming rgb is in "rgb(r, g, b)" format
  const [r, g, b] = values;

  // Calculate the YIQ value, based on the formula: YIQ = (299*R + 587*G + 114*B)/1000
  // This formula takes into account human eye sensitivity to different colors.
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  // Return black for bright colors, white for dark colors based on the YIQ value
  return yiq >= 128 ? "black" : "white";
};
