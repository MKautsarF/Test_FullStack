import { useState, useEffect } from 'react'
import '../App.css'
import { useLocation, useNavigate } from "react-router-dom";
import { getProfile } from '../services/auth.services';

import {
  TextField, Dialog, DialogActions, DialogContent, DialogTitle, Button,
  Box,
  InputAdornment,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  CircularProgress,
  TableBody,
  TablePagination
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface User {
    ID: string;
    Name: string;
    Username: string;
    EmailAddress: string;
    Division: string;
    Position: string;
    IsAdmin: boolean;
}

function HomeAdmin() {
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const { id } = location.state || {}; 

    const [user, setUser] = useState<User | null>(null);

    const handleOpenDialog = () => {
      setOpen(true); 
    };
  
    const handleCloseDialog = () => {
      setOpen(false); 
    };

    useEffect(() => {
        const fetchProfile = async () => {
          if (id){
            try{
              const resProfile = await getProfile(id);
              console.log(resProfile);
              // console.log(resProfile.data?.Name);
    
              setUser(resProfile.data);
              console.log("Profile: "+ user);
            } catch (error) {
              console.error('Error fetching profile:', error);
            }
          }else {
            console.error('No ID provided');
          }
        };
        fetchProfile();
    
    }, [id])      
    
    useEffect(() => {
        if (user) {
            console.log('Updated Profile:', user);
        }
    }, [user]);

    const [time, setTime] = useState('');

    const updateTime = () => {
        const today = new Date();

        const hours = today.getHours();
        const minutes = today.getMinutes();
        const seconds = today.getSeconds();

        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        setTime(formattedTime);
    };
    
    useEffect(() => {
        updateTime();

        const intervalId = setInterval(updateTime, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const today = new Date();
    const date = today.toISOString().split('T')[0]; 
    const day = today.toLocaleString('en-us', { weekday: 'long' });

    const handleLogout = () => {
        navigate("/");
      };

    return (
      <>
        <div className="flex flex-col gap-4">
            <div className="flex flex-col ">
                <p>{user ? `Welcome, Admin ${user.Name}` : 'Loading user information...'}</p>
                <Button onClick={handleOpenDialog}>profile data</Button>
            </div>
                <p>Today date is: {day}, {date}, {time}</p>
                <div className="flex flex-box justify-center ">
            </div>
            <div className="absolute bottom-0 left-20 p-12">
                <Button 
                variant='contained' 
                color = 'error'
                onClick={handleLogout} 
                // style={{ width: '250px' }} 
                >Log Out</Button>
            </div>
            <div className="flex px-6 pt-4 pb-1 w-full">
                <TableContainer component={Paper}>
                    <Table stickyHeader aria-label="List of Employee">
                        <colgroup>
                            <col width="10%" />
                            <col width="45%" />
                            <col width="45%" />
                        </colgroup>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    Number
                                </TableCell>
                                <TableCell>
                                    Employee's Name
                                </TableCell>
                                <TableCell>
                                    Details
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    test 1
                                </TableCell>
                                <TableCell>
                                    test 2
                                </TableCell>
                                <TableCell>
                                    test 3
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>

        <Dialog open={open} onClose={handleCloseDialog}>
            <DialogTitle>Profile Data</DialogTitle>
            <DialogContent>
            <p>Employee ID: {user?.ID}</p>
            <p>Employee Name: {user?.Name}</p>
            <p>Employee Email: {user?.EmailAddress}</p>
            <p>Employee Division: {user?.Division}</p>
            <p>Employee Position: {user?.Position}</p>
            </DialogContent>
            <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
                Close
            </Button>
            </DialogActions>
        </Dialog>
      </>
    )
  }
  
  export default HomeAdmin