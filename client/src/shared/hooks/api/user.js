import { useAppContext } from "../../context/AppContext";
import useApi from "../useApi";
import { useSnackbar } from "../../context/SnackbarContext";

const useUserActions = () => {
  const { state, dispatch } = useAppContext();
  const callApi = useApi();
  const { dispatch: snackbarDispatch } = useSnackbar();

  const updateUserDetails = async ({
    name,
    openAIKey,
    email,
    securityQuestion,
    securityAnswer,
  }) => {
    try {
      const data = await callApi(`/users`, {
        method: "PUT",
        data: {
          name,
          openai_api_key: openAIKey,
          email: email,
          security_question: securityQuestion,
          security_answer: securityAnswer,
        },
      });

      const updatedUser = {
        ...state.user,
        name: name || state.user.name,
        openai_api_key: openAIKey || state.user.openai_api_key,
      };

      dispatch({
        type: "SET_USER",
        payload: updatedUser,
      });

      snackbarDispatch({
        type: "SHOW",
        message: "Successfully updated account details.",
        severity: "success",
      });

      return data;
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: "Unable to update account details.",
        severity: "error",
      });
    }
  };

  return {
    updateUserDetails,
  };
};

export default useUserActions;
