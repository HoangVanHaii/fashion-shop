import axios from 'axios';

export const login = async (email: string, password: string) => {
    console.log(3333333333333);
    const result = await axios.post('http://localhost:3000/api/user/login', {
        email: "tranhuyvui@gmail.com",
        password: "vui1"
    })
    console.log(4444444444);
    console.log(result.data);
    return result.data;
}

