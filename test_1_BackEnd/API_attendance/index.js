const express = require('express');
const app = express();
const PORT = 8080;
const { Client } = require('pg');
const cors = require('cors');
const multer = require('multer');

const storage = multer.memoryStorage();

app.use(cors());
app.use( express.json())
const upload = multer({ storage: storage });

const dbConfig = {
    user: 'postgres',
    host: '127.0.0.1',
    password: '12345678', 
    port: 5432,
    database: "Attendance_1"
}

async function setupDatabase() {
    const defaultClient = new Client({ ...dbConfig, database: 'postgres' });
    try {
        await defaultClient.connect();
        console.log('Connected to PostgreSQL default database.');

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
        console.error('Error ensuring database:', error.message);
    } finally {
        await defaultClient.end();
    }

    const client = new Client(dbConfig);
    try {
        await client.connect();
        console.log('Connected to PostgreSQL Attendance_1 database.');

        const createTableEmployeeQuery = `
            CREATE TABLE IF NOT EXISTS "Employee" (
                "ID" VARCHAR(255) PRIMARY KEY,
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
                "EmployeeID" VARCHAR(255) NOT NULL,
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
        console.error('Error setting up database:', error.message);
    } finally {
        await client.end();
    }
}

setupDatabase();


app.listen(
    PORT, 
    () => console.log(`masuk di http://localhost:${PORT}`)
)

app.post('/Authorization', async (req, res) => {
    const { Username, Password } = req.body; 

    if (!Username || !Password) {
        return res.status(400).send({
            success: false,
            message: 'Username and Password are required',
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
                message: 'Invalid username or password',
            });
        }

        const user = result.rows[0];

        if (user.Password === Password) {
            return res.status(200).send({
                success: true,
                message: 'Authentication successful',
                id: user.ID, 
                isAdmin: user.IsAdmin,
            });
        } else {
            return res.status(401).send({
                success: false,
                message: 'Invalid username or password',
            });
        }
    } catch (error) {
        console.error('Error during authentication:', error.message);
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error',
        });
    } finally {
        await client.end();
    }
});

app.get('/profile/:id', async (req, res) => {
    const userId = req.params.id;

    // Check if ID is provided
    if (!userId) {
        return res.status(400).send({
            success: false,
            message: 'User ID is required',
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
                message: 'User not found',
            });
        }

        const user = result.rows[0];
        return res.status(200).send({
            success: true,
            message: 'User profile retrieved successfully',
            data: user,
        });

    } catch (error) {
        console.error('Error getting user profile:', error);
        return res.status(500).send({
            success: false,
            message: 'Internal server error',
        });
    } finally {
        await client.end();
    }
});

app.post('/PostAttendance', upload.single('File'), async (req, res) => {
    const { EmployeeID, Date, Hour } = req.body;
    const file = req.file; 
    console.log('Body:', req.body);
    console.log('File:', req.file);

    if (!EmployeeID || !Date || !Hour || !file) {
        if (!req.file) {
            return res.status(400).send({ message: 'File is required.' });
        }
        return res.status(400).send({
            message: 'EmployeeID, Date, Hour, and File are required.',
        });
    }

    try {
        const client = new Client({
            user: 'postgres',
            host: '127.0.0.1',
            database: 'Attendance_1',
            password: '12345678',
            port: 5432,
        });

        await client.connect();

        const query = `
            INSERT INTO "AttendanceLog" ("EmployeeID", "Date", "Hour", "File")
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;

        const fileBuffer = file.buffer; 

        const result = await client.query(query, [EmployeeID, Date, Hour, fileBuffer]);

        await client.end();

        res.status(200).send({
            message: 'Attendance data inserted successfully.',
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Error inserting attendance data:', error.message);
        res.status(500).send({ message: 'Internal server error' });
    }
});


  
