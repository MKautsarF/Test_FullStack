import { useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";

import { loginInstructor, getProfile } from "../services/auth.services";

import {
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";

function Login() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [id, setId] = useState("");

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    let username = formData.get("username") as string;
    let password = formData.get("password") as string;

    try {
      const res = await loginInstructor(username, password);
      if (res.success) {
        sessionStorage.setItem("jwt", res);
        setId(res.id);
        console.log(res);
        console.log("id: " + res.id);
        console.log("isAdmin: " + res.isAdmin);

        if (res.isAdmin == true) {
          handleOpenDialog();
        } else {
          navigate("/home", { state: { id: res.id } });
        }

        username = "";
        password = "";
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong during login");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-10">
        <h1 className="text-color">Attendance App</h1>
        <p className="text-color">Log in to do daily attendance</p>
        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-6 justify-center items-center"
        >
          <TextField
            label="username"
            name="username"
            required
            // value={"kautsar"}
            variant="standard"
            fullWidth
            sx={{
              backgroundColor: "#f9f7f7",
              borderRadius: 3,
              paddingY: 1,
              paddingX: 1,
            }}
            InputLabelProps={{
              style: {
                color: "#0D7377",
                padding: "5px 10px",
              },
            }}
            InputProps={{
              style: {
                color: "#212121",
              },
            }}
          ></TextField>
          <TextField
            label="password"
            name="password"
            required
            variant="standard"
            // value={"kautsar"}
            fullWidth
            sx={{
              backgroundColor: "#f9f7f7",
              borderRadius: 3,
              paddingY: 1,
              paddingX: 1,
            }}
            InputLabelProps={{
              style: {
                color: "#0D7377",
                padding: "5px 10px",
              },
            }}
            InputProps={{
              style: {
                color: "#212121",
              },
            }}
          ></TextField>
          <button
            className="button-template"
            type="submit"
            style={{ minWidth: "450px" }}
            // onClick={() => {handleLogin("kautsar","password");}}
          >
            LOG IN
          </button>
          <button
            className="buttonCancel-template"
            style={{ minWidth: "450px" }}
          >
            EXIT
          </button>
        </form>
      </div>

      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle
          style={{
            fontWeight: "bold",
            backgroundColor: "#323232",
            color: "#14FFEC",
          }}
        >
          Log in as an Admin?
        </DialogTitle>
        <DialogContent
          style={{
            backgroundColor: "#323232",
            color: "#f9f7f7",
          }}
        >
          <p className="text-color">
            You are an Admin! Do you wish to continue as an Admin?
          </p>
        </DialogContent>
        <DialogActions
          style={{
            backgroundColor: "#323232",
          }}
        >
          <div className="flex justify-between items-center w-full ">
            <button
              onClick={handleCloseDialog}
              className="buttonCancelDialog-template"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                navigate("/home", { state: { id: id } });
              }}
              className="buttonMidDialog-template"
            >
              No, Continue as Employee
            </button>
            <button
              onClick={() => {
                navigate("/homeAdmin", { state: { id: id } });
              }}
              className="buttonDialog-template"
            >
              Continue
            </button>
          </div>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Login;
