import { useState,useEffect,useRef  } from 'react'
import '../App.css'
import { useLocation, useNavigate } from 'react-router-dom';
import { getProfile } from '../services/auth.services';
import { employeeAttendanceLog, postAttendance } from '../services/attendance.service';

import {
  Button,Dialog, DialogActions, DialogContent, DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow
} from "@mui/material";

interface User {
  ID: string;
  Name: string;
  Username: string;
  Password: string;
  EmailAddress: string;
  Division: string;
  Position: string;
  IsAdmin: boolean;
}

function EmployeeAttendaceLog() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = location.state || {}; 
    // console.log("Received ID:", id);

    const [user, setUser] = useState<User | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [page, setPage] = useState(1);

    const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);

    useEffect(() => {
        const fetchProfile = async () => {
        if (id){
            try{
            const resProfile = await getProfile(id);
            console.log(resProfile);
            // console.log(resProfile.data?.Name);

            setUser(resProfile.data);
            console.log("Profile: "+ user?.Name);
            } catch (error) {
            console.error('Error fetching profile:', error);
            }
        }else {
            console.error('No ID provided');
        }
        };
        fetchProfile();

    }, [id])

    // useEffect(() => {
    //     if (user) {
    //     console.log('Updated Profile:', user);
    //     }
    // }, [user]);

    useEffect(() => {
        const fetchAttendanceLogs = async () => {
          if (user) {
            try {
              const data = await employeeAttendanceLog(user.ID); // Fetch attendance data
                             
              setAttendanceLogs(data.data); // Update state with fetched data
            } catch (error) {
              console.error('Error fetching attendance logs:', error);
            }
          }
        };
    
        if (user) {
          fetchAttendanceLogs();
        }
      }, [user]);

    const handleBack = () => {
        navigate("/homeAdmin", { state: { id: id } });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    return (
    <>
        <div className="flex flex-col gap-4">
            <div className="flex flex-grow ">
            <p>{user ? `${user.Name}'s Attendance Log: ` : 'Loading user information...'}</p>
            </div>
            <div className="flex flex-col w-full" >
                <TableContainer component={Paper} >
                    <Table stickyHeader aria-label="List of Employee" style={{ minWidth: '800px' }} >
                        <colgroup>
                            <col width="10%" />
                            <col width="25%" />
                            <col width="20%" />
                            <col width="45%" />
                        </colgroup>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    No.
                                </TableCell>
                                <TableCell>
                                    Date
                                </TableCell>
                                <TableCell>
                                    Hour
                                </TableCell>
                                <TableCell>
                                    Photo
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attendanceLogs.map((log, index) => (
                                <TableRow key={log.ID}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{log.Date ? formatDate(log.Date) : 'N/A'}</TableCell>
                                    <TableCell>{log.Hour}</TableCell>
                                    <TableCell>
                                        {log.File ? (
                                            <img
                                                src={log.File} // Assuming the File is base64 or URL formatted
                                                alt="Attendance"
                                                style={{ width: '100px', height: '100px' }}
                                            />
                                        ) : (
                                            <p>No image</p>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>  
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5]}
                    component="div"
                    count={totalPages * pageSize}
                    rowsPerPage={pageSize}
                    page={page - 1}
                    onPageChange={(event, newPage) => setPage(newPage + 1)}
                    onRowsPerPageChange={(event) => setPageSize(parseInt(event.target.value, 10))}
                    sx={{
                        backgroundColor: 'white', 
                        color: 'black',
                        '& .MuiTablePagination-select': {
                            backgroundColor: 'white', 
                            color: 'black', 
                        },
                        '& .MuiTablePagination-actions': {
                            color: 'black', 
                        },
                        }}
                />
            </div>
            <div className="absolute bottom-0 left-20 p-12">
            <Button 
            variant='contained' 
            color = 'error'
            onClick={handleBack} 
            // style={{ width: '250px' }} 
            >Back</Button>
            </div>
        </div>

    </>
    
  )
}

export default EmployeeAttendaceLog
