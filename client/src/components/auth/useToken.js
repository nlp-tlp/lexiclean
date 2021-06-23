import { useState } from 'react'
import axios from 'axios';

export default function useToken() {

    const getToken = () => {
        const tokenString = localStorage.getItem('token');
        const userToken = JSON.parse(tokenString);

        // Check if token valid
        axios({
                method: 'post',
                url: '/api/auth/token/validate',
                data: {token: userToken}})
                .then(function (response) {
                  if (response.status === 200){
                    if (response.data.valid){
                      return userToken;
                    } else if (!response.data.valid) {
                      localStorage.removeItem('token');
                    }
                  }
                })
      }

    const [token, setToken] = useState(getToken());

    const saveToken = (userToken) => {
        localStorage.setItem('token', JSON.stringify(userToken));
        setToken(userToken);
      }

    return {
        setToken: saveToken,
        token
    }
}
