const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const saltRound=10;

const app= express();

app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET","POST"],
    credentials: true
}));
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));

app.use(session({
    key: "username",
    secret: "subscribe",
    resave: false,
    saveUninitialized: false,
    cookie:{expires: 60*60*24,},
    })
);

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: '',
    database : 'park'
});

//Register Details
app.post('/register',(req,res)=>{
            
    const username = req.body.username;
    const password = req.body.password;
    const user_role = req.body.user_role;
    
    bcrypt.hash(password,saltRound,(err,hash)=>{
        if(err){
            console.log(err);
        }
        db.query("INSERT INTO login (user_name,password,user_role) VALUES (?,?,?)",[username,hash,user_role],(err,result)=>{
            console.log(err)
        });
    });
   
});

//Login Route

app.get('/login',(req,res)=>{
    if(req.session.user){
        res.send({loggedIn: true, user:req.session.user});
    }else{
        res.send({loggedIn: false});
    }
});

app.post('/login',(req,res)=>{
const username= req.body.username;
const password = req.body.password;
db.query("SELECT * FROM login WHERE user_name= ?", username,(err,result)=>{
        if(err){
            res.send({err: err});
        }
        if(result.length > 0 ){
            bcrypt.compare(password,result[0].password,(error,response)=>{
           if(response){
                    req.session.user = result;
                    console.log(req.session.user);
                    res.send(result);
                }else{
                    res.send({message: "Wrong username/password combination"});
                }
            });
        }else{
            res.send({message: "User doesn't exists"});
        }
    });

});

app.listen(3001, () => console.log("Running Server"));
