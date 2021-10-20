import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
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
  },
});

export const {
  addTokens,
  addSingleReplacement,
  addAllReplacements,
  acceptSingleSuggestedReplacement,
  acceptAllSuggestedReplacements,
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
