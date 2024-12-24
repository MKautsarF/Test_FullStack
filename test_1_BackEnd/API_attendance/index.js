const express = require("express");
const app = express();
const PORT = 8080;
const { Client } = require("pg");
const cors = require("cors");
const multer = require("multer");

const storage = multer.memoryStorage();

app.use(cors());
app.use(express.json());
const upload = multer({ storage: storage });

const dbConfig = {
  user: "postgres",
  host: "127.0.0.1",
  // password: '12345678',
  password: "gravityfalls",
  port: 5432,
  database: "Attendance_1",
};

async function setupDatabase() {
  const defaultClient = new Client({ ...dbConfig, database: "postgres" });
  try {
    await defaultClient.connect();
    console.log("Connected to PostgreSQL default database.");

    const checkDbQuery = `
            SELECT 1 
            FROM pg_database 
            WHERE datname = 'Attendance_1';
        `;
    const result = await defaultClient.query(checkDbQuery);

    if (result.rowCount === 0) {
      const createDbQuery = 'CREATE DATABASE "Attendance_1";';
      await defaultClient.query(createDbQuery);
      console.log('Database "Attendance_1" created successfully.');
    } else {
      console.log('Database "Attendance_1" already exists.');
    }
  } catch (error) {
    console.error("Error ensuring database:", error.message);
  } finally {
    await defaultClient.end();
  }

  const client = new Client(dbConfig);
  try {
    await client.connect();
    console.log("Connected to PostgreSQL Attendance_1 database.");

    const createTableEmployeeQuery = `
            CREATE TABLE IF NOT EXISTS "Employee" (
                "ID" SERIAL PRIMARY KEY, 
                "Name" VARCHAR(255) NOT NULL,
                "Username" VARCHAR(255) NOT NULL UNIQUE,
                "Password" VARCHAR(255) NOT NULL,
                "EmailAddress" VARCHAR(255) NOT NULL,
                "Division" VARCHAR(255) NOT NULL,
                "Position" VARCHAR(255) NOT NULL,
                "IsAdmin" BOOLEAN NOT NULL DEFAULT FALSE 
            );
        `;
    await client.query(createTableEmployeeQuery);
    console.log('Table "Employee" ensured to exist.');

    const createTableAttendanceLogQuery = `
            CREATE TABLE IF NOT EXISTS "AttendanceLog" (
                "ID" SERIAL PRIMARY KEY, 
                "EmployeeID" SERIAL NOT NULL,
                "EmployeeName" VARCHAR(255),
                "Date" DATE NOT NULL,
                "Hour" TIME NOT NULL,
                "File" BYTEA NOT NULL,
                FOREIGN KEY ("EmployeeID") REFERENCES "Employee"("ID")
            );
        `;
    await client.query(createTableAttendanceLogQuery);
    console.log('Table "Attendance Log" ensured to exist.');

    const createFunctionQuery = `
            CREATE OR REPLACE FUNCTION set_employee_name() 
            RETURNS TRIGGER AS $$
            BEGIN
                SELECT "Name" INTO NEW."EmployeeName" 
                FROM "Employee" 
                WHERE "ID" = NEW."EmployeeID";
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `;
    await client.query(createFunctionQuery);
    console.log('Function "set_employee_name" created.');

    const createTriggerQuery = `
            CREATE TRIGGER set_employee_name_trigger
            BEFORE INSERT ON "AttendanceLog"
            FOR EACH ROW
            EXECUTE FUNCTION set_employee_name();
        `;
    await client.query(createTriggerQuery);
    console.log('Trigger "set_employee_name_trigger" created.');
  } catch (error) {
    console.error("Error setting up database:", error.message);
  } finally {
    await client.end();
  }
}

setupDatabase();

app.listen(PORT, () => console.log(`masuk di http://localhost:${PORT}`));

app.post("/Authorization", async (req, res) => {
  const { Username, Password } = req.body;

  if (!Username || !Password) {
    return res.status(400).send({
      success: false,
      message: "Username and Password are required",
    });
  }

  const client = new Client(dbConfig);
  try {
    await client.connect();

    const query = `
            SELECT "Username", "Password", "ID", "IsAdmin"
            FROM "Employee"
            WHERE "Username" = $1;
        `;
    const result = await client.query(query, [Username]);

    if (result.rows.length === 0) {
      return res.status(401).send({
        success: false,
        message: "Invalid username or password",
      });
    }

    const user = result.rows[0];

    if (user.Password === Password) {
      return res.status(200).send({
        success: true,
        message: "Authentication successful",
        id: user.ID,
        isAdmin: user.IsAdmin,
      });
    } else {
      return res.status(401).send({
        success: false,
        message: "Invalid username or password",
      });
    }
  } catch (error) {
    console.error("Error during authentication:", error.message);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  } finally {
    await client.end();
  }
});

app.get("/profile/:id", async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).send({
      success: false,
      message: "User ID is required",
    });
  }

  const client = new Client(dbConfig);
  try {
    await client.connect();

    const query = `SELECT "ID", "Name", "Username", "EmailAddress", "Division", "Position", "IsAdmin" FROM "Employee" WHERE "ID" = $1`;
    const result = await client.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const user = result.rows[0];
    return res.status(200).send({
      success: true,
      message: "User profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  } finally {
    await client.end();
  }
});

app.post("/PostAttendance", upload.single("File"), async (req, res) => {
  const { EmployeeID, Date, Hour } = req.body;
  const file = req.file;
  console.log("Body:", req.body);
  console.log("File:", req.file);

  if (!EmployeeID || !Date || !Hour || !file) {
    if (!req.file) {
      return res.status(400).send({ message: "File is required." });
    }
    return res.status(400).send({
      message: "EmployeeID, Date, Hour, and File are required.",
    });
  }

  try {
    const client = new Client({
      user: "postgres",
      host: "127.0.0.1",
      database: "Attendance_1",
      // password: '12345678',
      password: "gravityfalls",
      port: 5432,
    });

    await client.connect();

    const query = `
            INSERT INTO "AttendanceLog" ("EmployeeID", "Date", "Hour", "File")
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;

    const fileBuffer = file.buffer;

    const result = await client.query(query, [
      EmployeeID,
      Date,
      Hour,
      fileBuffer,
    ]);

    await client.end();

    res.status(200).send({
      message: "Attendance data inserted successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error inserting attendance data:", error.message);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.get("/allEmployees", async (req, res) => {
  const { page = 1, size = 10 } = req.query;

  const limit = parseInt(size, 10);
  const offset = (parseInt(page, 10) - 1) * limit;

  const client = new Client(dbConfig);

  try {
    await client.connect();

    const query = `
            SELECT "ID", "Name", "Username", "EmailAddress", "Division", "Position", "IsAdmin"
            FROM "Employee"
            LIMIT $1 OFFSET $2;
        `;

    const result = await client.query(query, [limit, offset]);

    const countQuery = `SELECT COUNT(*) FROM "Employee"`;
    const countResult = await client.query(countQuery);

    res.json({
      total: countResult.rows[0].count,
      page: parseInt(page, 10),
      size: limit,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Failed to fetch employees" });
  } finally {
    await client.end();
  }
});

app.put("/editProfile/:id", async (req, res) => {
  const userId = req.params.id;
  const {
    Name,
    Username,
    Password,
    EmailAddress,
    Division,
    Position,
    IsAdmin,
  } = req.body;

  if (!userId) {
    return res.status(400).send({
      success: false,
      message: "User ID is required",
    });
  }

  if (
    !Name ||
    !Username ||
    !Password ||
    !EmailAddress ||
    !Division ||
    !Position
  ) {
    return res.status(400).send({
      success: false,
      message:
        "All fields (Name, Username, Password, EmailAddress, Division, Position) are required to update the profile",
    });
  }

  const client = new Client(dbConfig);
  try {
    await client.connect();

    const query = `
            UPDATE "Employee"
            SET "Name" = $1, "Username" = $2, "Password" = $3,"EmailAddress" = $4, "Division" = $5, "Position" = $6, "IsAdmin" = $7
            WHERE "ID" = $8
            RETURNING "ID", "Name", "Username", "Password" ,"EmailAddress", "Division", "Position", "IsAdmin";
        `;

    const values = [
      Name,
      Username,
      Password,
      EmailAddress,
      Division,
      Position,
      IsAdmin,
      userId,
    ];
    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const updatedUser = result.rows[0];
    return res.status(200).send({
      success: true,
      message: "User profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  } finally {
    await client.end();
  }
});

app.post("/addProfile", async (req, res) => {
  const {
    Name,
    Username,
    Password,
    EmailAddress,
    Division,
    Position,
    IsAdmin,
  } = req.body;

  if (
    !Name ||
    !Username ||
    !Password ||
    !EmailAddress ||
    !Division ||
    !Position ||
    IsAdmin === undefined
  ) {
    return res.status(400).send({
      success: false,
      message: "All fields are required",
    });
  }

  const client = new Client(dbConfig);
  try {
    await client.connect();

    const query = `
            INSERT INTO "Employee" ("Name", "Username", "Password", "EmailAddress", "Division", "Position", "IsAdmin")
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING "ID";
        `;
    const values = [
      Name,
      Username,
      Password,
      EmailAddress,
      Division,
      Position,
      IsAdmin,
    ];

    const result = await client.query(query, values);

    const newEmployeeId = result.rows[0].ID;

    return res.status(201).send({
      success: true,
      message: "New employee added successfully",
      data: {
        ID: newEmployeeId,
        Name,
        Username,
        Password,
        EmailAddress,
        Division,
        Position,
        IsAdmin,
      },
    });
  } catch (error) {
    console.error("Error adding new employee:", error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  } finally {
    await client.end();
  }
});

app.delete("/deleteProfile/:id", async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).send({
      success: false,
      message: "Profile ID is required",
    });
  }

  const client = new Client(dbConfig);
  try {
    await client.connect();

    const query = `DELETE FROM "Employee" WHERE "ID" = $1 RETURNING "ID";`;
    const result = await client.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Profile not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Profile deleted successfully",
      data: { ID: result.rows[0].ID },
    });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  } finally {
    await client.end();
  }
});

app.get("/employeeAttendanceLog/:employeeId", async (req, res) => {
  const employeeId = req.params.employeeId;

  if (!employeeId) {
    return res.status(400).send({
      success: false,
      message: "Employee ID is required",
    });
  }

  const client = new Client(dbConfig);
  try {
    await client.connect();

    const query = `
            SELECT "ID", "EmployeeID", "EmployeeName", "Date", "Hour", "File"
            FROM "AttendanceLog"
            WHERE "EmployeeID" = $1
            ORDER BY "Date" DESC;
        `;

    const result = await client.query(query, [employeeId]);

    if (result.rows.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No attendance records found for this employee",
      });
    }

    const attendanceLogs = result.rows.map((log) => ({
      ...log,
      File: log.File
        ? `data:image/jpeg;base64,${log.File.toString("base64")}`
        : null,
    }));

    return res.status(200).send({
      success: true,
      message: "Attendance logs retrieved successfully",
      data: attendanceLogs,
    });
  } catch (error) {
    console.error("Error retrieving attendance logs:", error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  } finally {
    await client.end();
  }
});
