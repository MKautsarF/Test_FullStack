import { useState } from 'react'
import '../App.css'
import { useNavigate } from "react-router-dom";

import { loginInstructor, getProfile } from '../services/auth.services';

import {
  TextField
} from "@mui/material";

// interface User {
//   id: string;
//   name: string;
//   username: string; 
//   email: string;
//   division: string,
//   position: string,
//   IsAdmin: boolean,
// }

function Login() {
    const navigate = useNavigate();
    const [token, setToken] = useState('');

    // const [user, setUser] = useState<User>({
    //   id: '',
    //   name: '',
    //   username: '',
    //   email: '',
    //   division: '',
    //   position: '',
    //   IsAdmin: false,
    // });

    const handleLogin= async (e: React.FormEvent<HTMLFormElement>) => {

      e.preventDefault(); 
      const formData = new FormData(e.currentTarget);
  
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;

      try {
        const res = await loginInstructor(username, password);
        if (res.success) {
            sessionStorage.setItem('jwt', res);
            navigate('/home'); 
            console.log(res)
            console.log(res.id)
            
            // const res2 = await getProfile(res.id);
            // console.log(res2);
            
            // setUser({
            //   id: res2.ID,
            //   name: res2.Name,
            //   username: res2.Username,
            //   email: res2.EmailAddress,
            //   division: res2.Division,
            //   position: res2.Position,
            //   IsAdmin: res2.IsAdmin,
            // });
            // console.log(user);
      
            setToken(res);
            navigate("/home", { state: { id: res.id } });
        } else {
            alert('Invalid credentials'); // Show error for invalid credentials
        }
      }catch (error) {
        console.error(error);
        alert('Something went wrong during login');
      }
      
    };

    return (
      <>
        <div className="flex flex-col gap-10">
          <h1>Attendance App</h1>
            <p>Please log in</p>
            <form 
              onSubmit={handleLogin}
              className="flex flex-col gap-4 justify-center ">
              <TextField 
                label="username"
                name="username"
                required
                value={"kautsar"}
                variant='standard'
                fullWidth
                sx={{
                    backgroundColor: 'white', 
                    borderRadius: 3,   
                    paddingY: 1,
                    paddingX: 1
                }}
                InputLabelProps={{
                    style: {
                        padding: '5px 10px',   
                    },
                }}
                ></TextField>
                <TextField 
                  label="password"
                  name="password"
                  required
                  variant='standard'
                  value={"password"}
                  fullWidth
                  sx={{
                      backgroundColor: 'white', 
                      borderRadius: 3,   
                      paddingY: 1,
                      paddingX: 1
                  }}
                  InputLabelProps={{
                      style: {
                          padding: '5px 10px',  
                      },
                  }}
                ></TextField>
                <button 
                  type="submit"
                  // onClick={() => {handleLogin("kautsar","password");}}
                  >Log In</button>
                <button>Exit</button>
            </form>
        </div>
      </>
    )
  }
  
  export default Login