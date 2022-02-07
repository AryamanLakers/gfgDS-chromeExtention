const express = require("express");
const app = express();
var bodyParser = require("body-parser");
const cors = require("cors");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const { setFlagsFromString } = require("v8");
app.use(cors());
app.options('*', cors());//to negate the cors error
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let count=1;
let flag=1;


//authorization steps to connect with google sheet api
async function authorize(credentials, callback, datanew) {
  const { client_email, client_id, private_key } = credentials;
  const authclient = new google.auth.JWT(client_email, null, private_key, [
    "https://www.googleapis.com/auth/spreadsheets"
  ]);
  const data = await authclient.authorize();
  listMajors(authclient,datanew);
}




async function listMajors(auth,datanew) {
  const sheets = google.sheets({ version: "v4", auth });
  const {Link,Topic,Comment}=datanew;
  
  const res=await sheets.spreadsheets.values.get({
    spreadsheetId: "1yuaGSCxnS3jAYb5-DOXI7lkPmOn4Uop46qB2K16f_VI",
    range: "Sheet1!A1:C1000",
  })
  
  //this is to ensure our data is not repeated in the dataset
  //the only problem is for every new entry, i have to search the entire dataset, it has O{n} complexity where n are the records
  res.data.values.forEach((arr)=>{if(arr[1]===Link) flag=-1})
  if(flag===-1) return ;

  //this line is to increase the index number
  if(res.data.values.slice(-1)[0][0]!='ID')  count=(res.data.values.slice(-1)[0][0]-'0')+1;
  const datatosend=[[count,Link,Topic,Comment]]
  const options = {
    spreadsheetId: "1yuaGSCxnS3jAYb5-DOXI7lkPmOn4Uop46qB2K16f_VI",
    range: "Sheet1!A1:C1",
    valueInputOption:"USER_ENTERED",
    insertDataOption:"INSERT_ROWS",
    resource:{"values":datatosend}
  };
  //we are adding data to our google sheet
  try {
    const data = await sheets.spreadsheets.values.append(options);
    count++;
    
  } catch (err) {
    console.error(err);
  }
}


//this is just for starting our heroku server, the client pings at this route
app.get("/",cors(),(req,res)=>{
  res.send({permission:true})
})


//when our client use post method to send http request with the form data
//our job now is to send it to the google sheet
app.post("/getdata", cors(), (req, res) => {
  
  // Load client secrets from a local file.
  fs.readFile(path.resolve(__dirname, "./credentials.json"), (err, content) => {
    if (err) return console.log("Error loading client secret file:", err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), listMajors , req.body);
  });
  
});

app.listen(process.env.PORT || 5000);
