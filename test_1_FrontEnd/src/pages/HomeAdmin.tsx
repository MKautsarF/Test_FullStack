import { useState, useEffect, ChangeEvent } from "react";
import "../App.css";
import { useLocation, useNavigate } from "react-router-dom";
import {
  addProfile,
  fetchAllEmployees,
  getProfile,
  updateProfile,
  deleteProfile,
} from "../services/auth.services";

import {
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
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
  Checkbox,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Header from "../components/Header";

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
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );

  const [user, setUser] = useState<User | null>(null);
  const [user2, setUser2] = useState<User>({
    ID: "",
    Name: "",
    Username: "",
    Password: "",
    EmailAddress: "",
    Division: "",
    Position: "",
    IsAdmin: false,
  });
  const [userAdd, setUserAdd] = useState<User>({
    ID: "",
    Name: "",
    Username: "",
    Password: "",
    EmailAddress: "",
    Division: "",
    Position: "",
    IsAdmin: false,
  });
  const [employees, setEmployees] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [reloadEmployees, setReloadEmployees] = useState(false);

  const handleDeleteButtonClick = (id: string) => {
    setSelectedEmployeeId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEmployeeId) return;

    try {
      setProfileDelete(true);
      await deleteProfile(selectedEmployeeId);

      setProfileDelete(false);
      setDeleteDialogOpen(false);
      setSelectedEmployeeId(null);
    } catch (error) {
      console.error("Error deleting profile:", error);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedEmployeeId(null);
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
      console.error("Error fetching employee data:", error);
    }
  };

  const handleCloseDialogEdit = () => {
    setOpenEdit(false);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (id) {
        try {
          const resProfile = await getProfile(id);
          console.log("resProfile: " + resProfile);

          setUser(resProfile.data);
          console.log("Profile: " + user);
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      } else {
        console.error("No ID provided");
      }
    };
    fetchProfile();
  }, [openEdit, id]);

  useEffect(() => {
    if (user) {
      console.log("Updated Profile:", user);
    }
  }, [user]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetchAllEmployees(page, pageSize);
        setEmployees(res.data);
        setTotalPages(Math.ceil(res.total / pageSize));
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, [page, pageSize, openAdd, profileDelete, reloadEmployees]);

  const [time, setTime] = useState("");

  const updateTime = () => {
    const today = new Date();

    const hours = today.getHours();
    const minutes = today.getMinutes();
    const seconds = today.getSeconds();

    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    setTime(formattedTime);
  };

  useEffect(() => {
    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const today = new Date();
  const dateNow = today.toISOString().split("T")[0];
  const day = today.toLocaleString("en-us", { weekday: "long" });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleLogout = () => {
    navigate("/");
  };

  const handleSave = async () => {
    if (user2) {
      try {
        const updatedData = await updateProfile(user2);
        console.log("Updated profile:", updatedData);
        handleCloseDialogEdit();
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    } else {
      console.error("No user data available to update");
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser2((prevState) =>
      prevState ? { ...prevState, [name]: value } : prevState
    );
  };

  const handleChangeAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === "IsAdmin") {
      setUserAdd({
        ...userAdd,
        [name]: value === "true",
      });
    } else {
      setUserAdd({ ...userAdd, [name]: value });
    }
  };

  const handleSaveAdd = async (newEmployeeData: User) => {
    try {
      const response = await addProfile(newEmployeeData);
      if (response.success) {
        setUserAdd({
          ID: "",
          Name: "",
          Username: "",
          Password: "",
          EmailAddress: "",
          Division: "",
          Position: "",
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
      <Header
        onAddEmployee={() => setReloadEmployees((prev) => !prev)}
        title={
          user ? `Welcome, admin: ${user.Name}` : "Loading user information..."
        }
        subtitle="PROFILE"
        user={user}
        // subtitle2="Attendance Log"
        subtitle3="ADD NEW EMPLOYEES"
        from="homeAdmin"
      ></Header>
      <div className="flex flex-col gap-4">
        {/* <div className="flex flex-col ">
                <p>{user ? `Welcome, Admin ${user.Name}` : 'Loading user information...'}</p>
                <Button onClick={handleOpenDialog}>profile data</Button>
            </div> */}
        {/* <div className="flex justify-between flex-grow justify-center items-center gap-6">
          <p>
            {day}, {formatDate(dateNow)}. {time}
          </p>
          <Button variant="contained" onClick={() => handleOpenDialogAdd()}>
            Add new Employee
          </Button>
        </div> */}
        <div className="flex justify-between flex-grow justify-center items-center gap-6">
          <p className="text-color">List of Employees:</p>
          <p className="text-color">
            {day}, {formatDate(dateNow)}. {time}
          </p>
        </div>
        <div className="absolute bottom-0 left-16 p-12 z-50">
          <button
            className="buttonCancel-template"
            // variant="contained"
            color="error"
            onClick={handleLogout}
            // style={{ width: '250px' }}
          >
            LOG OUT
          </button>
        </div>
        <div className="flex flex-col w-full">
          <TableContainer component={Paper}>
            <Table
              stickyHeader
              aria-label="List of Employees"
              style={{ minWidth: "1000px" }}
            >
              <colgroup>
                <col width="10%" />
                <col width="35%" />
                <col width="55%" />
              </colgroup>
              <TableHead>
                <TableRow>
                  <TableCell
                    style={{
                      backgroundColor: "#212121",
                    }}
                  >
                    <p className="text-color">No.</p>
                  </TableCell>
                  <TableCell
                    style={{
                      backgroundColor: "#212121",
                    }}
                  >
                    <p className="text-color">Employee's Name</p>
                  </TableCell>
                  <TableCell
                    style={{
                      backgroundColor: "#212121",
                    }}
                  >
                    <p className="text-color">Details</p>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody
                style={{
                  backgroundColor: "#212121",
                }}
              >
                {employees.map((employee, index) => (
                  <TableRow key={employee.ID}>
                    <TableCell>
                      <p className="text-color">
                        {(page - 1) * pageSize + index + 1}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-color">{employee.Name}</p>
                    </TableCell>
                    <TableCell
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        paddingLeft: "2rem",
                        paddingRight: "2rem",
                      }}
                    >
                      <button
                        className="buttonContent-template"
                        // variant="outlined"
                        onClick={() =>
                          navigate("/homeAdmin/AttendanceLog", {
                            state: {
                              id: employee.ID,
                              from: "homeAdmin",
                              currentUser: user?.ID,
                            },
                          })
                        }
                      >
                        View Attendance
                      </button>
                      <button
                        className="buttonContent-template"
                        // variant="outlined"
                        onClick={() => handleOpenDialogEdit(employee.ID)}
                      >
                        Edit
                      </button>
                      <button
                        className="buttonCancelContent-template"
                        // color="error"
                        // variant="outlined"
                        onClick={() => handleDeleteButtonClick(employee.ID)}
                      >
                        Delete
                      </button>
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
            onRowsPerPageChange={(event) =>
              setPageSize(parseInt(event.target.value, 5))
            }
            style={{
              backgroundColor: "#212121",
              color: "#f9f7f7",
            }}
          />
        </div>
      </div>

      <Dialog open={openEdit} onClose={handleCloseDialogEdit}>
        <DialogTitle
          style={{
            fontWeight: "bold",
            backgroundColor: "#323232",
            color: "#14FFEC",
          }}
        >
          Edit Profile Data
        </DialogTitle>
        <DialogContent
          style={{
            backgroundColor: "#323232",
            color: "#f9f7f7",
          }}
        >
          <TextField
            label="Employee ID"
            required
            name="ID"
            value={user2?.ID || ""}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              style: {
                color: "#0D7377",
              },
            }}
            InputProps={{
              style: {
                color: "#f9f7f7",
              },
            }}
            disabled
          />
          <TextField
            label="Employee Name"
            required
            name="Name"
            value={user2?.Name || ""}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              style: {
                color: "#0D7377",
              },
            }}
            InputProps={{
              style: {
                color: "#f9f7f7",
              },
            }}
          />
          <TextField
            label="Employee Username"
            required
            name="Username"
            value={user2?.Username || ""}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              style: {
                color: "#0D7377",
              },
            }}
            InputProps={{
              style: {
                color: "#f9f7f7",
              },
            }}
          />
          <TextField
            label="Employee Password"
            required
            name="Password"
            value={user2?.Password || ""}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              style: {
                color: "#0D7377",
              },
            }}
            InputProps={{
              style: {
                color: "#f9f7f7",
              },
            }}
          />
          <TextField
            label="Employee Email"
            required
            name="EmailAddress"
            value={user2?.EmailAddress || ""}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              style: {
                color: "#0D7377",
              },
            }}
            InputProps={{
              style: {
                color: "#f9f7f7",
              },
            }}
          />
          <TextField
            label="Employee Division"
            required
            name="Division"
            value={user2?.Division || ""}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              style: {
                color: "#0D7377",
              },
            }}
            InputProps={{
              style: {
                color: "#f9f7f7",
              },
            }}
          />
          <TextField
            label="Employee Position"
            required
            name="Position"
            value={user2?.Position || ""}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              style: {
                color: "#0D7377",
              },
            }}
            InputProps={{
              style: {
                color: "#f9f7f7",
              },
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={user2?.IsAdmin}
                onChange={(event) => {
                  setUser2({
                    ...user2,
                    IsAdmin: event.target.checked,
                  });
                }}
                sx={{
                  color: "#f9f7f7",
                  "&.Mui-checked": {
                    color: "#14ffec",
                  },
                }}
              />
            }
            label="Is Admin"
            sx={{
              color: userAdd.IsAdmin ? "#14ffec" : "#f9f7f7",
            }}
          />
        </DialogContent>
        <DialogActions
          style={{
            backgroundColor: "#323232",
          }}
        >
          <button
            onClick={handleCloseDialogEdit}
            className="buttonCancelDialog-template"
          >
            CLOSE
          </button>
          <button onClick={handleSave} className="buttonDialog-template">
            EDIT
          </button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAdd} onClose={handleCloseDialogAdd}>
        <DialogTitle>Add New Employee Profile</DialogTitle>
        <DialogContent>
          <TextField
            label="Employee Name"
            name="Name"
            value={userAdd.Name}
            onChange={handleChangeAdd}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Username"
            name="Username"
            value={userAdd.Username}
            onChange={handleChangeAdd}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            // type="password"
            name="Password"
            value={userAdd.Password}
            onChange={handleChangeAdd}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Employee Email"
            name="EmailAddress"
            value={userAdd.EmailAddress}
            onChange={handleChangeAdd}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Employee Division"
            name="Division"
            value={userAdd.Division}
            onChange={handleChangeAdd}
            fullWidth
            margin="normal"
          />
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
                checked={userAdd.IsAdmin}
                onChange={(event) => {
                  setUserAdd({
                    ...userAdd,
                    IsAdmin: event.target.checked,
                  });
                }}
                color="primary"
              />
            }
            label="Is Admin"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogAdd} color="primary">
            Close
          </Button>
          <Button onClick={() => handleSaveAdd(userAdd)} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* <Dialog open={open} onClose={handleCloseDialog}>
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
        </Dialog> */}

      <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
        <DialogTitle
          style={{
            fontWeight: "bold",
            backgroundColor: "#323232",
            color: "#14FFEC",
          }}
        >
          Confirm Deletion
        </DialogTitle>
        <DialogContent
          style={{
            backgroundColor: "#323232",
            color: "#f9f7f7",
          }}
        >
          <p className="text-color">
            Are you sure you want to delete this profile?
          </p>
        </DialogContent>
        <DialogActions
          style={{
            backgroundColor: "#323232",
          }}
        >
          <button onClick={cancelDelete} className="buttonDialog-template">
            CANCEL
          </button>
          <button
            onClick={confirmDelete}
            className="buttonCancelDialog-template"
          >
            DELETE
          </button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default HomeAdmin;
