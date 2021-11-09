import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import ReduxUndo from "redux-undo";

import axios from "../utils/api-interceptor";

const initialState = {
  status: "idle",
  error: null,
  values: null,
  textTokenMap: null,
  showToast: false,
  toastInfo: { type: null, content: null },
  tokenizeTextId: null,
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

  // Check if token has a meta-tag assigned, if so (and no suggested or replacement),
  // then assign latest tag colour
  const bgColourKey = Object.keys(tokenInfo.meta_tags)
    .filter((tag) => tag !== "en")
    .filter((tag) => tokenInfo.meta_tags[tag]);
  const tokenBgColourKeySet = new Set(bgColourKey);
  const bgColourMapKeySet = new Set(Object.keys(bgColourMap));
  const keyIntersect = new Set(
    [...bgColourMapKeySet].filter((x) => tokenBgColourKeySet.has(x))
  );

  // console.log("bgColourKey", bgColourKey);
  // console.log("tokenclf", tokenInfo);

  let clf;
  let colour;
  if (bgColourKey.length === 0) {
    // No meta-tags or only en (applied automatically), figure out what clf currently exists
    clf = tokenInfo.replacement
      ? "rp"
      : tokenInfo.suggested_replacement
      ? "st"
      : tokenInfo.meta_tags["en"]
      ? "en"
      : "ua";
    colour = bgColourMap[clf];
  } else {
    clf = keyIntersect.values().next().value;
    colour = bgColourMap[clf];
  }

  // console.log(clf, colour);

  // Get token contrast ratio (tests white against colour) if < 4.5 then sets font color to black
  let fontColour;

  if (!["en", "rp", "ua", "st"].includes(clf)) {
    const hexToRgb = (hex) =>
      hex
        .replace(
          /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
          (m, r, g, b) => "#" + r + r + g + g + b + b
        )
        .substring(1)
        .match(/.{2}/g)
        .map((x) => parseInt(x, 16));

    const luminance = (r, g, b) => {
      let a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    const contrast = (rgb1, rgb2) => {
      let lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
      let lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
      let brightest = Math.max(lum1, lum2);
      let darkest = Math.min(lum1, lum2);
      return (brightest + 0.05) / (darkest + 0.05);
    };

    const ratioWhite = contrast(hexToRgb(colour), [255, 255, 255]);
    const ratioBlack = contrast(hexToRgb(colour), [0, 0, 0]);

    fontColour = ratioWhite > ratioBlack ? "white" : "black";
  }

  // Add width to tokens that have been updated
  const width = getTokenWidth(
    tokenInfo.replacement
      ? tokenInfo.replacement
      : tokenInfo.suggested_replacement
      ? tokenInfo.suggested_replacement
      : tokenInfo.value
  );

  return {
    ...tokenInfo,
    clf: clf,
    colour: colour,
    width: width,
    fontColour: fontColour,
  };
};

export const fetchTokens = createAsyncThunk(
  "/token/fetchTokens",
  async (payload) => {
    const response = await axios.post(
      "/api/text/filter",
      {
        project_id: payload.project_id,
        filter: payload.filter,
      },
      {
        params: { page: payload.page, limit: payload.page_limit },
      }
    );
    return response.data;
  }
);

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

export const patchAllReplacements = createAsyncThunk(
  "/token/add/replace/many",
  async ({
    textId,
    tokenId,
    replacement,
    originalValue,
    bgColourMap,
    projectId,
  }) => {
    // Convert focus token to replacment and the rest to suggestions
    await axios.patch("/api/token/replace/add/single", {
      token_id: tokenId,
      text_id: textId,
      replacement: replacement,
    });

    const response = await axios.patch(
      `/api/token/suggest/add/many/${projectId}`,
      {
        original_token: originalValue,
        replacement: replacement,
      }
    );
    return {
      response: response.data,
      details: {
        tokenId: tokenId,
        replacement: replacement,
        originalValue: originalValue,
        bgColourMap: bgColourMap,
      },
    };
  }
);

export const deleteSingleReplacement = createAsyncThunk(
  "/token/del/replace/single",
  async ({ tokenId, bgColourMap }) => {
    const response = await axios.delete(
      `/api/token/replace/remove/single/${tokenId}`
    );

    return {
      response: response.data,
      details: {
        tokenId: tokenId,
        bgColourMap: bgColourMap,
      },
    };
  }
);

export const deleteAllReplacements = createAsyncThunk(
  "/token/del/replace/many",
  async ({ replacement, originalValue, bgColourMap, projectId }) => {
    const response = await axios.patch(
      `/api/token/replace/remove/many/${projectId}`,
      {
        original_token: originalValue,
        replacement: replacement,
      }
    );

    return {
      response: response.data,
      details: {
        replacement: replacement,
        originalValue: originalValue,
        bgColourMap: bgColourMap,
      },
    };
  }
);

export const deleteSingleSuggestedReplacement = createAsyncThunk(
  "/token/del/suggest/single",
  async ({ tokenId, value }) => {
    const response = await axios.delete(
      `/api/token/suggest/remove/single/${tokenId}`
    );
    return {
      response: response.data,
      details: {
        tokenId: tokenId,
        value: value,
      },
    };
  }
);

export const deleteAllSuggestedReplacements = createAsyncThunk(
  "/token/del/suggest/many",
  async ({ suggestedReplacement, originalValue, bgColourMap, projectId }) => {
    const response = await axios.patch(
      `/api/token/suggest/remove/many/${projectId}`,
      {
        original_token: originalValue,
        suggested_replacement: suggestedReplacement,
      }
    );
    return {
      response: response.data,
      details: {
        suggestedReplacement: suggestedReplacement,
        originalValue: originalValue,
        bgColourMap: bgColourMap,
      },
    };
  }
);

export const patchSingleSuggestedReplacement = createAsyncThunk(
  "/token/add/suggest/single",
  async ({ textId, tokenId, suggestedReplacement }) => {
    const response = await axios.patch("/api/token/suggest/add/single", {
      token_id: tokenId,
      text_id: textId,
      suggested_replacement: suggestedReplacement,
    });

    return {
      response: response.data,
      details: {
        tokenId: tokenId,
        suggestedReplacement: suggestedReplacement,
      },
    };
  }
);

export const patchAllSuggestedReplacements = createAsyncThunk(
  "/token/suggest/accept/many",
  async ({ originalValue, suggestedReplacement, bgColourMap, projectId }) => {
    const response = await axios.patch(
      `/api/token/suggest/accept/many/${projectId}`,
      {
        original_token: originalValue,
        suggested_replacement: suggestedReplacement,
      }
    );

    return {
      response: response.data,
      details: {
        originalValue: originalValue,
        suggestedReplacement: suggestedReplacement,
        bgColourMap: bgColourMap,
      },
    };
  }
);

// Meta tags
export const deleteSingleMetaTag = createAsyncThunk(
  "/token/del/meta/single",
  async ({ tokenId, field, bgColourMap }) => {
    const response = await axios.patch(
      `/api/token/meta/remove/one/${tokenId}`,
      { field: field }
    );
    return {
      response: response.data,
      details: {
        tokenId: tokenId,
        field: field,
        bgColourMap: bgColourMap,
      },
    };
  }
);

export const deleteAllMetaTags = createAsyncThunk(
  "/token/del/meta/all",
  async ({ originalValue, field, projectId, bgColourMap }) => {
    const response = await axios.patch(
      `/api/token/meta/remove/many/${projectId}`,
      {
        original_token: originalValue,
        field: field,
        value: false,
      }
    );
    return {
      response: response.data,
      details: {
        originalValue: originalValue,
        field: field,
        bgColourMap: bgColourMap,
      },
    };
  }
);

export const patchSingleMetaTag = createAsyncThunk(
  "/token/add/meta/single",
  async ({ tokenId, field, textId, bgColourMap }) => {
    const response = await axios.patch("/api/token/meta/add/single", {
      token_id: tokenId,
      text_id: textId,
      field: field,
      value: true, // Always will be true if applying a single meta tag...
    });
    return {
      response: response.data,
      details: {
        tokenId: tokenId,
        textId: textId,
        field: field,
        bgColourMap: bgColourMap,
      },
    };
  }
);

export const patchAllMetaTags = createAsyncThunk(
  "/token/add/meta/all",
  async ({ originalValue, field, projectId, bgColourMap }) => {
    const response = await axios.patch(
      `/api/token/meta/add/many/${projectId}`,
      {
        original_token: originalValue,
        field: field,
        value: true, // Always will be true if applying all meta tags
      }
    );
    return {
      response: response.data,
      details: {
        originalValue: originalValue,
        field: field,
        bgColourMap: bgColourMap,
      },
    };
  }
);

export const patchSingleTokenization = createAsyncThunk(
  "/token/tokenize/single",
  async ({ textId, projectId, indexGroupsTC, bgColourMap }) => {
    const response = await axios.patch(`/api/text/tokenize/${textId}`, {
      project_id: projectId,
      index_groups_tc: indexGroupsTC,
    });
    return {
      response: response.data,
      details: {
        textId: textId,
        projectId: projectId,
        indexGroupsTC: indexGroupsTC,
        bgColourMap: bgColourMap,
      },
    };
  }
);

export const patchSingleAnnotationState = createAsyncThunk(
  "/token/patchSingleAnnotationState",
  async ({ textId, value }) => {
    const response = await axios.patch(`/api/text/save/annotation/${textId}`, {
      value: value,
    });
    return {
      response: response.data,
      details: {
        textId: textId,
        value: value,
      },
    };
  }
);

export const patchSingleTokenSplit = createAsyncThunk(
  "/token/patchSingleTokenSplit",
  async ({ textId, tokenId, currentValue, bgColourMap }) => {
    const response = await axios.patch(`/api/text/split/${textId}`, {
      token_id: tokenId,
      current_value: currentValue,
    });
    return {
      response: response.data,
      details: {
        textId: textId,
        tokenId: tokenId,
        currentValue: currentValue,
        bgColourMap: bgColourMap,
      },
    };
  }
);

export const tokenSlice = createSlice({
  name: "tokens",
  initialState: initialState,
  reducers: {
    setIdle: (state, action) => {
      state.status = "idle";
    },
    setShowToast: (state, action) => {
      state.showToast = action.payload;
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
    setTokenizeTextId: (state, action) => {
      state.tokenizeTextId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTokens.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchTokens.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Add fetched project to details
        state.textTokenMap = action.payload.textTokenMap;
        state.values = Object.assign(
          {},
          ...action.payload.tokens
            .flat()
            .map((token) => ({ [token._id]: token }))
        );
      })
      .addCase(fetchTokens.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(patchSingleReplacement.fulfilled, (state, action) => {
        // Patches the replacement value of a token and updates
        // the currentValue, classification, bgColour, and width.
        // TODO: handle response from thunk (e.g. action.payload.response)
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

        // Set toast values and set toast to active for user to see
        state.toastInfo = {
          type: "replacement-add-single",
          content: {
            original: state.values[details.tokenId].value,
            replacement: details.replacement,
            count: 1,
          },
        };
        state.showToast = true;
      })
      .addCase(patchAllReplacements.fulfilled, (state, action) => {
        const details = action.payload.details;

        // Adds focus token replacement and suggests replacements
        // to all similar tokens in corpus
        const values = state.values;
        const replacementValue = details.replacement;

        // Add replacement to focus token
        const focusUpdatedToken = {
          ...values[details.tokenId],
          replacement: replacementValue,
          currentValue: replacementValue,
        };

        // Update clf and colour
        state.values[details.tokenId] = getTokenClf(
          focusUpdatedToken,
          details.bgColourMap
        );

        // Add suggestion to all other tokens of similar original value and don't have a
        // current replacement added..
        const originalValue = details.originalValue;

        // Find tokens that match conditions
        const matchedTokenIds = Object.values(values)
          .filter(
            (value) => !value.replacement && value.value === originalValue
          )
          .map((value) => value._id);

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
              [id]: getTokenClf(state.values[id], details.bgColourMap),
            };
          })
        );

        // Set toast values and set toast to active for user to see
        state.toastInfo = {
          type: "replacement-add-all",
          content: {
            original: originalValue,
            replacement: replacementValue,
            count: action.payload.response.matches + 1, // Includes token that replacement was applied to too.
          },
        };
        state.showToast = true;
      })
      .addCase(deleteSingleReplacement.fulfilled, (state, action) => {
        // Deletes replacement off of a single token and resets current token value
        const details = action.payload.details;

        const updatedTokenInfo = {
          ...state.values[details.tokenId],
          replacement: null,
          currentValue: state.values[details.tokenId].value,
        };

        state.values[details.tokenId] = getTokenClf(
          updatedTokenInfo,
          details.bgColourMap
        );

        // Set toast values and set toast to active for user to see
        state.toastInfo = {
          type: "replacement-remove-single",
          content: {
            original: state.values[details.tokenId].value,
            replacement: null,
            count: 1,
          },
        };
        state.showToast = true;
      })
      .addCase(deleteAllReplacements.fulfilled, (state, action) => {
        // Removes replacements (and those suggested) for tokens given original value and a replacement value
        // This accounts for n:1 normalisations. We don't want all n to get replaced.

        const values = state.values;
        const details = action.payload.details;

        // Find tokens that match conditions
        const matchedTokenIds = Object.values(values)
          .filter(
            (value) =>
              (value.replacement === details.replacement ||
                value.suggested_replacement === details.replacement) &&
              value.value === details.originalValue
          )
          .map((value) => value._id);
        // Create update values dict
        const updatedValues = Object.assign(
          {},
          ...matchedTokenIds.map((id) => ({
            [id]: {
              ...values[id],
              replacement: null,
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
              [id]: getTokenClf(state.values[id], details.bgColourMap),
            };
          })
        );

        // Set toast values and set toast to active for user to see
        state.toastInfo = {
          type: "replacement-remove-all",
          content: {
            original: details.originalValue,
            replacement: details.replacement,
            count: action.payload.response.matches,
          },
        };
        state.showToast = true;
      })
      .addCase(deleteSingleSuggestedReplacement.fulfilled, (state, action) => {
        // Removes a single suggested replacement

        const details = action.payload.details;

        state.values[details.tokenId] = {
          ...state.values[details.tokenId],
          suggested_replacement: null,
          currentValue: details.value,
        };

        // Set toast values and set toast to active for user to see
        state.toastInfo = {
          type: "suggestion-remove-single",
          content: {
            original: state.values[details.tokenId].value,
            replacement: null,
            count: 1,
          },
        };
        state.showToast = true;
      })
      .addCase(deleteAllSuggestedReplacements.fulfilled, (state, action) => {
        // Removes suggested replacements for tokens given original value and current suggested value
        // This accounts for n:1 normalisations. We don't want all n to get replaced.

        const details = action.payload.details;
        const values = state.values;

        // Find tokens that match conditions
        const matchedTokenIds = Object.values(values)
          .filter(
            (value) =>
              value.suggested_replacement === details.suggestedReplacement &&
              value.value === details.originalValue
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
              [id]: getTokenClf(state.values[id], details.bgColourMap),
            };
          })
        );

        // Set toast values and set toast to active for user to see
        state.toastInfo = {
          type: "suggestion-remove-all",
          content: {
            original: details.originalValue,
            replacement: null,
            count: action.payload.response.matches,
          },
        };
        state.showToast = true;
      })
      .addCase(patchSingleSuggestedReplacement.fulfilled, (state, action) => {
        // Accepts a single suggested replacement
        const details = action.payload.details;
        state.values[details.tokenId] = {
          ...state.values[details.tokenId],
          suggested_replacement: null,
          replacement: details.suggestedReplacement,
        };

        // Set toast values and set toast to active for user to see
        state.toastInfo = {
          type: "suggestion-add-single",
          content: {
            original: state.values[details.tokenId].value,
            replacement: details.suggestedReplacement,
            count: 1,
          },
        };
        state.showToast = true;
      })
      .addCase(patchAllSuggestedReplacements.fulfilled, (state, action) => {
        // Accepts all suggested replacement for all tokens of similar value
        const details = action.payload.details;
        const values = state.values;

        // Find tokens that match conditions
        const matchedTokenIds = Object.values(values)
          .filter(
            (value) =>
              value.suggested_replacement === details.suggestedReplacement &&
              value.value === details.originalValue
          )
          .map((value) => value._id);

        // Create update values dict
        const updatedValues = Object.assign(
          {},
          ...matchedTokenIds.map((id) => ({
            [id]: {
              ...values[id],
              replacement: details.suggestedReplacement,
              suggested_replacement: null,
              currentValue: details.suggestedReplacement,
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
              [id]: getTokenClf(state.values[id], details.bgColourMap),
            };
          })
        );
        // Set toast values and set toast to active for user to see
        state.toastInfo = {
          type: "suggestion-add-all",
          content: {
            original: details.originalValue,
            replacement: details.suggestedReplacement,
            count: action.payload.response.matches,
          },
        };
        state.showToast = true;
      })
      .addCase(deleteSingleMetaTag.fulfilled, (state, action) => {
        // Removes a single meta tag

        const details = action.payload.details;

        // Update meta tag object by setting field to FALSE.
        const tokenInfo = state.values[details.tokenId];
        const metaTagUpdate = {
          ...tokenInfo.meta_tags,
          [details.field]: false,
        };

        // Update token state
        state.values[details.tokenId] = {
          ...state.values[details.tokenId],
          meta_tags: metaTagUpdate,
        };

        // Update token colour and classification
        state.values[details.tokenId] = getTokenClf(
          state.values[details.tokenId],
          details.bgColourMap
        );

        // Set toast values and set toast to active for user to see
        state.toastInfo = {
          type: "meta-remove-single",
          content: {
            original: tokenInfo.value,
            metaTag: details.field,
            metaTagValue: false,
            count: 1,
          },
        };
        state.showToast = true;
      })
      .addCase(deleteAllMetaTags.fulfilled, (state, action) => {
        // Removes meta tag from all tokens in corpus that share the same
        // underlying value.
        // TODO: update for tokens that have matched replacements too.

        const details = action.payload.details;

        const tokenValues = state.values;

        const updatedTokenValues = Object.values(tokenValues).map((token) => {
          if (token.value === details.originalValue) {
            const updatedMetaTags = {
              ...token.meta_tags,
              [details.field]: false,
            };

            return { ...token, meta_tags: updatedMetaTags };
          } else {
            return token;
          }
        });

        state.values = Object.assign(
          {},
          ...updatedTokenValues.map((token) => {
            return {
              [token._id]: getTokenClf(token, details.bgColourMap),
            };
          })
        );

        // Set toast values and set toast to active for user to see
        state.toastInfo = {
          type: "meta-remove-all",
          content: {
            original: details.originalValue,
            metaTag: details.field,
            metaTagValue: false,
            count: action.payload.response.matches,
          },
        };
        state.showToast = true;
      })
      .addCase(patchSingleMetaTag.fulfilled, (state, action) => {
        // Adds a single meta tag
        const details = action.payload.details;

        // Update meta tag object by setting field to TRUE.
        const tokenInfo = state.values[details.tokenId];
        const metaTagUpdate = { ...tokenInfo.meta_tags, [details.field]: true };

        // Update token state
        state.values[details.tokenId] = {
          ...state.values[details.tokenId],
          meta_tags: metaTagUpdate,
        };

        // Update token colour and classification
        state.values[details.tokenId] = getTokenClf(
          state.values[details.tokenId],
          details.bgColourMap
        );

        // Set toast values and set toast to active for user to see
        state.toastInfo = {
          type: "meta-add-single",
          content: {
            original: tokenInfo.value,
            metaTag: details.field,
            metaTagValue: true,
            count: 1,
          },
        };
        state.showToast = true;
      })
      .addCase(patchAllMetaTags.fulfilled, (state, action) => {
        // Adds meta tag to all tokens with similar original value (TODO: confirm whether all tokens with similar
        // replacements should also be counted)

        const details = action.payload.details;

        const tokenValues = state.values;

        const updatedTokenValues = Object.values(tokenValues).map((token) => {
          if (token.value === details.originalValue) {
            const updatedMetaTags = {
              ...token.meta_tags,
              [details.field]: true,
            };

            return { ...token, meta_tags: updatedMetaTags };
          } else {
            return token;
          }
        });

        state.values = Object.assign(
          {},
          ...updatedTokenValues.map((token) => {
            return {
              [token._id]: getTokenClf(token, details.bgColourMap),
            };
          })
        );

        // Set toast values and set toast to active for user to see
        state.toastInfo = {
          type: "meta-add-all",
          content: {
            original: details.originalValue,
            metaTag: details.field,
            metaTagValue: true,
            count: action.payload.response.matches,
          },
        };
        state.showToast = true;
      })
      .addCase(patchSingleTokenization.fulfilled, (state, action) => {
        // Tokenizes a set of token pieces for a single text
        // console.log("state tokenized!");
        const details = action.payload.details;

        const oldTokenIds = action.payload.response.old_token_ids;
        const newTokenIds = action.payload.response.new_token_ids;
        const tokenValues = action.payload.response.tokens;

        // Update values
        // Firstly remove old token Ids (cant figure it out atm; TODO: remove)
        // let values = Object.values(state.values);
        // console.log(values);
        // console.log(values.length);
        // values = values.filter((value) => !oldTokenIds.includes(value._id));

        // console.log(values);

        // const filteredValues = Object.assign(
        //   {},
        //   ...values.map((token) => {
        //     return {
        //       [token._id]: token,
        //     };
        //   })
        // );
        // console.log(filteredValues);

        // Add new values to token values; also adds currentValue to token value object (this
        // enables the UI to rerender correctly)
        const newValues = Object.assign(
          {},
          ...newTokenIds.map((id) => {
            return {
              [id]: {
                ...getTokenClf(
                  tokenValues.filter((token) => token._id === id)[0],
                  details.bgColourMap
                ),
                currentValue: tokenValues.filter((token) => token._id === id)[0]
                  .value,
              },
            };
          })
        );
        state.values = { ...state.values, ...newValues };

        // Update textTokenMap
        // Find textId and replace it's token_ids
        let text = state.textTokenMap.filter(
          (text) => text._id === details.textId
        )[0];
        text = { ...text, token_ids: tokenValues.map((token) => token._id) };
        // console.log(text);

        // Update text in array, making sure it's the correct position!
        const textTokenMap = state.textTokenMap;
        state.textTokenMap = [
          ...textTokenMap.filter((text) => text._id !== details.textId),
          text,
        ].sort((a, b) => a.rank - b.rank);

        // Set tokenized text to null (after operations complete)
        state.tokenizeTextId = null;
      })
      .addCase(patchSingleAnnotationState.fulfilled, (state, action) => {
        const details = action.payload.details;
        state.textTokenMap = state.textTokenMap.map((text) => {
          if (text._id === details.textId) {
            return { ...text, annotated: details.value };
          } else {
            return text;
          }
        });
      })
      .addCase(patchSingleTokenSplit.fulfilled, (state, action) => {
        const details = action.payload.details; // tokenId, textId, currentValue
        const response = action.payload.response; // new_tokens

        // Remove old value from values state
        delete state.values[details.tokenId];

        // Update values with new tokens information
        const newValues = Object.assign(
          {},
          ...response.new_tokens.map((token) => {
            return {
              [token._id]: {
                ...getTokenClf(token, details.bgColourMap),
                currentValue: token.value,
              },
            };
          })
        );
        state.values = { ...state.values, ...newValues };

        // Update textTokenMap with new token set
        const newTextTokenMapItem = {
          ...state.textTokenMap.filter(
            (text) => text._id === details.textId
          )[0],
          token_ids: response.token_ids,
        };
        // console.log(text);

        // Update text in array, making sure it's the correct position!
        const textTokenMap = state.textTokenMap;
        state.textTokenMap = [
          ...textTokenMap.filter((text) => text._id !== details.textId),
          newTextTokenMapItem,
        ].sort((a, b) => a.rank - b.rank);
      });
  },
});

export const {
  setIdle,
  setShowToast,
  setTokenizeTextId,
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
export const selectToastInfo = (state) => state.tokens.toastInfo;
export const selectShowToast = (state) => state.tokens.showToast;
export const selectTokenizeTextId = (state) => state.tokens.tokenizeTextId;

export default tokenSlice.reducer;
