const express=require("express")
const cors=require("cors")
const { MongoClient, ServerApiVersion,ObjectId  } = require('mongodb');
const jwt = require('jsonwebtoken');
const port=process.env.PORT || 5000
const app=express()
const cookieParser = require('cookie-parser')
require("dotenv").config();
const isProduction = process.env.NODE_ENV === "production";

app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}));
app.use(express.json());
app.use(cookieParser())

const verifyToken=async(req,res,next)=>{
  // console.log("hello");
   const token = req.cookies?.accessToken;
   if (!token) {
    // Return the response immediately, so the code doesn't execute further
    return res.status(401).send({ message: "forbidden access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decode) => {
    if (err) {
      // Return the response immediately in case of error
      return res.status(401).send({ message: "Not Allow" });
    }

    req.user = decode;
    // Proceed to the next middleware if token is valid
    next();
  });
// next()
}





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
      console.log(user?.userEmail,"hhhhh");
      const token=jwt.sign(user?.userEmail,process.env.ACCESS_TOKEN,{
        expiresIn:"7d"
      })
      res.cookie("accessToken",token,{
        httpOnly:true,
        secure: isProduction?true:false,
            sameSite: isProduction ? 'None' : 'Lax',
        
      }).send({ success: true })
     })

     
     app.post("/logOut",async(req,res)=>{

      res.clearCookie("accessToken",{
        httpOnly: true,
     secure: isProduction?true:false,
            sameSite: isProduction ? 'None' : 'Lax',
          
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
    app.get("/user",verifyToken,async(req,res)=>{
      const email=req?.query?.email;
        console.log('Cookies: ', req.user)
       const result=await userCollection.findOne({email:email})
      res.send(result)

    })
    app.patch("/user/:id",async(req,res)=>{
      const id =req?.params?.id;
      const info=req?.body
      // console.log(info);
      const query={  _id: new ObjectId(id) }
       const updateDoc = {
    $set: info
  };
      const result=await userCollection.updateOne(query,updateDoc)
      res.send(result)

    })
    // app.get("/hello",async(req,res)=>{
    //   const result={
    //     name:"shihab",age:"21"
    //   }

    //   res.send(result)
    // })





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

