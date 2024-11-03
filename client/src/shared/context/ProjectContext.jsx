import * as React from "react";
import { updateTextTokenTags, updateTexts } from "../utils/project-context";

const initialState = {
  filters: {
    searchTerm: "",
    referenceSearchTerm: "",
    saved: "all",
    candidates: "all",
    rank: 1,
  },
  savePending: false,
  projectLoading: true,
  project: null,
  projectId: null,
  progress: { value: 0, title: "" },
  totalCount: 0,
  pageLimit: 10,
  pageNumber: 1,
  textsLoading: true,
  texts: null,
  showReferences: false,
  showToast: false,
  toastInfo: null,
  operationLoading: false,
  tokenizeTextId: null,
  currentTextSelected: null,
  tokenIdsSelected: [],
  selectedTokenValue: null,
  showFilterModel: false,
  selectedToken: null,
};

export const ProjectContext = React.createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_PROJECTID": {
      return { ...state, projectId: action.payload };
    }
    case "SET_PROJECT": {
      // Sets textsLoading to ensure documents are loaded correctly.
      return {
        ...state,
        projectId: action.payload._id,
        project: action.payload,
        projectLoading: false,
        textsLoading: true,
      };
    }
    case "SET_PROJECT_METRICS": {
      return state;
    }
    case "SET_TEXTS": {
      return {
        ...state,
        texts: action.payload.texts,
        totalCount: action.payload.total_count,
        textsLoading: false,
      };
    }
    case "SET_TEXTS_LOADING": {
      return { ...state, textsLoading: true };
    }
    case "SET_PAGE": {
      return { ...state, pageNumber: action.payload, textsLoading: true };
    }
    case "SAVE_TEXTS": {
      // Create a map for quick lookups
      const textMap = new Map(state.texts.map((text) => [text._id, text]));

      // Update the saved state for the specified textIds
      action.payload.textIds.forEach((textId) => {
        if (textMap.has(textId)) {
          textMap.set(textId, {
            ...textMap.get(textId),
            saved: action.payload.saveState,
          });
        }
      });

      // Convert the map back to an array
      const updatedTexts = Array.from(textMap.values());

      return { ...state, texts: updatedTexts };
    }
    case "SET_VALUE": {
      return { ...state, ...action.payload };
    }
    case "RESET_FILTERS": {
      return { ...state, filters: initialState.filters };
    }
    case "UPDATE_TOKEN_VALUE": {
      // Find the index of the text with the given textId
      const textIndex = state.texts.findIndex(
        (text) => text._id === action.payload.textId
      );

      if (textIndex === -1) {
        // If the text is not found, return the state unchanged
        return state;
      }

      // Copy the existing text object and update the token's current_value
      const updatedText = {
        ...state.texts[textIndex],
        tokens: state.texts[textIndex].tokens.map((token, index) => {
          if (index === parseInt(action.payload.tokenIndex)) {
            return {
              ...token,
              current_value: action.payload.newValue,
            };
          }
          return token;
        }),
      };

      // Create a new texts array with the updated text object
      const updatedTexts = [
        ...state.texts.slice(0, textIndex),
        updatedText,
        ...state.texts.slice(textIndex + 1),
      ];

      return {
        ...state,
        texts: updatedTexts,
      };
    }
    case "TOKEN_APPLY": {
      const updatedTexts = updateTexts(
        "apply",
        state.texts,
        action.payload.text_token_ids,
        action.payload.tokenId,
        action.payload.replacement
      );

      return {
        ...state,
        texts: updatedTexts,
      };
    }
    case "TOKEN_DELETE": {
      const updatedTexts = updateTexts(
        "delete",
        state.texts,
        action.payload.text_token_ids,
        action.payload.tokenId,
        action.payload.replacement
      );
      return {
        ...state,
        texts: updatedTexts,
      };
    }
    case "TOKEN_ACCEPT": {
      const updatedTexts = updateTexts(
        "accept",
        state.texts,
        action.payload.text_token_ids,
        action.payload.tokenId,
        action.payload.replacement
      );

      return {
        ...state,
        texts: updatedTexts,
      };
    }
    case "TOKEN_SPLIT": {
      return { ...state, texts: { ...state.texts, ...action.payload } };
    }
    case "TOKEN_REMOVE": {
      // Removes token from text
      return {
        ...state,
        texts: { ...state.texts, ...action.payload.textTokenObjects },
      };
    }
    case "TOKENIZE": {
      // Joins contiguous n-grams on a given text
      return {
        ...state,
        texts: { ...state.texts, ...action.payload },
        tokenizeTextId: null,
      };
    }

    case "APPLY_TAG": {
      const { tagId, text_token_ids } = action.payload;
      const updatedState = { ...state };
      const updatedTexts = updateTextTokenTags({
        action: "apply",
        texts: updatedState.texts,
        textTokenIds: text_token_ids,
        tagId,
      });
      return { ...updatedState, texts: updatedTexts };
    }
    case "DELETE_TAG": {
      const { tagId, text_token_ids } = action.payload;
      const updatedState = { ...state };
      const updatedTexts = updateTextTokenTags({
        action: "delete",
        texts: updatedState.texts,
        textTokenIds: text_token_ids,
        tagId,
      });
      return { ...updatedState, texts: updatedTexts };
    }

    case "ADD_FLAG": {
      // Find the index of the text with the given textId
      const textIndex = state.texts.findIndex(
        (text) => text._id === action.payload.textId
      );

      if (textIndex === -1) {
        // If the text is not found, return the state unchanged
        return state;
      }

      // Copy the existing text object and update the flags array
      const updatedText = {
        ...state.texts[textIndex],
        flags: [...state.texts[textIndex].flags, action.payload.flagId],
      };

      // Create a new texts array with the updated text object
      const updatedTexts = [
        ...state.texts.slice(0, textIndex),
        updatedText,
        ...state.texts.slice(textIndex + 1),
      ];

      return {
        ...state,
        texts: updatedTexts,
      };
    }
    case "DELETE_FLAG": {
      // Find the index of the text with the given textId
      const textIndex = state.texts.findIndex(
        (text) => text._id === action.payload.textId
      );

      if (textIndex === -1) {
        // If the text is not found, return the state unchanged
        return state;
      }

      // Copy the existing text object and update the flags array
      const updatedText = {
        ...state.texts[textIndex],
        flags: state.texts[textIndex].flags.filter(
          (f) => f !== action.payload.flagId
        ),
      };

      // Create a new texts array with the updated text object
      const updatedTexts = [
        ...state.texts.slice(0, textIndex),
        updatedText,
        ...state.texts.slice(textIndex + 1),
      ];

      return {
        ...state,
        texts: updatedTexts,
      };
    }

    case "SET_SHOW_TOAST": {
      return { ...state, showToast: action.payload };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
};

export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  return (
    <ProjectContext.Provider value={[state, dispatch]}>
      {children}
    </ProjectContext.Provider>
  );
};
