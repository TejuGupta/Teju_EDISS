// server set ups
// all that we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 3000;
var mysql = require('mysql');
var http = require('http');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var validator = require('validator');

//DB connection

var writeconnectionPool = mysql.createPool({
  connectionLimit : 500,
  host     : 'mysql-ediss.c0kfhi1xeasa.us-east-1.rds.amazonaws.com',
  port     :  3306,
  user     : 'trachapu',
  password : 'edisroot',
  database : 'edisprod'
});


var readconnectionPool = mysql.createPool({
  connectionLimit : 500,
  host     : 'myreadreplica.c0kfhi1xeasa.us-east-1.rds.amazonaws.com',
  port     :  3306,
  user     : 'trachapu',
  password : 'edisroot',
  database : 'edisprod',
  multipleStatements: 'true'
}); 

/*
var connection = mysql.createConnection({
  host     : 'localhost',
  port     :  3306,
  user     : 'root',
  password : 'admin',
  database : 'test',
  multipleStatements: 'true'
}); */

//writeconnectionPool.connect();
//readconnectionPool.connect();
// set up express
app.use(morgan('dev')); 
app.use(cookieParser()); 
app.use(bodyParser()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({ 
name: 'session-cookie',
secret: 'nothing',
saveUninitialized: true,
cookie: { maxAge: 900000 },
rolling: true,
resave:true })); // set session secret and maxAge with rolling set as true

app.listen(port);
console.log('e-commerce app listening on port' + port);

		
app.post('/login', function(req, res, next) { 
var params =[req.body.username,req.body.password];
res.setHeader('Content-Type', 'application/json');
console.log('entered');
console.log(req.body.username+ " " + req.body.password); 
     readconnectionPool.getConnection(function(err,readconnection){
		var queries = readconnection.query("SELECT * from userdata where username=? and password=?", params, function(err, rows, fields) {
		readconnection.release();
		if ((!err && rows.length > 0) )
			{    
		    
			  var obj= '{"message":"Welcome '+rows[0].fname+'"}';			  
			  req.session.username = req.body.username;
			  req.session.fname = rows[0].fname;
			  return res.send(obj);
			}			
		else if(err)
			{			  
			  readconnection.release();
			  return next(err); 
			}
		else		  
			{    
			  var obj= '{"message":"There seems to be an issue with the username/password combination that you entered"}';			 		
			  return res.send(obj);
			} 
		});
	 });
 (req,res,next);
});


app.post( '/registerUser',  function(req, res, next) { 

var params =[req.body.fname,req.body.lname,req.body.address,req.body.city,req.body.state,req.body.zip,req.body.email,req.body.username,req.body.password];
var userparam=[req.body.username];
var fname= req.body.fname ;
var lname= req.body.lname;
var address= req.body.address;
var  city= req.body.city;
var state =req.body.state;
var zip= req.body.zip;
var email = req.body.email;
var username =req.body.username;
var password= req.body.password;

if(!fname || !lname  || !address|| !city || !state || !zip || !email || !username || !password )
{
	var obj= '{"message":"The input you provided is not valid"}';
	console.log(obj+" ..");
	res.setHeader('Content-Type', 'application/json');
	return res.send(obj);			
}

if(validator.isEmpty(req.body.fname) || validator.isEmpty(req.body.lname)  || validator.isEmpty(req.body.address) ||  validator.isEmpty(req.body.city) || validator.isEmpty(req.body.state) || validator.isEmpty(req.body.zip) || validator.isEmpty(req.body.email) || validator.isEmpty(req.body.username) || validator.isEmpty(req.body.password))
{
	var obj= '{"message":"The input you provided is not valid"}';
	console.log(obj+" ..");
	res.setHeader('Content-Type', 'application/json');
	return res.send(obj);			
}		  

else{
  	   writeconnectionPool.getConnection(function(err,writeconnection){
	   var queries = writeconnection.query("INSERT INTO userdata set fname=? , lname=? , address=? ,  city =?, state=? , zip= ?, email=? , username= ?, password= ? ", params, 
	   function(err, rows, fields) {
		 writeconnection.release();
		 if (err)
			{
			  var obj= '{"message":"The input you provided is not valid"}';	
			  console.log("Error inserting : %s ",err );
			  res.setHeader('Content-Type', 'application/json');
		      return res.send(obj);
			} 
		  else
		  {
			  var obj= '{"message":"'+req.body.fname+ ' was registered successfully"}';
			  //req.session.username=req.body.username;
			  console.log(obj+" ..");
			 
			  res.setHeader('Content-Type', 'application/json');
			  return res.send(obj);  
		  }		 
		});	  
	   });	
   
 }
 (req,res,next);
});


app.post('/logout', function(req, res,next) {
console.log("logging out!.. user "+req.session.username);
var name=req.session.username;
if(typeof name === 'undefined' || name == null)
{
var obj= '{"message":"You are not currently logged in"}'; 
console.log(obj+" ..");
res.setHeader('Content-Type', 'application/json');
return res.send(obj);
}

else
{
var obj= '{"message":"You have been successfully logged out"}'; 
console.log(obj+" ..");		
res.setHeader('Content-Type', 'application/json');
req.session.destroy();
return res.send(obj);
}	
(req,res,next);
});
	
	
app.post( '/updateInfo',  function(req, res, next) { 
console.log('entered');
console.log(req.body.fname+ " " + req.body.lname+ " " + req.body.address + " " + req.body.city +" " + req.body.state + " " + req.body.zip + " "+ req.body.email + " "+ req.body.username + " " +req.body.password);


var password = req.body.password;
var name= req.session.username;
var msg= req.session.fname;
if(typeof name === 'undefined' || name == null)
{
  var obj= '{"message":"You are not currently logged in"}'; 	
 
  res.setHeader('Content-Type', 'application/json');
  return res.send(obj);
	
}	

else{
        var querystring= "UPDATE userdata set ";
		 
		if(req.body.fname)
		{
		 querystring=querystring+ "fname='"+req.body.fname+"',";
		}
		if(req.body.lname)
		{
		querystring=querystring+ "lname='"+req.body.lname+"',";
		}
		if(req.body.address)
		{
		querystring=querystring+ "address='"+req.body.address+"',";
		}
		if(req.body.city)
		{
		querystring=querystring+ "city='"+req.body.city+"',";
		}
		if(req.body.state)
		{
		querystring=querystring+ "state='"+req.body.state+"',";
		}
		if(req.body.zip)
		{
		querystring=querystring+ "zip='"+req.body.zip+"',";
		}
		if(req.body.email)
		{
		querystring=querystring+ "email='"+req.body.email+"',";
		}
		if(req.body.username)
		{
			
		    querystring=querystring+ "username='"+req.body.username+"',";
	    }
		if(req.body.password)
		{
		querystring=querystring+ "password='"+req.body.password+"',";
		}
	    querystring= querystring.substring(0, querystring.length - 1);
		querystring+=" where username='" +name+"'";
		console.log("Query String : %s ",querystring );
		
		
		 writeconnectionPool.getConnection(function(err,writeconnection){
		 var queries = writeconnection.query(querystring, 
	     function(err, rows, fields) {
		 writeconnection.release();
		 if (err)
			{
			  
			  console.log("Error updating : %s ",err );
			  var obj= '{"message":"The input you provided is not valid"}';
			  writeconnection.release();
			  return res.send(obj); 
			
		  }
		  else
		  {   
	          if(req.body.username) { req.session.username=req.body.username; }
			  if(req.body.fname) { msg= req.body.fname;}
			  var obj= '{"message":"'+msg+ ' your information was successfully updated"}';
			 			  
			  res.setHeader('Content-Type', 'application/json');
			  return res.send(obj);  
		  }		 
		});	
	  });		

}
 (req,res,next);
});


app.post( '/viewUsers',  function(req, res, next) { 
console.log('entered');
console.log(req.body.fname+ " " + req.body.lname);
var params =[req.body.fname,req.body.lname];
var userparam=[req.body.username];
var name=req.session.username;
	  
if(typeof name === 'undefined' || name == null)
{
var obj= '{"message":"You are not currently logged in"}'; 
console.log(obj+" ..");
res.setHeader('Content-Type', 'application/json');
return res.send(obj);
}

else if( name != "jadmin") 
{
	var obj= '{"message":"You must be an admin to perform this action"}';
	console.log(obj+" ..");
	res.setHeader('Content-Type', 'application/json');
	return res.send(obj);			
}

else{
	var querystring= "SELECT fname,lname,username from userdata";
	
	if(req.body.fname && req.body.lname)
	{
		querystring=querystring+ " where fname like '%"+req.body.fname+"%' and lname like '%"+req.body.lname+"%'";
	}
	
	else if(req.body.fname)
		{
		  querystring=querystring+ " where fname like '%"+req.body.fname+"%'";
		}
	else if(req.body.lname)
		{
		  querystring=querystring+ " where lname like '%"+req.body.lname+"%'";
		}
		console.log("querystring"+querystring);
		
   readconnectionPool.getConnection(function(err,readconnection){
   var queries = readconnection.query(querystring,  function(err, rows, fields) {
   readconnection.release();
   if (!err && rows.length > 0 )
	{    
		  var obj= '{"message":"The action was successful","user":[';	
	   
		  for(var i =0; i< rows.length; i++)
		  {
			  var temp= '{"fname":"'+rows[i].fname+'","lname":"'+rows[i].lname+'","userId":"'+rows[i].username+'"},';
			  console.log("temppp.."+temp);
			  obj=obj+temp;
		  }
		  obj= obj.substring(0, obj.length - 1);
		  obj=obj+']}';
		  res.setHeader('Content-Type', 'application/json');
		  return res.send(obj);
    }			
   else if(err)
    {
	  readconnection.release();
	  var obj= '{"message":"There are no users that match that criteria"}';
	
	  res.setHeader('Content-Type', 'application/json');
	  return res.send(obj); 
    }
   else		  
    { 	  
	
	  var obj= '{"message":"There are no users that match that criteria"}';
	 
	  res.setHeader('Content-Type', 'application/json');
	  return res.send(obj);  
		  	 
		  
   } 
 });
}); 
}
 (req,res,next);
});


app.post( '/addProducts',  function(req, res, next) { 
console.log('entered');
console.log(req.body.asin+ " " + req.body.productName+ " " + req.body.productDescription + " " + req.body.group);
var params =[req.body.productName,req.body.productDescription,req.body.group,req.body.asin];
var asin = req.body.asin;
var pname= req.body.productName;
var pdesc= req.body.productDescription;
var grp= req.body.group;

var name=req.session.username;

if(typeof name === 'undefined' || name == null)
{
var obj= '{"message":"You are not currently logged in"}'; 
console.log(obj+" ..");
res.setHeader('Content-Type', 'application/json');
return res.send(obj);
}

else if( name != "jadmin") 
{
	var obj= '{"message":"You must be an admin to perform this action"}';
	console.log(obj+" ..");
	res.setHeader('Content-Type', 'application/json');
	return res.send(obj);			
}	
else if(!asin || !pname  || !pdesc|| !grp )
{
	var obj= '{"message":"The input you provided is not valid"}';
	console.log(obj+" ..");
	res.setHeader('Content-Type', 'application/json');
	return res.send(obj);			
}

else{   
       writeconnectionPool.getConnection(function(err,writeconnection){     
	   var queries = writeconnection.query("INSERT INTO productdata values (?,?,?,?)", params, 
	   function(err, rows, fields) {
		 writeconnection.release();
		 if (err)
			{
			  console.log("Error inserting product : %s ",err );
			  var obj= '{"message":"The input you provided is not valid"}';	
			  res.setHeader('Content-Type', 'application/json');
		      return res.send(obj);
			} 
		  else
		  {
			  var obj= '{"message":"'+req.body.productName+ ' was successfully added to the system"}';
			  console.log(obj+" ..");
			
			  res.setHeader('Content-Type', 'application/json');
			  return res.send(obj);  
		  }		 
		});	 
		});	  
    }
 (req,res,next);
});


app.post( '/modifyProduct',  function(req, res, next) { 
console.log('entered');
console.log(req.body.asin+ " " + req.body.productName+ " " + req.body.productDescription + " " + req.body.group);

var name= req.session.username;

if(typeof name === 'undefined' || name == null)
{
  var obj= '{"message":"You are not currently logged in"}'; 	
 
  res.setHeader('Content-Type', 'application/json');
  return res.send(obj);
	
}	

else if( name != "jadmin") 
{
	var obj= '{"message":"You must be an admin to perform this action"}';
	console.log(obj+" ..");
	res.setHeader('Content-Type', 'application/json');
	return res.send(obj);			
}	

else if(!req.body.asin)
{
    var obj= '{"message":"The input you provided is not valid"}';	
    return res.send(obj); 
}	

else{
	
        var querystring= "UPDATE productdata set ";
	
		if(req.body.productName)
		{
		querystring=querystring+ "productName='"+req.body.productName+"',";
		}
		if(req.body.productDescription)
		{
		querystring=querystring+ "productDescription='"+req.body.productDescription+"',";
		}
		if(req.body.group)
		{
		querystring=querystring+ "`group` ='"+req.body.group+"',";
		}
		
	    querystring= querystring.substring(0, querystring.length - 1);
		querystring+=" where asin='" +req.body.asin+"'";
		console.log("Query String : %s ",querystring );
		 writeconnectionPool.getConnection(function(err,writeconnection){    
		 var queries = writeconnection.query(querystring, 
	     function(err, rows, fields) {
	     writeconnection.release();
		 if (err)
			{
			  
			  console.log("Error updating : %s ",err );
			    var obj= '{"message":"The input you provided is not valid"}';	
			  writeconnection.release();
			  return res.send(obj); 
			
		  }
		  else if (rows.affectedRows == 0){
			  console.log("Error updating : %s ",err );
			  var obj= '{"message":"The input you provided is not valid"}';	
			  return res.send(obj); 
		  }
		  else
		  {   
			  req.session.productName=req.body.productName;
			  var obj= '{"message":"'+req.session.productName+ ' was successfully updated"}';
			 			  
			  res.setHeader('Content-Type', 'application/json');
			  return res.send(obj);  
		  }		 
		});	
		});	 

}
 (req,res,next);
});



app.post( '/viewProducts',  function(req, res, next) { 
console.log('entered');
console.log(req.body.asin+ " " + req.body.keyword+ " "+ req.body.group);
var params =[req.body.asin,req.body.keyword,req.body.group];
var pin= req.body.asin;
var key= req.body.keyword;
var grp = req.body.group;
var querystring;


readconnectionPool.getConnection(function(err,readconnection){
if(typeof req.body.asin === 'undefined' && typeof req.body.group ==='undefined' && typeof req.body.keyword === 'undefined'){
	querystring = "SELECT asin, productName from productdata limit 1000;";
}
else{
querystring = "SELECT asin, productName from productdata where";
if(pin) { querystring+=" asin = "+ readconnection.escape(req.body.asin)+" or"; }  
if(grp) { querystring += ' match(`group`) against ('+ readconnection.escape(req.body.keyword) +' IN NATURAL LANGUAGE MODE) or'; }
if(key) { querystring+=  ' match(productName,productDescription) against ('+ readconnection.escape(req.body.keyword) +' IN NATURAL LANGUAGE MODE) or'; }
  
querystring = querystring.slice(0,-2);
querystring += 'limit 1000;';
}
console.log("querystring"+querystring);

var queries = readconnection.query(querystring, function(err, rows, fields) {
   readconnection.release();
   console.log("length..."+rows.length);
   if (!err && rows.length > 0 )
	{    
		  var obj= '{"message":"The action was successful","product":[';	
	      var results = [];
		  for(var i =0; i< rows.length; i++)
		  {
			  var temp= '{"asin":"'+rows[i].asin+'","productName":"'+rows[i].productName+'"}';
			  results.push(temp);
		  }
		  obj=obj+results+']}';
		  res.setHeader('Content-Type', 'application/json');
		  return res.send(obj);
    }			

   else		  
    { 	  	
	  var obj= '{"message":"There are no products that match that criteria"}';
	  res.setHeader('Content-Type', 'application/json');
	  return res.send(obj);	 
		  
    } 
 });
}); 
 (req,res,next);
});


app.post( '/buyProducts',  function(req, res, next) { 
console.log("Inside buy products");
var name= req.session.username;

if(typeof name === 'undefined' || name == null)
{
  var obj= '{"message":"You are not currently logged in"}'; 	
  res.setHeader('Content-Type', 'application/json');
  return res.send(obj);	
}

console.log('productsarray..' + req.body.products);
if(typeof req.body.products === 'undefined'|| req.body.products === null){
      var obj= '{"message":"There are no products that match that criteria"}';
	  res.setHeader('Content-Type', 'application/json');
	  return res.send(obj);  
}

var productarray = JSON.stringify(req.body.products);
if(productarray.charAt(0) =='['){
    productarray = productarray.slice(1,-1);
}
console.log('Products:' + productarray);
var array = productarray.split(",");
var flag =0;
var str;
for(var i=0;i<array.length;i++)
{
var temp = array[i].split(':');
var asin=temp[1].substring(1,temp[1].length-2);	
console.log("asin...inside..."+asin);
if(typeof str === 'undefined' || str == null)
str=","+asin;
else 
str=str+","+asin;
}

console.log("string..."+str);
console.log("text..."+str.substring(1,str.length));

readconnectionPool.getConnection(function(err,readconnection){
var queries = readconnection.query("SELECT CHECKASIN('"+str.substring(1,str.length)+"') as temp;", function(err, rows, fields) {
	if(rows[0].temp == 1 ) {			
		var obj= '{"message":"There are no products that match that criteria"}';
		res.setHeader('Content-Type', 'application/json');
		return res.send(obj);
	 }	 
			
      else{	 
	   var utcDate=new Date().getTime();
	   var values =[name,utcDate];
       
       writeconnectionPool.getConnection(function(err,writeconnection){	   
	   var queries = writeconnection.query("INSERT into orderdetails(customerName,purchaseTime) VALUES (?,?)", values, function(err, rows, fields) {
	   console.log("aray"+array[i]);
	   if(err) { 
		   console.log("Error Inserting in database");
		   return; 
	   }
	   else {
	   var id=0;
	   var orderIdquery = readconnection.query("SELECT orderId from orderdetails where customerName like '%"+name+"%' and purchaseTime ="+utcDate, function(err, rows, fields) {
	   if (!err && rows.length > 0 )
		{    
		  id= rows[0].orderId
		  console.log("id..."+id);
	      for(var i=0;i<array.length;i++)
	       { 
            console.log("aray"+array[i]);
		    var errflag = 0;
			console.log("aray"+array[i]);
			var temp = array[i].split(':');
			var asin=temp[1].substring(1,temp[1].length-2);				
			var params =[asin,id,name];				 
			console.log("params.."+params);
			var queries = writeconnection.query("INSERT into purchaserecord VALUES (?,?,?)", params, function(err, rows, fields) {
			console.log("inside query"+err);
			if(err) { errflag = 1; return;}
			else {console.log("inserted"); return;}
			});	
		   }					
		 if (errflag == 1)
			{
			  console.log("Error inserting product records : %s ",err);
			  var obj= '{"message":"The input you provided is not valid"}';	
			  res.setHeader('Content-Type', 'application/json');
			  return res.send(obj);
			} 
		  else
		  {
			  var obj= '{"message":"The action was successful"}';				
			  res.setHeader('Content-Type', 'application/json');
			  return res.send(obj);  
		  }	
	 
          	
		}
   else		  
    { 	
	  var obj= '{"message":"There are no products that match that criteria"}';
	  res.setHeader('Content-Type', 'application/json');
	  return res.send(obj); 		  
    } 
   });
  }
 });	
 writeconnection.release();
});
}
});	
readconnection.release();
});	
(req,res,next);
});



app.post( '/productsPurchased',  function(req, res, next) { 
console.log("Inside products purchased");
var name= req.session.username;
var uname= req.body.username;
if(typeof name === 'undefined' || name == null)
{
  var obj= '{"message":"You are not currently logged in"}'; 	
  res.setHeader('Content-Type', 'application/json');
  return res.send(obj);	
}
else if( name != "jadmin") 
{
	var obj= '{"message":"You must be an admin to perform this action"}';
	res.setHeader('Content-Type', 'application/json');
	return res.send(obj);			
}	

readconnectionPool.getConnection(function(err,readconnection){
var queries=readconnection.query("SELECT b.productName as pname, a.asin, count(a.asin) as qty from purchaserecord a, productdata b where a.customerName ='"+uname+"' and a.asin=b.asin group by a.asin", function(err, rows,fields)
{   
    readconnection.release();
    console.log("length.."+rows.length);
    if (!err && rows.length > 0 )
	{     console.log("history..");
		  var obj= '{"message":"The action was successful","products":[';	
	      var results = [];
		  for(var i =0; i< rows.length; i++)
		  {
			  var temp= '{"productName":"'+rows[i].pname+'","quantity":"'+rows[i].qty+'"}';
			  results.push(temp);
		  }
		  obj=obj+results+']}';
		  res.setHeader('Content-Type', 'application/json');
		  return res.send(obj);
    }

   else 
		  {
			  var obj= '{"message":"There are no users that match that criteria"}';
			  res.setHeader('Content-Type', 'application/json');
			  return res.send(obj);  
		  }	
 
});
});
(req,res,next);
});

app.post( '/getRecommendations',  function(req, res, next) { 
console.log("Inside getting recommendations");
var asin= req.body.asin;
var name= req.session.username;
if(typeof name === 'undefined' || name == null)
{
  var obj= '{"message":"You are not currently logged in"}'; 	
  res.setHeader('Content-Type', 'application/json');
  return res.send(obj);	
}

readconnectionPool.getConnection(function(err,readconnection){
var queries=readconnection.query("select asin, count(asin) as qty from  (select asin from purchaserecord where orderId in (select DISTINCT orderId from purchaserecord where asin='"+asin+"') and asin !='"+asin+"') as temp group by asin order by qty desc limit 5", function(err, rows,fields)
{   
    readconnection.release();
    console.log("length.."+rows.length);
    if (!err && rows.length > 0 )
	{     console.log("recos..");
		  var obj= '{"message":"The action was successful","products":[';	
	      var results = [];
		  for(var i =0; i< rows.length; i++)
		  {
			  var temp= '{"asin":"'+rows[i].asin+'"}';
			  results.push(temp);
		  }
		  obj=obj+results+']}';
		  res.setHeader('Content-Type', 'application/json');
		  return res.send(obj);
    }

   else 
		  {
			  var obj= '{"message":"There are no recommendations for that product"}';
			  res.setHeader('Content-Type', 'application/json');
			  return res.send(obj);  
		  }	
 
});
});
(req,res,next);
});


