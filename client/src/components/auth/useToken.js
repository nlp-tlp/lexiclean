import { useState } from 'react'
import axios from 'axios';

export default function useToken() {

    const getToken = async () => {
        const tokenString = localStorage.getItem('token');
        const userToken = JSON.parse(tokenString);
        // Check if token valid
        // const response = await axios.post('/api/auth/token/validate', {token: userToken});
  
        return userToken;

        // if (response.status === 200){
        //   // console.log(response.data);
        //   if (response.data.valid){
        //     console.log('token is valid');
        //     console.log(response.data.valid)
        //     return userToken;
        //   } else {
        //     console.log('token is invalid');
        //     return null;
        //   }
        // }

        // return userToken;

      }

    const [token, setToken] = useState(getToken());

    const saveToken = (userToken) => {
        localStorage.setItem('token', JSON.stringify(userToken));
        setToken(userToken);
      }

    return {
      token,
      setToken: saveToken
    }
}
