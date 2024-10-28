const checkValid = (arr) => arr.every(Boolean);

export const ValidateCreateDetails = (projectName, projectDescription) => {
  const validName = projectName !== "";
  const validDescription = projectDescription !== "";
  return checkValid([validName, validDescription]);
};

export const ValidateCreateSchema = () => {
  return true;
};

export const ValidateCreateUpload = (corpus) => {
  if (typeof corpus === "object" && corpus !== null && !Array.isArray(corpus)) {
    return true;
  }
  return false;
};

export const ValidateCreatePreannotation = () => {
  return true;
};

export const ValidateCreateReview = (
  detailsValid,
  schemaValid,
  uploadValid,
  preannotationValid,
  replacementsValid
) => {
  return checkValid([
    detailsValid,
    schemaValid,
    uploadValid,
    preannotationValid,
    replacementsValid,
  ]);
};

export const ValidateCreateReplacements = (json, setError = () => {}) => {
  try {
    const obj = JSON.parse(json);
    const keys = Object.keys(obj);

    // Check for single-word keys
    const hasInvalidKeys = keys.some((key) => key.includes(" "));

    if (hasInvalidKeys) {
      setError("Keys must be single words without spaces.");
      return false;
    }

    setError("");
    return true;
  } catch (e) {
    setError("Invalid JSON format.");
    return false;
  }
};
