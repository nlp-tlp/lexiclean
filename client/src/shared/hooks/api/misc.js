import useApi from "../useApi";
import { useSnackbar } from "../../context/SnackbarContext";

const useMiscActions = () => {
  const callApi = useApi();
  const { dispatch: snackbarDispatch } = useSnackbar();

  const getTokenContext = async ({ projectId, tokenValue }) => {
    try {
      const data = await callApi(`/projects/${projectId}/search`, {
        method: "GET",
        params: { value: tokenValue },
      });

      return data;
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Unable to search for token: ${tokenValue}`,
        severity: "error",
      });
    }
  };

  return { getTokenContext };
};

export default useMiscActions;
