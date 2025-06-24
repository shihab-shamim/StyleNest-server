const express=require("express")
const cors=require("cors")
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');
const port=process.env.PORT || 5000
const app=express()
require("dotenv").config();

app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}));
app.use(express.json());





const uri = `mongodb+srv://${process.env.db_username}:${process.env.db_password}@cluster0.u53e1so.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

   
    

    //database and collection name
     const databaseCollection = client.db("trendyTales");
    const userCollection = databaseCollection.collection("users");

     // jwt  related
     app.post("/jwt",async(req,res)=>{
      const user=req.body
      const token=jwt.sign(user?.userEmail,process.env.ACCESS_TOKEN,{
        expiresIn:"7d"
      })
      res.cookie("accessToken",token,{
        httpOnly:true,
        secure:false,
         sameSite: 'lax',
         maxAge: 24 * 60 * 60 * 1000 
        
      }).send({ success: true })
     })

     
     app.post("/logOut",async(req,res)=>{

      res.clearCookie("accessToken",{
        httpOnly: true,
     secure: false,
     sameSite: 'lax'
      }).send({ success: true })

     })

    app.post("/users",async(req,res)=>{
        const userInfo=req.body;
        // console.log(userInfo);
        const result =await userCollection.insertOne(userInfo)
        res.send(result)

    })
    app.get('/role',async(req,res)=>{
      const email=req?.query?.email;
      // console.log(email); 
      const result=await userCollection.findOne({email:email})
      res.send(result)

    })





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get("/", (req, res) => {
  res.send("Shoping Server is running");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

