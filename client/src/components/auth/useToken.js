import { useState } from 'react'
import axios from 'axios';

export default function useToken() {

    const getToken = () => {
        const tokenString = localStorage.getItem('token');
        const userToken = JSON.parse(tokenString);
        return userToken;
        // Check if token valid
      //   const response = await axios.post('/api/auth/token/validate', {token: userToken});

      //   if (response.status === 200){
      //     // console.log(response.data);
      //     if (response.data.valid){
      //       return userToken;
      //     } else {
      //       return undefined;
      //     }
      //   }
      }

      // console.log('get token', getToken());

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
