# Authentication Strategies

This application supports modular authentication strategies, allowing you to choose or switch between different authentication providers according to your needs. Currently, it supports Auth0 for a robust, scalable authentication solution and a Dummy authentication strategy for simpler use cases or testing purposes.

### Setting Up Auth0

1. **Create an Auth0 Account**: If you haven't already, sign up for a free account at [Auth0's website](https://auth0.com).
2. **Create an Auth0 Application**: Once logged in, create a new application in the Auth0 dashboard. Choose a regular web application and take note of the `Domain`, `Client ID`, and `Client Secret`.
3. **Configure Callback URLs**: In your Auth0 application settings, set the Allowed Callback URLs, Allowed Logout URLs, and Allowed Web Origins to match your application's URLs.
4. **Environment Configuration**: Set the following environment variables in your application:
   - `AUTH0_DOMAIN`: Your Auth0 Domain.
   - `AUTH0_CLIENT_ID`: Your Auth0 Client ID.
   - `AUTH0_CLIENT_SECRET`: Your Auth0 Client Secret.
5. **Use Auth0 Strategy**: Ensure your application is configured to use the Auth0 strategy by setting the environment variable `AUTH_STRATEGY` to `AUTH0`.

### Setting Up the Dummy Authentication Strategy

The Dummy authentication strategy bypasses typical authentication mechanisms, which can be useful for development or testing:

1. **Environment Configuration**: To use the Dummy authentication strategy, set the environment variable `AUTH_STRATEGY` to `DUMMY`.
2. **Usage**: With the Dummy strategy active, all authentication requests will simulate successful authentication without the need for actual credentials. This is ideal for offline development or testing application flows without the overhead of real authentication processes.

### Switching Authentication Strategies

Switch between authentication strategies by changing the `AUTH_STRATEGY` environment variable in your deployment or development environment. This allows you to quickly adapt to different testing scenarios or deploy the application according to specific requirements without changing the codebase.
