import { setStepData } from "../../createStepSlice";

/**
 * Function for parsing files of .csv, .txt and .json type
 * @param {Dispatch}    dispatch   redux dispatch constructor
 * @param {Object}      fileMeta   metadata associated with input file
 * @param {String}      type       type of file being uploaded (corpus_no_ids, corpus_w_ids, replacements)
 */
export const readFile = (dispatch, fileMeta, type) => {
  let reader = new FileReader();
  reader.readAsText(fileMeta);
  reader.onload = () => {
    const fileExt = fileMeta.name.split(".").slice(-1)[0];

    switch (type) {
      case "corpus_no_ids":
        if (fileExt === "txt") {
          const texts = reader.result.split("\n").filter((line) => line !== "");

          dispatch(
            setStepData({
              corpus: Object.assign(
                {},
                ...texts.map((text, index) => ({ [index]: text }))
              ),
              corpusFileName: fileMeta.name,
              corpusHasIds: false,
            })
          );
        }
        break;
      case "corpus_w_ids":
        if (fileExt === "csv") {
          // Process CSV by splitting on \n and then splitting on commas
          // Skips empty rows
          const rowsObject = reader.result
            .split("\n")
            .filter((line) => line !== "")
            .map((line) => ({
              [line.split(",")[0].trim()]: line
                .split(",")
                .slice(1)
                .join(",")
                .trim(),
            }));

          // Combine row objects into { id: document } objects
          const csvData = Object.assign({}, ...rowsObject);

          dispatch(
            setStepData({
              corpus: csvData,
              corpusFileName: fileMeta.name,
              corpusHasIds: true,
            })
          );
        }
        break;
      case "replacements":
        if (fileExt === "json") {
          // JSON is read as a string - converts to Object
          dispatch(
            setStepData({
              replacements: JSON.parse(reader.result),
              replacementFileName: fileMeta.name,
            })
          );
        } else if (fileExt === "csv") {
          // Process CSV by splitting on \n and then splitting on commas
          // Skips empty rows
          // Rows will the be used to build
          const rowsObject = reader.result
            .split("\n")
            .filter((line) => line !== "")
            .map((line) => ({
              [line.split(",")[0].trim()]: line
                .split(",")
                .slice(1)
                .join(",")
                .trim(),
            }));

          // Combine row objects into { str2: str1} objects
          const csvData = Object.assign({}, ...rowsObject);

          dispatch(
            setStepData({
              replacements: csvData,
              replacementFileName: fileMeta.name,
            })
          );
        }
        break;
      default:
        console.error("Something went wrong reading file");
    }
  };
  reader.onloadend = () => {
    reader = new FileReader();
  };
};
