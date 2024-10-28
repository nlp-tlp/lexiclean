export const dummyUser = {
  user: {
    id: "123456",
    username: "johndoe",
    email: "john.doe@example.com",
    name: "John Doe",
    avatar: "/static/avatars/john-doe.jpg",
    isAuthenticated: true,
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
    roles: ["user"],
    lastLogin: "2024-01-01T12:00:00Z",
    signUpDate: "2023-01-01T12:00:00Z",
    membershipLevel: "basic",
  },
  preferences: {
    theme: "dark",
    language: "en",
    notificationSettings: {},
  },
  notifications: [
    {
      id: 1,
      title: "Welcome to Our Service!",
      message:
        "Thank you for joining our service. We're glad to have you with us.",
      timestamp: "2024-01-30T10:00:00Z",
      read: false,
    },
    {
      id: 2,
      title: "System Update",
      message:
        "Our system will undergo maintenance on February 1st, 2024, from 02:00 to 03:00 UTC.",
      timestamp: "2024-01-29T15:00:00Z",
      read: true,
    },
    {
      id: 3,
      title: "New Features Available",
      message:
        "Check out the new features we've added to enhance your experience.",
      timestamp: "2024-01-28T09:00:00Z",
      read: false,
    },
  ],
};
