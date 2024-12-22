import { useState, useEffect, ChangeEvent } from 'react'
import '../App.css'
import { useLocation, useNavigate } from "react-router-dom";
import { addProfile, fetchAllEmployees, getProfile, updateProfile, deleteProfile } from '../services/auth.services';

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
  TablePagination,
  FormControlLabel,
  Checkbox
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

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

function HomeAdmin() {
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openAdd, setOpenAdd] = useState(false);
    const { id } = location.state || {}; 
    const [profileDelete, setProfileDelete] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);


    const [user, setUser] = useState<User | null>(null);
    const [user2, setUser2] = useState<User>({
        ID: '',
        Name: '',
        Username: '',
        Password: '',
        EmailAddress: '',
        Division: '',
        Position: '',
        IsAdmin: false,
    });
    const [userAdd, setUserAdd] = useState<User>({
        ID: '',
        Name: '',
        Username: '',
        Password: '',
        EmailAddress: '',
        Division: '',
        Position: '',
        IsAdmin: false,
    });
    const [employees, setEmployees] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const handleDeleteButtonClick = (id: string) => {
        setSelectedEmployeeId(id); 
        setDeleteDialogOpen(true); 
    };

    const confirmDelete = async () => {
        if (!selectedEmployeeId) return; // Safety check
    
        try {
            setProfileDelete(true); 
            await deleteProfile(selectedEmployeeId); // Execute the deletion
            
            setProfileDelete(false); 
            setDeleteDialogOpen(false); // Close the dialog
            setSelectedEmployeeId(null); // Clear the selected employee
        } catch (error) {
            console.error("Error deleting profile:", error);
        }
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false); // Close the dialog
        setSelectedEmployeeId(null); // Clear the selected employee
    };
    
    // const handleDelete = async  (id: string) => {
    //     try {
    //         setProfileDelete(true); 
    //         await deleteProfile(id); 
    //         setProfileDelete(false); 
    //     } catch (error) {
    //         console.error("Error deleting profile:", error);
    //     } finally {
    //         setProfileDelete(false); 
    //     }
    // };

    const handleOpenDialog = () => {
        setOpen(true); 
    };
  
    const handleCloseDialog = () => {
        setOpen(false); 
    };

    const handleOpenDialogAdd = () => {
        setOpenAdd(true); 
    };
    
    const handleCloseDialogAdd = () => {
        setOpenAdd(false); 
    };
    
    const handleOpenDialogEdit = async (employeeId: string) => {
        try {
            const response = await getProfile(employeeId); 
            console.log("Fetched employee data:", response.data);
    
            setUser2(response.data); 
            console.log("Fetched new user data:", user2);
            setOpenEdit(true); 
        } catch (error) {
            console.error('Error fetching employee data:', error);
        }
    };
    
    
    const handleCloseDialogEdit = () => {
      setOpenEdit(false); 
    };

    useEffect(() => {
        const fetchProfile = async () => {
          if (id){
            try{
              const resProfile = await getProfile(id);
              console.log("resProfile: "+resProfile);
              
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
    
    }, [openEdit, id])      
    
    useEffect(() => {
        if (user) {
            console.log('Updated Profile:', user);
        }
    }, [user]);
    
    useEffect(() => {
      const fetchEmployees = async () => {
        setLoading(true);
        try {
          const res = await fetchAllEmployees(page, pageSize);
          setEmployees(res.data);
          setTotalPages(Math.ceil(res.total / pageSize));
        } catch (error) {
          console.error("Error fetching employees:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchEmployees();
    }, [page, pageSize, openAdd, profileDelete]);

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

    const handleSave = async () => {
        if (user2) {
            try {
                const updatedData = await updateProfile(user2); // Now `user` is guaranteed to be of type `User`
                console.log('Updated profile:', updatedData);
                handleCloseDialogEdit();  
            } catch (error) {
                console.error('Error updating profile:', error);
            }
        } else {
            console.error('No user data available to update');
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser2((prevState) => prevState ? { ...prevState, [name]: value } : prevState)
    };

    const handleChangeAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
    
        // If the field is IsAdmin, convert the value to a boolean
        if (name === 'IsAdmin') {
            setUserAdd({
                ...userAdd,
                [name]: value === 'true',  // Convert string 'true' to boolean true, and 'false' to false
            });
        } else {
            setUserAdd({ ...userAdd, [name]: value });
        }
    };

    const handleSaveAdd = async (newEmployeeData: User) => {
        try {
            // Assuming you have a service to add new employee data
            
            const response = await addProfile(newEmployeeData); 
            if (response.success) {
                
                setUserAdd({
                    ID: '',
                    Name: '',
                    Username: '',
                    Password: '',
                    EmailAddress: '',
                    Division: '',
                    Position: '',
                    IsAdmin: false,
                });
                handleCloseDialogAdd(); 
            }
        } catch (error) {
            console.error("Error adding new employee:", error);
        }
    };
    
    return (
      <>
        <div className="flex flex-col gap-4">
            <div className="flex flex-col ">
                <p>{user ? `Welcome, Admin ${user.Name}` : 'Loading user information...'}</p>
                <Button onClick={handleOpenDialog}>profile data</Button>
            </div>
            <div className="flex flex-grow justify-center items-center gap-6">
                <p>Today date is: {day}, {date}, {time}</p>
                <Button
                    variant='contained'
                    onClick={() => handleOpenDialogAdd()}
                    >Add new Employee
                </Button>
            </div>
            <div className="absolute bottom-0 left-16 p-12 z-50">
                <Button 
                variant='contained' 
                color = 'error'
                onClick={handleLogout} 
                // style={{ width: '250px' }} 
                >Log Out</Button>
            </div>
            <div className="flex flex-col w-full" >
                <TableContainer component={Paper} >
                    <Table stickyHeader aria-label="List of Employee" style={{ minWidth: '800px' }} >
                        <colgroup>
                            <col width="10%" />
                            <col width="40%" />
                            <col width="50%" />
                        </colgroup>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    No.
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
                            {employees.map((employee, index) => (
                            <TableRow key={employee.ID}>
                                <TableCell>{(page - 1) * pageSize + index + 1}</TableCell>
                                <TableCell>{employee.Name}</TableCell>
                                <TableCell style={{ display: 'flex', gap: '50px' }}> 
                                    <Button variant='outlined' onClick={() => navigate("/homeAdmin/AttendanceLog", { state: { id: employee.ID } }) }>View</Button>
                                    <Button variant='outlined' onClick={() => handleOpenDialogEdit(employee.ID)}>Edit</Button>
                                    <Button 
                                        color="error" 
                                        variant="outlined" 
                                        onClick={() => handleDeleteButtonClick(employee.ID)}
                                    >
                                        Delete
                                    </Button>
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
        </div>

        <Dialog open={openEdit} onClose={handleCloseDialogEdit}>
            <DialogTitle>Edit Profile Data</DialogTitle>
            <DialogContent>
                <TextField
                    label="Employee ID"
                    name="ID"
                    value={user2?.ID|| ''}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    disabled
                />
                <TextField
                    label="Employee Name"
                    name="Name"
                    value={user2?.Name|| ''}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Employee Username"
                    name="Username"
                    value={user2?.Username|| ''}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Employee Password"
                    name="Password"
                    value={user2?.Password|| ''}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Employee Email"
                    name="EmailAddress"
                    value={user2?.EmailAddress|| ''}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Employee Division"
                    name="Division"
                    value={user2?.Division|| ''}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Employee Position"
                    name="Position"
                    value={user2?.Position|| ''}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                        checked={user2?.IsAdmin}  // Boolean value directly mapped to the checkbox's checked property
                        onChange={(event) => {
                            setUser2({
                            ...user2,
                            IsAdmin: event.target.checked // Directly use the boolean value from event.target.checked
                            });
                        }}
                        color="primary"
                        />
                    }
                    label="Is Admin"
                />
            </DialogContent>
            <DialogActions>
            <Button onClick={handleCloseDialogEdit} color="primary">
                Close
            </Button>
            <Button onClick={handleSave} color="primary">
                Save
            </Button>
            </DialogActions>
        </Dialog>

        <Dialog open={openAdd} onClose={handleCloseDialogAdd}>
            <DialogTitle>Add New Employee Profile</DialogTitle>
            <DialogContent>
                {/* Employee Name */}
                <TextField
                    label="Employee Name"
                    name="Name"
                    value={userAdd.Name}
                    onChange={handleChangeAdd}
                    fullWidth
                    margin="normal"
                />
                {/* Employee Username */}
                <TextField
                    label="Username"
                    name="Username"
                    value={userAdd.Username}
                    onChange={handleChangeAdd}
                    fullWidth
                    margin="normal"
                />
                {/* Employee Password */}
                <TextField
                    label="Password"
                    // type="password"
                    name="Password"
                    value={userAdd.Password}
                    onChange={handleChangeAdd}
                    fullWidth
                    margin="normal"
                />
                {/* Employee Email */}
                <TextField
                    label="Employee Email"
                    name="EmailAddress"
                    value={userAdd.EmailAddress}
                    onChange={handleChangeAdd}
                    fullWidth
                    margin="normal"
                />
                {/* Employee Division */}
                <TextField
                    label="Employee Division"
                    name="Division"
                    value={userAdd.Division}
                    onChange={handleChangeAdd}
                    fullWidth
                    margin="normal"
                />
                {/* Employee Position */}
                <TextField
                    label="Employee Position"
                    name="Position"
                    value={userAdd.Position}
                    onChange={handleChangeAdd}
                    fullWidth
                    margin="normal"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                        checked={userAdd.IsAdmin}  // Boolean value directly mapped to the checkbox's checked property
                        onChange={(event) => {
                            setUserAdd({
                            ...userAdd,
                            IsAdmin: event.target.checked // Directly use the boolean value from event.target.checked
                            });
                        }}
                        color="primary"
                        />
                    }
                    label="Is Admin"
                />
            </DialogContent>
            <DialogActions>
                {/* Close button */}
                <Button onClick={handleCloseDialogAdd} color="primary">
                    Close
                </Button>
                {/* Save button to handle saving the new profile */}
                <Button
                    onClick={() => handleSaveAdd(userAdd)}  // Pass the profile data when saving
                    color="primary"
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>

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

        <Dialog
            open={deleteDialogOpen}
            onClose={cancelDelete}
        >
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
                <p>Are you sure you want to delete this profile?</p>
            </DialogContent>
            <DialogActions>
                <Button onClick={cancelDelete} color="primary">
                    Cancel
                </Button>
                <Button onClick={confirmDelete} color="error">
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>

      </>
    )
  }
  
  export default HomeAdmin