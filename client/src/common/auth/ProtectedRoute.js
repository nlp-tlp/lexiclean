import React from 'react';
import { Redirect, Route } from 'react-router-dom';

export default function ProtectedRoute({ component: Component, token, ...rest}) {
    return (
        <Route {...rest} render={
            props => {
            if (token) {
                return <Component {...rest} {...props} />
            } else {
                return <Redirect to={
                    {
                        pathname: "/unauthorized",
                        state: {
                            from: props.location
                        }
                    }
                }
                />
            }
        }
    }
        />
    )
}
