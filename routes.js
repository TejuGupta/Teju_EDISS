var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'mysql-useast1.c0kfhi1xeasa.us-east-1.rds.amazonaws.com',
  user     : 'trachapu',
  password : 'edisroot',
  database : 'edisprod'
});

connection.connect();

var validator = require('validator');

module.exports = function(app, passport) {
	
	app.post(
	'/login',  
     function(req, res) { 
			console.log('entered');
			console.log(req.body.username+ " " + req.body.password);
		  var params =[req.body.username,req.body.password];
		  var sess= req.session;	  
          var queries = connection.query("SELECT * from users where username =? and password=?", params,  
		  function(err, rows, fields) {
		  if (!err && rows.length > 0)
		  {    
			  var obj= '{"message":"Welcome '+rows[0].firstname+'"}';
			  req.session.username=req.body.username;
			  req.session.touch();
			  console.log("name"+req.session.username);
			  console.log(obj+" ..");
			  res.setHeader('Content-Type', 'application/json');
			  res.send(obj);
		  }			
		  else if(err)
		  {
			  connection.end();
		  }
		  else		  
		  {    
			  var obj= '{"message":"There seems to be an issue with the username/password combination that you entered"}';
			  console.log(obj+" ..");
			  req.session.touch();
			  res.setHeader('Content-Type', 'application/json');
			  res.send(obj);
		  } 
         });
		
	  } 
	);
	
	
	app.post(
	'/add',  
     function(req, res) { 

			var result = Number(req.body.num1)+Number(req.body.num2);
			var name=req.session.username;
	
			if(typeof name === 'undefined' || name == null)
			{
			  var obj= '{"message":"You are not currently logged in"}'; 	
			  req.session.touch();
			  res.setHeader('Content-Type', 'application/json');
			  res.send(obj);
				
			}
	      
		else if(isNaN(Number(req.body.num1)) || isNaN(Number(req.body.num2)) || !(req.body.num1) || !(req.body.num2))
		  {
			  var obj= '{"message":"The numbers you entered are not valid"}'; 
			  console.log(obj+" ..");
			  req.session.touch();
			  res.setHeader('Content-Type', 'application/json');
			  res.send(obj); 	 
			  
		  }
		  
		  else
		  {
			  var obj= '{"message":"The action was successful","result":'+result+'}'; 
			  console.log(obj+" ..");
			  req.session.touch();
			  res.setHeader('Content-Type', 'application/json');
			  res.send(obj);
			  
		  }	  
        } 
	);
	
	
	app.post(
	'/multiply',  
     function(req, res) { 
			console.log('entered');
			console.log(req.body.num1+ " " + req.body.num2);
			var result = Number(req.body.num1)* Number(req.body.num2);
			var name=req.session.username;
			if(typeof name === 'undefined' || name == null)
			{
			  var obj= '{"message":"You are not currently logged in"}'; 
			  console.log(obj+" ..");
			  req.session.touch();
			  res.setHeader('Content-Type', 'application/json');
			  res.send(obj);
				
			}
	      
		else  if(isNaN(Number(req.body.num1)) || isNaN(Number(req.body.num2)) || !(req.body.num1) || !(req.body.num2))
		  {
			  var obj= '{"message":"The numbers you entered are not valid"}'; 
			  console.log(obj+" ..");
			  req.session.touch();
			  res.setHeader('Content-Type', 'application/json');
			  res.send(obj); 	 
			  
		  }
		  
		  else
		  {
			  var obj= '{"message":"The action was successful","result":'+result+'}'; 
			  console.log(obj+" ..");
			  req.session.touch();
			  res.setHeader('Content-Type', 'application/json');
			  res.send(obj);
			  
		  }	 	  
          
	  } 
	);
	
	
	app.post(
	'/divide',  
     function(req, res) { 
			console.log('entered');
			console.log(req.body.num1+ " " + req.body.num2);
			var result = Number(req.body.num1) / Number(req.body.num2);
			var name=req.session.username;
			var num= req.body.num2;
		  	if(typeof name === 'undefined' || name == null)
			{
			  var obj= '{"message":"You are not currently logged in"}'; 
			  console.log(obj+" ..");
			  req.session.touch();
			  res.setHeader('Content-Type', 'application/json');
			  res.send(obj);
				
			}
	     
		 else if(isNaN(Number(req.body.num1)) || isNaN(Number(req.body.num2)) || !(req.body.num1) || !(req.body.num2) || (num == 0))
		  {
			  var obj= '{"message":"The numbers you entered are not valid"}'; 
			  console.log(obj+" ..");
			  req.session.touch();
			  res.setHeader('Content-Type', 'application/json');
			  res.send(obj); 	 
			  
		  }
		  
		  else 
		  {
			  var obj= '{"message":"The action was successful","result":'+result+'}'; 
			  console.log(obj+" ..");
			  req.session.touch();
			  res.setHeader('Content-Type', 'application/json');
			  res.send(obj);
			  
		  }
		 	  
          
	  } 
	);
	
	app.post('/logout', function(req, res) {
        console.log("logging out!");
		
			var name=req.session.username;
		  	if(typeof name === 'undefined' || name == null)
			{
			  var obj= '{"message":"You are not currently logged in"}'; 
			  console.log(obj+" ..");
			  res.setHeader('Content-Type', 'application/json');
			  res.send(obj);
				
			}
			
			else
			{
			  var obj= '{"message":"You have been successfully logged out"}'; 
			  console.log(obj+" ..");		
			  res.setHeader('Content-Type', 'application/json');
			  res.send(obj);
		      req.session.destroy();
				
			}	
       
        
    });


};



