const logger = require("../../logger");

module.exports = {
  removeSpecialChars: (charsToRemove, text) => {
    /**
     * @param {String}  charsToRemove String of special characters to remove
     * @param {String}  text
     */
    // Set of special characters that need regex escaping
    const escapedChars = [
      "[",
      "]",
      "{",
      "}",
      "(",
      ")",
      "*",
      "+",
      "?",
      "|",
      "^",
      "$",
      ".",
      "\\",
    ];

    const regexCharsEscaped = charsToRemove
      .split("")
      .map((char) => (escapedChars.includes(char) ? `\\${char}` : char));
    const regex = new RegExp("[" + regexCharsEscaped + "]", "g");

    return text.replace(regex, " ");
  },
  removeTabs: (text) => {
    return text.replace("\t", " ");
  },
  removeCasing: (removeCasing, text) => {
    return removeCasing ? text.toLowerCase() : text;
  },
  removeWhiteSpace: (text) => {
    return text.replace(/\s+/g, " ").trim();
  },
  removeDuplicates: (remove, texts) => {
    /**
     * @param {Boolean} remove Choice to remove duplicates
     * @param {Array} texts Array of text objects
     * @returns {Array} filteredTexts Array of text objects [{text: '', ids: []}]
     */
    let filteredTexts;
    if (remove) {
      filteredTexts = Object.entries(texts).reduce((dupes, [id, text]) => {
        if (dupes[text]) {
          dupes[text].push(id);
        } else {
          dupes[text] = [id];
        }
        return dupes;
      }, {});
      filteredTexts = Object.keys(filteredTexts).map((text) => ({
        text: text,
        ids: filteredTexts[text],
      }));
    } else {
      filteredTexts = Object.entries(texts).map(([id, text]) => ({
        text: text,
        ids: [id],
      }));
    }
    logger.info("Text pre-processing: Removed duplicates");
    return filteredTexts;
  },
  calculateTFIDF: (texts) => {
    /**
     *  @param {Array}  texts   Array of text objects
     */
    let counts = {};
    let keys = [];
    for (var i = 0; i < texts.length; i++) {
      var text = texts[i].original.split(" ");

      for (var j = 0; j < text.length; j++) {
        var token = text[j];
        if (counts[token] === undefined) {
          counts[token] = {
            tf: 1,
            df: [i], // used to capture index of texts term appears in
          };
          keys.push(token);
        } else {
          counts[token].tf = counts[token].tf + 1;
          if (!counts[token].df.includes(i)) {
            counts[token].df.push(i);
          }
        }
      }
    }
    // console.log(new Date(Date.now()).toLocaleString(), "built tf-idf matrices");

    // Aggregate doc counts into df e.g. {key: {tf: #, df #}}
    Object.keys(counts).map(
      (key) => (
        (counts[key].tf = counts[key].tf),
        (counts[key].df = counts[key].df.length)
      )
    );
    // console.log(new Date(Date.now()).toLocaleString(), "aggregated counts");

    // Compute tf-idf scores for each token; not assignment is used to flatten array of objects.
    // console.log('tokenized texts length', tokenizedTexts.length)
    const tfidfs = Object.assign(
      ...Object.keys(counts).map((key) => ({
        [key]:
          counts[key].tf === 0 || texts.length / counts[key].df === 0
            ? 0
            : counts[key].tf * Math.log10(texts.length / counts[key].df),
      }))
    );
    // console.log(
    //   new Date(Date.now()).toLocaleString(),
    //   "- Calculated tf-idf weights"
    // );

    logger.info(tfidfs);
    return tfidfs;
  },
};
