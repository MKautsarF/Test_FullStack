import { useState } from 'react'
import '../App.css'
import { useNavigate } from "react-router-dom";

import { loginInstructor, getProfile } from '../services/auth.services';

import {
  TextField, Dialog, DialogActions, DialogContent, DialogTitle, Button
} from "@mui/material";

function Login() {
    const navigate = useNavigate();
    const [token, setToken] = useState('');
    const [open, setOpen] = useState(false);
    const [id, setId] = useState('');
    const [isAdmin, setIsAdmin] = useState('');

    const handleOpenDialog = () => {
      setOpen(true); 
    };
  
    const handleCloseDialog = () => {
      setOpen(false); 
    };

    const handleLogin= async (e: React.FormEvent<HTMLFormElement>) => {

      e.preventDefault(); 
      const formData = new FormData(e.currentTarget);
  
      let username = formData.get("username") as string;
      let password = formData.get("password") as string;

      try {
        const res = await loginInstructor(username, password);
        if (res.success) {
            sessionStorage.setItem('jwt', res);
            setId(res.id);
            setIsAdmin(res.isAdmin);
            console.log(res)
            console.log("id: "+res.id)
            console.log("isAdmin: "+res.isAdmin)
                  
            setToken(res);

            if(res.isAdmin == true){
              handleOpenDialog();
            } else  {
              navigate("/home", { state: { id: res.id } });
            }
            
            username = "";
            password = "";
        } else {
            alert('Invalid credentials');
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
            <p>Log in to do daily attendance</p>
            <form 
              onSubmit={handleLogin}
              className="flex flex-col gap-6 justify-center ">
              <TextField 
                label="username"
                name="username"
                required
                // value={"kautsar"}
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
                  // value={"kautsar"}
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
        
        <Dialog open={open} onClose={handleCloseDialog}>
          <DialogTitle>Profile Data</DialogTitle>
          <DialogContent>
            You are a Admin! Do you wish to continue as Admin?
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="error">
              Close
            </Button>
            <Button onClick={() => {navigate("/home", { state: { id: id } })}} color="secondary">
              No, Continue as Employee
            </Button>
            <Button onClick={() => {navigate("/homeAdmin", { state: { id: id } })}} color="primary">
              Continue
            </Button>
          </DialogActions>
        </Dialog>
      </>
    )
  }
  
  export default Login