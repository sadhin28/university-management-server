const express = require('express');
const admin =require("firebase-admin")
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express()
require('dotenv').config()

app.use(express.json({ limit: "500mb" }));

app.use( cors());

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

//middlewire


app.get('/', (req, res) => {
    res.send('University Management Server is running')
})
app.get('/ping', (req, res) => {
    res.send('Pong')
})



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        // //top-rated-game
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
            const { studentId, studentName,studentEmail,instructor,name } = req.body;
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
        //===========================Course start================================

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