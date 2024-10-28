import { useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useApi from "../useApi";
// import { useSnackbar } from "../../context/SnackbarContext";
import { useAuth } from "../../context/AuthContext";

const useNotificationActions = () => {
  const callApi = useApi();
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  //   const { dispatch: snackbarDispatch } = useSnackbar();

  const fetchNotifications = async () => {
    try {
      const data = await callApi("/notifications");
      return data || []; // Ensure it returns an array
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return []; // Return an empty array in case of error
    }
  };

  const inviteNotification = async (usernames) => {
    console.log("inviteNotification called with:", { usernames });
    try {
      console.log("Calling API...");
      const response = await callApi("/notifications/invite", {
        method: "POST",
        data: usernames,
        params: { project_id: projectId },
      });
      console.log("API response:", response);
      return { success: true, data: response };
    } catch (error) {
      console.error("Error in inviteNotification:", error);
      if (error.response) {
        console.log("Error response:", error.response);
        return {
          success: false,
          error:
            error.response.data.detail ||
            "An error occurred while inviting users.",
        };
      } else if (error.request) {
        console.log("Error request:", error.request);
        return {
          success: false,
          error: "No response received from the server.",
        };
      } else {
        console.log("Error message:", error.message);
        return {
          success: false,
          error: "An error occurred while sending the invitation.",
        };
      }
    }
  };

  const uninviteNotification = async (notificationId) => {
    try {
      const data = await callApi("/api/token/add", {
        method: "PATCH",
        data: {},
      });

      if (data) {
        //
      }
    } catch (error) {
      //
    }
  };

  const acceptNotification = async (notificationId) => {
    try {
      const data = await callApi(`/notifications/invite/${notificationId}`, {
        method: "PATCH",
        params: { status: "accept" },
      });

      if (data) {
        return data;
      }
    } catch (error) {
      //
    }
  };

  const declineNotification = async (notificationId) => {
    try {
      const data = await callApi(`/api/notification/${notificationId}`, {
        method: "PATCH",
        data: { status: "reject" },
      });

      if (data) {
        //
        console.log(data);
        return data;
      }
    } catch (error) {
      //
    }
  };

  // Using useQuery to fetch notifications
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 15000,
    enabled: isAuthenticated, // Enable polling only if the user is authenticated
  });

  // Using useMutation for each mutation action
  const inviteMutation = useMutation({
    mutationFn: inviteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  const uninviteMutation = useMutation({
    mutationFn: uninviteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  const acceptMutation = useMutation({
    mutationFn: acceptNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  const declineMutation = useMutation({
    mutationFn: declineNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  return {
    notificationsQuery,
    inviteNotification: inviteMutation.mutate,
    uninviteNotification: uninviteMutation.mutate,
    acceptNotification: acceptMutation.mutate,
    declineNotification: declineMutation.mutate,
  };
};

export default useNotificationActions;
