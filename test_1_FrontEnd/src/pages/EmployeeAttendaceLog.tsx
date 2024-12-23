import { useState, useEffect, useRef } from "react";
import "../App.css";
import { useLocation, useNavigate } from "react-router-dom";
import { getProfile } from "../services/auth.services";
import {
  employeeAttendanceLog,
  postAttendance,
} from "../services/attendance.service";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
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
  const { id, from, currentUser } = location.state || {};
  // console.log("Received ID:", id);

  const [user, setUser] = useState<User | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);

  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (id) {
        try {
          const resProfile = await getProfile(id);
          console.log(resProfile);
          // console.log(resProfile.data?.Name);

          setUser(resProfile.data);
          console.log("Profile: " + user?.Name);
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      } else {
        console.error("No ID provided");
      }
    };
    fetchProfile();
  }, [id]);

  // useEffect(() => {
  //     if (user) {
  //     console.log('Updated Profile:', user);
  //     }
  // }, [user]);

  useEffect(() => {
    const fetchAttendanceLogs = async () => {
      if (user) {
        try {
          const data = await employeeAttendanceLog(user.ID);

          setAttendanceLogs(data.data);
        } catch (error) {
          console.error("Error fetching attendance logs:", error);
        }
      }
    };

    if (user) {
      fetchAttendanceLogs();
    }
  }, [user]);

  const handleBack = () => {
    navigate(`/${from}`, { state: { id: currentUser } });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-grow ">
          <p className="text-color">
            {user
              ? `${user.Name}'s Attendance Log: `
              : "Loading user information..."}
          </p>
        </div>
        <div className="flex flex-col w-full">
          <TableContainer component={Paper}>
            <Table
              stickyHeader
              aria-label="Employee Attendance Log"
              style={{ minWidth: "800px" }}
            >
              <colgroup>
                <col width="10%" />
                <col width="25%" />
                <col width="20%" />
                <col width="45%" />
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
                    <p className="text-color">Date</p>
                  </TableCell>
                  <TableCell
                    style={{
                      backgroundColor: "#212121",
                    }}
                  >
                    <p className="text-color">Hour</p>
                  </TableCell>
                  <TableCell
                    style={{
                      backgroundColor: "#212121",
                    }}
                  >
                    <p className="text-color">Photo</p>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody
                style={{
                  backgroundColor: "#212121",
                }}
              >
                {attendanceLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} style={{ textAlign: "center" }}>
                      <p className="text-color">No data to be shown</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  attendanceLogs.map((log, index) => (
                    <TableRow key={log.ID}>
                      <TableCell>
                        <p className="text-color">{index + 1}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-color">
                          {log.Date ? formatDate(log.Date) : "N/A"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-color">{log.Hour}</p>
                      </TableCell>
                      <TableCell>
                        {log.File ? (
                          <img
                            src={log.File}
                            alt="Attendance"
                            style={{ width: "100px", height: "100px" }}
                          />
                        ) : (
                          <p className="text-color">No image</p>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
          ></TablePagination>
        </div>
        <div className="absolute bottom-0 left-20 p-12">
          <button
            className="buttonCancel-template"
            // variant="contained"
            color="error"
            onClick={handleBack}
            // style={{ width: '250px' }}
          >
            BACK
          </button>
        </div>
      </div>
    </>
  );
}

export default EmployeeAttendaceLog;
