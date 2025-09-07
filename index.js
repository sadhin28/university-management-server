
const express = require('express');
const admin = require("firebase-admin")
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express()
require('dotenv').config()

app.use(express.json({ limit: "500mb" }));

app.use(cors());
// {
//     origin:  "https://university-management-sy-dc929.web.app", 
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   }


// Firebase Admin Initialize
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

app.post("/make-admin/:uid", async (req, res) => {
    try {
        const { uid } = req.params;
        await admin.auth().setCustomUserClaims(uid, { role: "admin" });
        res.json({ message: "User is now Admin" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/make-teacher/:uid", async (req, res) => {
    try {
        const { uid } = req.params;
        await admin.auth().setCustomUserClaims(uid, { role: "teacher" });
        res.json({ message: "User is now Teacher" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Middleware to verify admin
async function verifyAdmin(req, res, next) {
    const idToken = req.headers.authorization?.split(" ")[1];
    if (!idToken) return res.status(401).send("Unauthorized");

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        if (decodedToken.role !== "admin") return res.status(403).send("Forbidden: Admins only");
        next();
    } catch (err) {
        res.status(401).send("Invalid token");
    }
}

// Get all users (admin only)
app.get("/users", verifyAdmin, async (req, res) => {
    try {
        const listUsersResult = await admin.auth().listUsers(1000);
        const users = listUsersResult.users.map(u => ({
            uid: u.uid,
            email: u.email,
            name: u.displayName || "No Name",
            photoURL: u.photoURL || "",
            role: u.customClaims?.role || "student"
        }));
        res.send(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Delete user (admin only)
app.delete("/users/:uid", verifyAdmin, async (req, res) => {
    try {
        await admin.auth().deleteUser(req.params.uid);
        res.send({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).send(err.message);
    }
});
//middlewire


app.get('/', (req, res) => {
    res.send('University Management Server is running')
})
app.get('/ping', (req, res) => {
    res.send('Pong')
})



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { Axios } = require('axios');
const axios = require('axios');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.anvml2e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {

        //create database
        const Facultycollection = client.db('FacultyData').collection('Faculty')
        const Coursecollection = client.db("CourseData").collection('Course')
        const Studentcollection = client.db("StudentsData").collection('Student')
        const StudentEnrolledCollection = client.db("EnrolledData").collection('Enrolled')
        const Transectincollection = client.db("TransactionData").collection("Transaction")
        const ScheduleCollection = client.db("AllSchedules").collection("Schedules")
        // ============================bikash api start===============================



        // // --- bKash Sandbox Credentials ---
        // const BKASH_BASE_URL = "https://checkout.sandbox.bka.sh/v1.2.0-beta";
        // const BKASH_APP_KEY = "YOUR_SANDBOX_APP_KEY";
        // const BKASH_APP_SECRET = "YOUR_SANDBOX_APP_SECRET";



        // let bkashToken = "";

        // async function generateBkashToken() {
        //     try {
        //         const res = await axios.post(
        //             `${BKASH_BASE_URL}/checkout/token/grant`,
        //             {
        //                 app_key: BKASH_APP_KEY,
        //                 app_secret: BKASH_APP_SECRET,
        //             },
        //             {
        //                 headers: { "Content-Type": "application/json" },
        //             }
        //         );
        //         bkashToken = res.data.id_token;
        //         console.log("bKash token updated.");
        //     } catch (err) {
        //         console.error("Failed to get bKash token:", err.message);
        //     }
        // }

        // setInterval(generateBkashToken, 55 * 60 * 1000);
        // generateBkashToken();

        // // --- Initiate Payment ---
        // app.post("/api/payment/bkash/initiate", async (req, res) => {
        //     const { amount } = req.body;

        //     try {
        //         const response = await axios.post(
        //             `${BKASH_BASE_URL}/checkout/payment/create`,
        //             {
        //                 amount: amount.toString(),
        //                 currency: "BDT",
        //                 intent: "sale",
        //                 merchantInvoiceNumber: "INV" + Date.now(),
        //             },
        //             {
        //                 headers: {
        //                     Authorization: bkashToken,
        //                     "X-App-Key": BKASH_APP_KEY,
        //                     "Content-Type": "application/json",
        //                 },
        //             }
        //         );

        //         res.json({
        //             success: true,
        //             paymentID: response.data.paymentID,
        //             bkashResponse: response.data,
        //         });
        //     } catch (error) {
        //         console.error(error.response?.data || error);
        //         res.status(500).json({ success: false, error: error.message });
        //     }
        // });

        // // --- Execute Payment (Simulated for sandbox) ---
        // app.post("/api/payment/bkash/execute", async (req, res) => {
        //     const { studentId, studentEmail, amount, courses } = req.body;

        //     try {
        //         const transactionId = "BKASH" + Math.floor(Math.random() * 1000000);

        //         // Save transaction
        //         await Transectincollection.insertOne({
        //             studentId,
        //             studentEmail,
        //             amount,
        //             method: "bKash",
        //             transactionId,
        //             courses,
        //             date: new Date(),
        //         });

        //         // Update enrollment status
        //         await StudentEnrolledCollection.updateMany(
        //             { studentEmail },
        //             { $set: { paymentStatus: "paid" } }
        //         );

        //         res.json({ success: true, transactionId });
        //     } catch (err) {
        //         console.error(err);
        //         res.status(500).json({ success: false, error: err.message });
        //     }
        // });

        // // --- Manually Update Enrollment Status ---
        // app.patch("/course/update-payment-status", async (req, res) => {
        //     const { studentEmail, status } = req.body;

        //     try {
        //         const result = await StudentEnrolledCollection.updateMany(
        //             { studentEmail },
        //             { $set: { paymentStatus: status } }
        //         );
        //         res.json(result);
        //     } catch (err) {
        //         console.error(err);
        //         res.status(500).json({ success: false, error: err.message });
        //     }
        // });



        // ============================bikash api end===============================



        // //top-rated-student
        app.get("/resent-student", async (req, res) => {
            const cursor = Studentcollection.find().sort({ rating: -1 }).limit(4);
            const result = await cursor.toArray();
            res.send(result);
        });

        //popular-course
        app.get("/popular-course", async (req, res) => {
            const cursor = Coursecollection.find().sort({ rating: -1 }).limit(4);
            const result = await cursor.toArray();
            res.send(result);
        });

        // POST enroll
        app.post('/course/my-enrolled', async (req, res) => {
            const Faculty = req.body;
            res.send(Faculty);
            const result = await StudentEnrolledCollection.insertOne(Faculty);
            res.send(result)
        })

        app.post("/course/my-enrolled/:id", async (req, res) => {
            const { id } = req.params;
            const { studentId, studentName, studentEmail, instructor, name, paymentStatus } = req.body;
            const course = await Coursecollection.findOne({ _id: new ObjectId(id) });

            if (!course) return res.status(404).json({ message: "Course not found" });
            if (course.enrolled >= course.capacity)
                return res.status(400).json({ message: "Course full" });

            // increment enrolled count
            await Coursecollection.updateOne(
                { _id: new ObjectId(id) },
                { $inc: { enrolled: 1 } }
            );
            // Save enrolled student record
            await StudentEnrolledCollection.insertOne({
                courseId: course._id,
                studentId,
                studentName,
                studentEmail,
                instructor,
                name,
                paymentStatus,
                enrolledAt: new Date(),
            });

            res.json({ message: "Enrolled successfully" });
        });

        // ✅ API: Get enrolled courses by email
        app.get("/course/my-enrolled", async (req, res) => {
            try {
                const { studentEmail } = req.query;

                if (!studentEmail) {
                    return res.status(400).json({ message: "studentEmail is required" });
                }

                const query = { studentEmail: studentEmail };
                const result = await StudentEnrolledCollection.find(query).toArray();

                res.status(200).json(result);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
        app.get('/course/my-enrolled/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await StudentEnrolledCollection.findOne(query)
            res.send(result)
        })
        app.delete('/course/my-enrolled/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await StudentEnrolledCollection.deleteOne(query);
            res.send(result)
        })


        //===========================faculty start================================
        //post a faculty
        app.post('/faculty', async (req, res) => {
            const Faculty = req.body;
            res.send(Faculty);
            const result = await Facultycollection.insertOne(Faculty);
            res.send(result)
        })

        //get a faculty
        app.get('/faculty', async (req, res) => {
            const coursor = Facultycollection.find();
            const result = await coursor.toArray();
            res.send(result)
        })
        //get faculty by id
        app.get('/faculty/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await Facultycollection.findOne(query)
            res.send(result)
        })
        //delete faculty
        app.delete('/faculty/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await Facultycollection.deleteOne(query);
            res.send(result)
        })
        //update faculty
        app.put('/faculty/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { Upsert: true };
            const updatefaculty = req.body;
            const newUpdatefaculty = {
                $set: {

                }
            }
            const result = await Facultycollection.updateOne(filter, newUpdatefaculty, options);
            res.send(result)
        })
        //===========================Student start================================
        //post student
        app.post('/student', async (req, res) => {
            const newstudent = req.body;
            res.send(newstudent);
            const result = await Studentcollection.insertOne(newstudent);
            res.send(result)
        })
        //get all student collection
        app.get('/student', async (req, res) => {
            const coursor = Studentcollection.find();
            const result = await coursor.toArray();
            res.send(result)
        })
        //get student  by id
        app.get('/student/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await Studentcollection.findOne(query);
            res.send(result)
        })
        //delete student list by id
        app.delete('/student/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await Studentcollection.deleteOne(query);
            res.send(result)
        })
        //update student
        app.put('/student/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { Upsert: true };
            const updatestudent = req.body;
            const newUpdatestudent = {
                $set: {

                }
            }
            const result = await Studentcollection.updateOne(filter, newUpdatestudent, options);
            res.send(result)
        })
        //===========================Course end================================

        //===========================schedule start================================
        // post all schedules
        app.post('/schedule', async (req, res) => {
            const newschedule = req.body;
            res.send(newschedule);
            const result = await ScheduleCollection.insertOne(newschedule);
            res.send(result)
        })

        // get schedule
        app.get('/schedule', async (req, res) => {
            const coursor = ScheduleCollection.find();
            const result = await coursor.toArray();
            res.send(result)
        })
        // Delete schedule 
        app.delete('/schedule/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await ScheduleCollection.deleteOne(query);
            res.send(result)
        })
        // Update schedule 
        app.put('/schedule/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };
                const updatedData = req.body;

                const updateDoc = { $set: updatedData };
                const options = { upsert: false };

                const result = await ScheduleCollection.updateOne(filter, updateDoc, options);

                if (result.matchedCount === 0) {
                    return res.status(404).send({ message: "Schedule not found" });
                }

                res.send({ message: "Schedule updated successfully", result });
            } catch (err) {
                console.error(err);
                res.status(500).send({ message: "Server error" });
            }
        });

        //===========================Schedule dnd================================

        //post course
        app.post('/course', async (req, res) => {
            const newcourse = req.body;
            res.send(newcourse);
            const result = await Coursecollection.insertOne(newcourse);
            res.send(result)
        })
        //get all course collection
        app.get('/course', async (req, res) => {
            const coursor = Coursecollection.find();
            const result = await coursor.toArray();
            res.send(result)
        })
        //get course  by id
        app.get('/course/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await Coursecollection.findOne(query);
            res.send(result)
        })
        //delete course list by id
        app.delete('/course/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await Coursecollection.deleteOne(query);
            res.send(result)
        })
        //update course
        app.put('/course/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { Upsert: true };
            const updatecourse = req.body;
            const newUpdatecourse = {
                $set: {

                }
            }
            const result = await Coursecollection.updateOne(filter, newUpdatecourse, options);
            res.send(result)
        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);
app.listen(port, () => {
    console.log(`University management server is running on port:${port}`)
})