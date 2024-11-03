import useApi from "../useApi";
import { useSnackbar } from "../../context/SnackbarContext";
import { useContext } from "react";
import { ProjectContext } from "../../context/ProjectContext";
import { useParams } from "react-router-dom";

const useAnnotationActions = () => {
  const callApi = useApi();
  const [state, dispatch] = useContext(ProjectContext);
  const { projectId } = useParams();

  const { dispatch: snackbarDispatch } = useSnackbar();

  const applyTokenTransformAction = async ({
    tokenId,
    textId,
    replacement,
    applyAll,
    suggestion,
    textIds,
    tokenIndex,
    originalValue,
    currentValue,
  }) => {
    try {
      const payload = {
        projectId,
        tokenId,
        textId,
        replacement,
        applyAll,
        suggestion,
        textIds,
        originalValue,
      };

      const data = await callApi("/tokens/add/replacement", {
        method: "PATCH",
        data: {
          project_id: projectId,
          token_id: tokenId,
          text_id: textId,
          replacement,
          value: originalValue,
          apply_all: applyAll,
        },
      });

      if (data) {
        dispatch({
          type: "TOKEN_APPLY",
          payload: {
            ...payload,
            ...data,
            tokenIndex: tokenIndex,
            originalValue: originalValue,
          },
        });

        const successMessage =
          data.count === 0
            ? "No changes made."
            : applyAll
            ? `Updated '${originalValue}' to '${currentValue}' for ${data.count} instances successfully.`
            : `Updated '${originalValue}' to '${currentValue}' for ${data.count} for the current instance successfully.`;

        snackbarDispatch({
          type: "SHOW",
          message: successMessage,
          severity: "success",
        });
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Error occurred applying token replacement ${error}`,
        severity: "error",
      });
    }
  };

  const deleteTokenTransformAction = async ({
    textId,
    tokenId,
    applyAll,
    textIds,
    tokenIndex,
    originalValue,
    currentValue,
  }) => {
    try {
      const payload = {
        textId,
        tokenId,
        applyAll,
        textIds,
        originalValue,
        projectId,
      };

      const data = await callApi("/tokens/remove/replacement", {
        method: "PATCH",
        data: {
          project_id: projectId,
          token_id: tokenId,
          apply_all: applyAll,
          value: originalValue,
          text_id: textId,
        },
      });

      if (data) {
        dispatch({
          type: "TOKEN_DELETE",
          payload: {
            ...payload,
            ...data,
            tokenIndex,
            originalValue,
            currentValue,
          },
        });

        const tokenIsEmpty = currentValue === "";

        let successMessage = applyAll
          ? `Token '${originalValue}' deleted for ${data.count} instances successfully.`
          : `Token '${originalValue}' deleted for the current instance successfully.`;

        if (tokenIsEmpty) {
          successMessage = applyAll
            ? `Recovered '${originalValue}' from ${data.count} tokens across all texts successfully.`
            : `Recovered '${originalValue}' from the current token successfully.`;
        }

        snackbarDispatch({
          type: "SHOW",
          message: successMessage,
          severity: "success",
        });
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Error occurred deleting token: ${error}`,
        severity: "error",
      });
    }
  };

  const acceptTokenTransformAction = async ({
    tokenId,
    textId,
    applyAll,
    textIds,
    tokenIndex,
    originalValue,
    currentValue,
  }) => {
    try {
      const payload = {
        projectId,
        tokenId,
        textId,
        applyAll,
        textIds,
        originalValue,
      };
      const data = await callApi("/tokens/accept/replacement", {
        method: "PATCH",
        data: {
          token_id: tokenId,
          text_id: textId,
          project_id: projectId,
          apply_all: applyAll,
          value: originalValue,
        },
      });

      if (data) {
        dispatch({
          type: "TOKEN_ACCEPT",
          payload: {
            ...payload,
            ...data,
            tokenIndex: tokenIndex,
            originalValue: originalValue,
            currentValue: currentValue,
          },
        });

        const successMessage = applyAll
          ? `Token '${originalValue}' accepted for ${data.count} instances successfully.`
          : `Token '${originalValue}' accepted for the current instance successfully.`;

        snackbarDispatch({
          type: "SHOW",
          message: successMessage,
          severity: "success",
        });
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Error occurred accepting token: ${error.message}`,
        severity: "error",
      });
    }
  };

  const splitTokenAction = async ({
    textId,
    tokenId,
    tokenIndex,
    currentValue,
  }) => {
    try {
      const payload = { textId, tokenId, tokenIndex, currentValue };

      const data = await callApi("/api/token/split", {
        method: "PATCH",
        data: payload,
      });
      if (data) {
        dispatch({ type: "TOKEN_SPLIT", payload: data });
        snackbarDispatch({
          type: "SHOW",
          message: "Token split successfully.",
          severity: "success",
        });
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Error splitting token: ${error}`,
        severity: "error",
      });
    }
  };

  /**
   * Removing tokens essentially performs a replacement annotation where the replacmeent is an empty string.
   */
  const removeTokenAction = async ({
    tokenIndex,
    textId,
    tokenId,
    applyAll,
    texIds,
    originalValue,
  }) => {
    try {
      const payload = {
        projectId,
        tokenId,
        textId,
        applyAll,
        texIds,
        originalValue,
      };

      const data = await callApi("/tokens/add/replacement", {
        method: "PATCH",
        data: {
          project_id: projectId,
          token_id: tokenId,
          text_id: textId,
          apply_all: applyAll,
          value: originalValue,
          replacement: "",
        },
      });

      if (data) {
        dispatch({
          type: "TOKEN_APPLY",
          payload: {
            ...payload,
            ...data,
            replacement: "",
            tokenIndex,
            originalValue,
          },
        });
        const successMessage =
          data.count === 0
            ? "No changes made."
            : applyAll
            ? `Removed '${originalValue}' from texts ${data.count} times successfully.`
            : `Removed '${originalValue}' from the current text successfully.`;

        snackbarDispatch({
          type: "SHOW",
          message: successMessage,
          severity: "success",
        });
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Erorr deleting token(s): ${error}`,
        severity: "error",
      });
    }
  };

  const tokenizeTokensAction = async ({ textId, tokenIndexGroups }) => {
    try {
      const data = await callApi("/api/text/tokenize", {
        method: "PATCH",
        data: { textId, indexGroupsTC: tokenIndexGroups },
      });

      if (data) {
        dispatch({ type: "TOKENIZE", payload: data });
        snackbarDispatch({
          type: "SHOW",
          message: `Succesfully tokenized phrase.`,
          severity: "success",
        });
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Failed to tokenize phrase: ${error}`,
        severity: "error",
      });
    }
  };

  const applyLabelAction = async ({
    textId,
    tokenId,
    tagId,
    applyAll = false,
  }) => {
    /**
     * Each token has a `tags` field which contains details of applied token-level entity labels (tags).
     */

    try {
      const data = await callApi("/tokens/add/tag", {
        method: "PATCH",
        data: {
          project_id: projectId,
          text_id: textId,
          token_id: tokenId,
          tag_id: tagId,
          apply_all: applyAll,
        },
      });

      if (data) {
        dispatch({
          type: "APPLY_TAG",
          payload: {
            ...data,
            applyAll,
            tokenId,
            tagId,
            textId: state.selectedTextId,
          },
        });
      }
      const tagDetails = state.project.tags.find((t) => t._id === tagId);

      const successMessage = applyAll
        ? `Applied '${tagDetails.name}' to ${data.count} instances successfully.`
        : `Applied '${tagDetails.name}' to the current instance successfully.`;

      snackbarDispatch({
        type: "SHOW",
        message: successMessage,
        severity: "success",
      });
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Error occurred applying label: ${error}`,
        severity: "error",
      });
    }
  };

  // const acceptLabelAction = async () => {

  // }

  const deleteLabelAction = async ({ textId, tokenId, tagId, applyAll }) => {
    try {
      const data = await callApi(`/tokens/remove/tag`, {
        method: "PATCH",
        data: {
          text_id: textId,
          token_id: tokenId,
          tag_id: tagId,
          apply_all: applyAll,
          project_id: projectId,
        },
      });

      if (data) {
        dispatch({
          type: "DELETE_TAG",
          payload: {
            ...data,
            applyAll,
            tokenId,
            tagId,
            textId,
          },
        });

        const tagDetails = state.project.tags.find((t) => t._id === tagId);

        const successMessage = applyAll
          ? `Deleted '${tagDetails.name}' on ${data.count} instances successfully.`
          : `Deleted '${tagDetails.name}' on the current instance successfully.`;

        snackbarDispatch({
          type: "SHOW",
          message: successMessage,
          severity: "success",
        });
      } else {
        throw new Error("Failed to delete label.");
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: error,
        severity: "error",
      });
    }
  };

  const addFlag = async ({ textId, flagId }) => {
    try {
      const data = await callApi("/texts/flag", {
        method: "PATCH",
        data: { id: textId, flag_id: flagId, project_id: projectId },
      });

      if (data) {
        // dispatch
        dispatch({ type: "ADD_FLAG", payload: { textId, flagId } });
        // snackbar
        snackbarDispatch({
          type: "SHOW",
          message: "Added flag to text.",
          severity: "success",
        });
      } else {
        throw new Error("Failed to add flag.");
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: error,
        severity: "error",
      });
    }
  };

  const deleteFlag = async ({ textId, flagId }) => {
    try {
      const data = await callApi("/texts/flag", {
        method: "PATCH",
        data: { id: textId, flag_id: flagId, project_id: projectId },
      });

      if (data) {
        // dispatch
        dispatch({ type: "DELETE_FLAG", payload: { textId, flagId } });
        // snackbar
        snackbarDispatch({
          type: "SHOW",
          message: "Deleted flag from text.",
          severity: "success",
        });
      } else {
        throw new Error("Failed to delete flag.");
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: error,
        severity: "error",
      });
    }
  };

  return {
    applyTokenTransformAction,
    deleteTokenTransformAction,
    acceptTokenTransformAction,
    splitTokenAction,
    removeTokenAction,
    tokenizeTokensAction,
    applyLabelAction,
    deleteLabelAction,
    addFlag,
    deleteFlag,
  };
};

export default useAnnotationActions;
