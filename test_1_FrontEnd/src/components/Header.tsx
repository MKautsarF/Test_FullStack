import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addProfile, fetchAllEmployees } from "../services/auth.services";
import { FormatBold } from "@mui/icons-material";

interface HeaderProps {
  onAddEmployee?: () => void;
  title: string;
  subtitle?: string;
  subtitle2?: string; // attendance viewL employee
  subtitle3?: string; // add new employee: admin
  from?: string;
  user?: User | null;
  children?: React.ReactNode;
}

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

const Header: React.FC<HeaderProps> = ({
  onAddEmployee,
  title,
  subtitle,
  subtitle2,
  subtitle3,
  user,
  children,
  from,
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
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
        if (onAddEmployee) {
          onAddEmployee(); // Safely call the function if it exists
        }
      }
    } catch (error) {
      console.error("Error adding new employee:", error);
    }
  };
  const textColor =
    from === "home" || from === "homeAdmin" ? "#F9F7F7" : "#14ffec";

  return (
    <header
      className="bg-white shadow-lg p-3 fixed top-0 left-0 w-full z-50 "
      style={{
        backgroundColor: "#212121",
        borderBottom: "3px solid #14FFEC",
      }}
    >
      <div className=" flex justify-between items-center w-full px-4 gap-4">
        <h1 style={{ fontSize: "1.25rem", margin: 0, color: textColor }}>
          {title}
        </h1>
        <div className="flex gap-4 ml-auto items-center ">
          {subtitle && (
            <button
              // variant="contained"
              className="button-template"
              style={{ fontSize: "0.8rem" }}
              onClick={handleOpenDialog}
            >
              {subtitle}
            </button>
          )}
          {subtitle2 && (
            <button
              // variant="contained"
              className="button-template"
              style={{ fontSize: "0.8rem" }}
              onClick={() =>
                navigate("/homeAdmin/AttendanceLog", {
                  state: { id: user?.ID, from: from, currentUser: user?.ID },
                })
              }
            >
              {subtitle2}
            </button>
          )}
          {subtitle3 && (
            <button
              // variant="contained"
              className="button-template"
              style={{ fontSize: "0.8rem" }}
              onClick={() => handleOpenDialogAdd()}
            >
              {subtitle3}
            </button>
          )}
          {children && <div>{children}</div>}
        </div>
      </div>

      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle
          style={{
            fontWeight: "bold",
            backgroundColor: "#323232",
            color: "#14FFEC",
          }}
        >
          {" "}
          Profile Data
        </DialogTitle>
        <DialogContent
          style={{
            width: "350px",
            backgroundColor: "#323232",
            color: "#f9f7f7",
          }}
          className="flex flex-col"
        >
          <p className="text-color">Employee ID: {user?.ID}</p>
          <p className="text-color">Employee Name: {user?.Name}</p>
          <p className="text-color">Employee Email: {user?.EmailAddress}</p>
          <p className="text-color">Employee Division: {user?.Division}</p>
          <p className="text-color">Employee Position: {user?.Position}</p>
        </DialogContent>
        <DialogActions
          style={{
            backgroundColor: "#323232",
          }}
        >
          <Button
            onClick={handleCloseDialog}
            style={{
              color: "#14FFEC",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAdd} onClose={handleCloseDialogAdd}>
        <DialogTitle style={{ fontWeight: "bold" }}>
          Add New Employee Profile
        </DialogTitle>
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
    </header>
  );
};

export default Header;
