import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import "./styles.css"
function App() {

  const[url,changeurl]=useState("");
  const[flag,setflag]=useState(false);//I have used this hook for toggling the submit and start server button
  const[flag1,setflag1]=useState("Start Server");//I have used this hook to change the text inside the button from start //server to starting
  
  //so in useform hook we have to first register all the input fields and declaring the 
  //default values is optional
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { isSubmitSuccessful, errors }
  } = useForm({
    defaultValues: { //the default values of registered input fields
      Link: url,
      Topic: "",
      Comment: ""
    }
  });
  
  //so whenever the extention starts I store the current url link and use reset method of useform to reset 
  // a specific input field that we specify
  useEffect(()=>{
  window.browser.tabs.query({
      active: true,
      lastFocusedWindow: true
      }, function(tabs) {
      // and use that tab to fill in out title and url
      var tab = tabs[0];
      //console.log(111,tab.url);
      changeurl(tab.url)
      reset({Link:tab.url})
       });
  },[])
   
   //so when a user clicks on start server button this function is called which pings the heroku dyno to restart if 
   //it has slept [ Note: Heroku dyno sleeps after 30 min of inactivity]
   function startserver(){
   		setflag1("Starting!!!");
            	axios.get("https://fierce-hamlet-40702.herokuapp.com").then((res)=>{
            		if(res.permission || res.status===304 || res.status===200){
            			setflag(true)
            			setflag1("Start Server");
            		}
            	})
  }
  
  //now we make an asynchronous call to send the data that we have acquired from the form
  async function sendData(data){
  	   const response=await axios.post("https://fierce-hamlet-40702.herokuapp.com/getdata",data)
  }
  
  //whenever the data is submitted successfully the input values are resetted using reset method
  useEffect(() => {
    if (isSubmitSuccessful) {
      const data=getValues();
      sendData(data)
      reset({Link:"",Topic:"",Comment:""});
    }
  }, [isSubmitSuccessful, reset]);
  const onError =(errors)=>{console.log(errors)}
    
  
  return (
    <div onSubmit={handleSubmit(onError)}>
      <form >
      	
        <div className="form-control">
         
          <input
            type="text"
            placeholder="Link"
            name="Link"
            {...register("Link", {
              required: { value: true, message: "This is required" }
            })}
          />
          <p className="error">{errors.Link?.message}</p>
        </div>
        <div className="form-control">
         
          <input
            type="text"
            placeholder="Topic"
            name="Topic"
            {...register("Topic", {
              required: { value: true, message: "This is required" },
              // pattern: { value: /^[a-zA-Z\s]*$/, message: "It should be string" }
            })}
          />
          
        </div>
        <div className="form-control">
          
          <input
            type="text"
            placeholder="Comment"
            name="Comment"
            {...register("Comment", {})}
          />
          
        </div>
        
        <div className="submitButton">
        //this part toggles the submit button
          {flag?<button type="submit">Submit</button>:<button className="serverStart" onClick={startserver}>{flag1}</button>}
        </div>
      </form>
    </div>
    
  );
}

export default App;
