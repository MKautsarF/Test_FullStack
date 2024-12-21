import { useState,useEffect,useRef  } from 'react'
import '../App.css'
import { useLocation } from 'react-router-dom';
import { getProfile } from '../services/auth.services';
import { postAttendance } from '../services/attendance.service';


import {
  Button,Dialog, DialogActions, DialogContent, DialogTitle
} from "@mui/material";

interface User {
  ID: string;
  Name: string;
  Username: string;
  EmailAddress: string;
  Division: string;
  Position: string;
  IsAdmin: boolean;
}

function Home() {
  const location = useLocation();
  const { id } = location.state || {}; 
  // console.log("Received ID:", id);

  const [user, setUser] = useState<User | null>(null);

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

  const [open, setOpen] = useState(false);

  const handleOpenDialog = () => {
    setOpen(true); 
  };

  const handleCloseDialog = () => {
    setOpen(false); 
  };
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

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    if(fileInputRef.current){
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file && user?.ID) {
      console.log('Selected file:', file.name);
      console.log('Selected user?.ID:', user?.ID);
      console.log('Selected formattedDate:', date);
      console.log('Selected time:', time);
      console.log('Selected file:', file);
      postAttendance(user?.ID, date, time, file)
        .then((response) => {
            console.log('Attendance posted successfully:', response);
        })
        .catch((error) => {
            console.error('Error posting attendance:', error);
        });
    }
  };


  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col ">
          <p>{user ? `Welcome, ${user.Name}` : 'Loading user information...'}</p>
          <Button onClick={handleOpenDialog}>profile data</Button>
        </div>
        <p>Today date is: {day}, {date}, {time}</p>
        <Button variant='contained' onClick={handleButtonClick}>Attend</Button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg, image/jpg, image/png" 
        style={{ display: 'none' }} 
        onChange={handleFileChange}
      />

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

export default Home
