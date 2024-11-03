import useApi from "../useApi";
import { useSnackbar } from "../../context/SnackbarContext";

const useTextActions = () => {
  const callApi = useApi();
  const { dispatch: snackbarDispatch } = useSnackbar();

  const getAISuggestion = async ({ textId }) => {
    try {
      const data = await callApi(`/texts/${textId}/suggestion`, {
        method: "GET",
      });

      return data;
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Unable to retrieve suggestion for text: ${error.response.data.detail}`,
        severity: "error",
      });
    }
  };

  return { getAISuggestion };
};

export default useTextActions;
