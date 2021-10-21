import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import ReduxUndo from "redux-undo";

import axios from "../../common/utils/api-interceptor";

const initialState = {
  status: "idle",
  error: null,
  values: null,
  textTokenMap: null,
};

const getTokenWidth = (value) => {
  // Token width (makes sure minimum width is supplied)
  let tokenWidth;
  const minTokenWidth = 60;
  const width = (value.length + 2) * 10;
  if (width < minTokenWidth) {
    tokenWidth = `${minTokenWidth}px`;
  } else {
    tokenWidth = `${width}px`;
  }
  return tokenWidth;
};

const getTokenClf = (tokenInfo, bgColourMap) => {
  // Determines the classification and colour of a given token
  // based on its meta tags and a background colour map
  // TODO: update to account for replacement and suggestions...

  const bgColourKey = Object.keys(tokenInfo.meta_tags).filter(
    (tag) => tokenInfo.meta_tags[tag]
  );
  const tokenBgColourKeySet = new Set(bgColourKey);
  const bgColourMapKeySet = new Set(Object.keys(bgColourMap));
  const keyIntersect = new Set(
    [...bgColourMapKeySet].filter((x) => tokenBgColourKeySet.has(x))
  );

  let clf;
  let colour;

  if (keyIntersect.size > 0) {
    clf = keyIntersect.values().next().value;
    colour = bgColourMap[clf];
  } else {
    clf = "ua";
    colour = bgColourMap["ua"];
  }

  return { ...tokenInfo, clf: clf, colour: colour };
};

export const patchSingleReplacement = createAsyncThunk(
  "/token/add/replace/single",
  async ({ tokenId, replacement, textId, bgColourMap }) => {
    const response = await axios.patch("/api/token/replace/add/single/", {
      token_id: tokenId,
      text_id: textId,
      replacement: replacement,
    });
    return {
      response: response.data,
      details: {
        tokenId: tokenId,
        replacement: replacement,
        bgColourMap: bgColourMap,
      },
    };
  }
);

export const tokenSlice = createSlice({
  name: "tokens",
  initialState: initialState,
  reducers: {
    addTokens: (state, action) => {
      state.textTokenMap = action.payload.textTokenMap;
      state.values = Object.assign(
        {},
        ...action.payload.tokens.flat().map((token) => ({ [token._id]: token }))
      );
    },
    updateAllTokenDetails: (state, action) => {
      // Can do without payload, but doing because easier for now.
      // Sets the tokens initial classification, background colour, currentvalue and width
      action.payload.token_ids.map((token_id) => {
        const tokenInfo = state.values[token_id];

        const updatedTokenInfo = getTokenClf(
          tokenInfo,
          action.payload.bgColourMap
        );

        const currentValue = tokenInfo.replacement
          ? tokenInfo.replacement
          : tokenInfo.suggested_replacement
          ? tokenInfo.suggested_replacement
          : tokenInfo.value;

        state.values[token_id] = {
          ...updatedTokenInfo,
          currentValue: currentValue,
          width: getTokenWidth(currentValue),
        };
      });
    },
    updateSingleTokenDetails: (state, action) => {
      const tokenInfo = state.values[action.payload.token_id];

      state.values[action.payload.token_id] = getTokenClf(
        tokenInfo,
        action.payload.bgColourMap
      );
    },
    updateCurrentValue: (state, action) => {
      // Updates current token value and it's associated width
      state.values[action.payload.token_id] = {
        ...state.values[action.payload.token_id],
        currentValue: action.payload.value,
        width: getTokenWidth(action.payload.value),
      };
    },
    addSingleReplacement: (state, action) => {
      // Patches the replacement value of a token and updates
      // the currentValue, classification, bgColour, and width.

      state.values[action.payload.token_id] = {
        ...state.values[action.payload.token_id],
        replacement: action.payload.replacement,
      };

      // Update clf and colour
      state.values[action.payload.token_id] = getTokenClf(
        state.values[action.payload.token_id],
        action.payload.bgColourMap
      );
    },
    addAllReplacements: (state, action) => {
      // Adds focus token replacement and suggests replacements
      // to all similar tokens in corpus
      const values = state.values;
      const replacementValue = action.payload.replacement;

      // Add replacement to focus token
      const focusUpdatedToken = {
        ...values[action.payload.token_id],
        replacement: replacementValue,
        currentValue: replacementValue,
      };

      // Update clf and colour
      state.values[action.payload.token_id] = getTokenClf(
        focusUpdatedToken,
        action.payload.bgColourMap
      );

      // Add suggestion to all other tokens of similar original value and don't have a
      // current replacement added..
      const originalValue = action.payload.originalValue;

      // Find tokens that match conditions
      const matchedTokenIds = Object.values(values)
        .filter((value) => !value.replacement && value.value === originalValue)
        .map((value) => value._id);

      console.log(matchedTokenIds);

      // Create update values dict
      const updatedValues = Object.assign(
        {},
        ...matchedTokenIds.map((id) => ({
          [id]: {
            ...values[id],
            currentValue: replacementValue,
            suggested_replacement: replacementValue,
          },
        }))
      );

      // Update token values state
      state.values = { ...state.values, ...updatedValues };

      // Update classifications and colours
      state.values = Object.assign(
        {},
        ...Object.keys(state.values).map((id) => {
          return {
            [id]: getTokenClf(state.values[id], action.payload.bgColourMap),
          };
        })
      );
    },
    removeSingleReplacement: (state, action) => {
      // Deletes replacement off of a single token and resets current token value
      // TODO: update to api call

      const updatedTokenInfo = {
        ...state.values[action.payload.token_id],
        replacement: null,
        currentValue: state.values[action.payload.token_id].value,
      };

      state.values[action.payload.token_id] = getTokenClf(
        updatedTokenInfo,
        action.payload.bgColourMap
      );
    },
    removeAllReplacements: (state, action) => {
      // New function (no api integration yet)
      // Removes replacements for tokens given original value and current replacement value
      // This accounts for n:1 normalisations. We don't want all n to get replaced.

      // Copy state
      const values = state.values;

      // Find tokens that match conditions
      const matchedTokenIds = Object.values(values)
        .filter(
          (value) =>
            value.replacement === action.payload.replacement &&
            value.value === action.payload.originalValue
        )
        .map((value) => value._id);
      // Create update values dict
      const updatedValues = Object.assign(
        {},
        ...matchedTokenIds.map((id) => ({
          [id]: {
            ...values[id],
            replacement: null,
            currentValue: values[id].value,
          },
        }))
      );

      // Update token values state
      state.values = { ...state.values, ...updatedValues };

      // Update classifications and colours
      state.values = Object.assign(
        {},
        ...Object.keys(state.values).map((id) => {
          return {
            [id]: getTokenClf(state.values[id], action.payload.bgColourMap),
          };
        })
      );
    },
    acceptSingleSuggestedReplacement: (state, action) => {
      // Accepts a single suggested replacement
      state.values[action.payload.token_id] = {
        ...state.values[action.payload.token_id],
        suggested_replacement: null,
        replacement: action.payload.suggested_value,
      };
    },
    acceptAllSuggestedReplacements: (state, action) => {
      // New function (no api integration yet)
      // accepts all suggested replacement for all tokens of similar value

      // Copy state
      const values = state.values;

      // Find tokens that match conditions
      const matchedTokenIds = Object.values(values)
        .filter(
          (value) =>
            value.suggested_replacement ===
              action.payload.suggestedReplacement &&
            value.value === action.payload.originalValue
        )
        .map((value) => value._id);

      // Create update values dict
      const updatedValues = Object.assign(
        {},
        ...matchedTokenIds.map((id) => ({
          [id]: {
            ...values[id],
            replacement: action.payload.suggestedReplacement,
            suggested_replacement: null,
            currentValue: action.payload.suggestedReplacement,
          },
        }))
      );

      // Update token values state
      state.values = { ...state.values, ...updatedValues };

      // Update classifications and colours
      state.values = Object.assign(
        {},
        ...Object.keys(state.values).map((id) => {
          return {
            [id]: getTokenClf(state.values[id], action.payload.bgColourMap),
          };
        })
      );
    },
    removeSingleSuggestedReplacement: (state, action) => {
      // Removes a single suggested replacement
      state.values[action.payload.token_id] = {
        ...state.values[action.payload.token_id],
        suggested_replacement: null,
        currentValue: action.payload.value,
      };
    },
    removeAllSuggestedReplacements: (state, action) => {
      // New function (no api integration yet)
      // Removes suggested replacements for tokens given original value and current suggested value
      // This accounts for n:1 normalisations. We don't want all n to get replaced.

      // Copy state
      const values = state.values;

      // Find tokens that match conditions
      const matchedTokenIds = Object.values(values)
        .filter(
          (value) =>
            value.suggested_replacement ===
              action.payload.suggestedReplacement &&
            value.value === action.payload.originalValue
        )
        .map((value) => value._id);

      // Create update values dict
      const updatedValues = Object.assign(
        {},
        ...matchedTokenIds.map((id) => ({
          [id]: {
            ...values[id],
            suggested_replacement: null,
            currentValue: values[id].value,
          },
        }))
      );

      // Update token values state
      state.values = { ...state.values, ...updatedValues };

      // Update classifications and colours
      state.values = Object.assign(
        {},
        ...Object.keys(state.values).map((id) => {
          return {
            [id]: getTokenClf(state.values[id], action.payload.bgColourMap),
          };
        })
      );
    },
    applySingleTokenization: (state, action) => {
      // Applies tokenization to text
      // This logic is derived from applyTokens() in Tokenize.js
      // TODO: integrate with api

      const values = state.values;

      const originalTokenIds = action.payload.originalTokenIds;
      const tokenIndexes = action.payload.tokenIndexes;
      const tokenIndexGroups = action.payload.tokenIndexGroups;
      const newTokenIds = action.payload.newTokenIds;
      console.log("nanoids", newTokenIds);

      console.log("original token ids", originalTokenIds);
      console.log("token indexes", tokenIndexes);
      console.log("token index groups", tokenIndexGroups);

      // Get tokens to change (tc) and to keep (tk)
      const textIndexes = new Set(
        Object.values(originalTokenIds).map(
          (token_id) => values[token_id].index
        )
      );

      console.log("original token indexes", textIndexes);

      const tokenIndexesTK = Array.from(
        new Set([...textIndexes].filter((i) => !tokenIndexes.has(i)))
      );
      console.log("original tokens to keep (tk)", tokenIndexesTK);

      // !Here is where some of the server process is brought to the client

      // Combine tokens to change (tc) and get their positions
      const tokenIndexesGroupsTC = Array.from(tokenIndexGroups);
      console.log("token index groups to change (tc)", tokenIndexesGroupsTC);

      // Get the first index of each tokenization pieces group
      // This is used to insert the new token from pieces.
      const tokenIndexesTC = tokenIndexesGroupsTC.map((group) => group[0]);
      // Get values associated with indexes of token pieces in piece groups
      let tokenValuesTC = tokenIndexesGroupsTC.map((group) =>
        group.map((index) => values[originalTokenIds[index]].value)
      );

      console.log("token piece groups with values", tokenValuesTC);

      // We want to combine the tokens into one for each group of
      // token pieces.
      tokenValuesTC = tokenValuesTC.map((group) => group.join(""));
      console.log("token piece groups after joins", tokenValuesTC);

      // Create new token objects to add to values state
      // TODO: Cannot do the en map mapping on client side as enMap isn't available

      const newTokenList = tokenValuesTC.map((token, index) => {
        return {
          _id: newTokenIds[index],
          value: token,
          meta_tags: { en: true }, // TODO: need to find resolution
          replacement: null, // TODO: maybe there are replacements available?
          suggested_replacement: null,
          project_id: null, //TODO: is this even necessary anymore?
          currentValue: token,
          index: tokenIndexesTC[index],
          width: "60px", // TODO: make this based off of value
        };
      });

      console.log("list of new token objects", newTokenList);

      // Build token array, assign indices and update text
      // - these are original tokens that remain unchanged, filtered by their
      //   index
      const oTokenIds = Object.values(originalTokenIds).filter((_, index) =>
        tokenIndexesTK.includes(index)
      );
      const oTokens = oTokenIds.map((token_id) => values[token_id]);
      console.log("original tokens", oTokens);

      // Add new tokens
      // ....

      console.log(tokenIndexesTK, tokenIndexesTC);

      // Combine token information into single array
      let allTokens = [...oTokens, ...newTokenList];

      console.log("combined tokens", allTokens);

      // Sort array in order of index
      allTokens = allTokens.sort((a, b) => a.index - b.index);

      console.log("sorted tokens", allTokens);

      // Update indexes based on current ordering
      allTokens = allTokens.map((token, newIndex) => ({
        ...token,
        index: newIndex,
      }));

      console.log("arranged index tokens", allTokens);

      // Update values and textTokenMap
      const updatedValues = Object.assign(
        {},
        ...allTokens.map((token) => ({
          [token._id]: {
            ...token,
          },
        }))
      );

      console.log(updatedValues);

      // Update token values state
      state.values = { ...state.values, ...updatedValues };

      // Insert textToToken map back into state in the correct
      // index as it originall way...

      const textTokenMapIndex = state.textTokenMap.findIndex(
        (item) => item.text_id === action.payload.textId
      );
      console.log("textTokenMapIndex", textTokenMapIndex);

      state.textTokenMap[textTokenMapIndex] = state.textTokenMap
        .filter((item) => item.text_id === action.payload.textId)
        .map((item) => ({
          ...item,
          token_ids: allTokens.map((token) => token._id),
        }))[0];

      // Update tokenization history...
    },
  },
  extraReducers: (builder) => {
    builder.addCase(patchSingleReplacement.fulfilled, (state, action) => {
      const details = action.payload.details;

      state.values[details.tokenId] = {
        ...state.values[details.tokenId],
        replacement: details.replacement,
      };

      // Update clf and colour
      state.values[details.tokenId] = getTokenClf(
        state.values[details.tokenId],
        details.bgColourMap
      );
    });
  },
});

export const {
  addTokens,
  addSingleReplacement,
  addAllReplacements,
  acceptSingleSuggestedReplacement,
  acceptAllSuggestedReplacements,
  applySingleTokenization,
  updateSingleTokenDetails,
  updateAllTokenDetails,
  updateCurrentValue,
  removeSingleReplacement,
  removeAllReplacements,
  removeSingleSuggestedReplacement,
  removeAllSuggestedReplacements,
} = tokenSlice.actions;

export const selectTextTokenMap = (state) => state.tokens.textTokenMap;
export const selectTokenValues = (state) => state.tokens.values;

export default tokenSlice.reducer;
