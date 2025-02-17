var http = require('http');
var fs = require('fs');
var mysql = require('mysql');
var express = require('express');
var app = express();
var session = require('express-session'); 
var path = require('path');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
const saltRounds = 10;
var js_alert = require("js-alert");
var multer = require('multer')
const DIR = './public/uploads';
let storage = multer.diskStorage({
   destination: function (req, file, callback) {
     callback(null, DIR);
   },
   filename: function (req, file, cb) {
     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
   }
});

let upload = multer({storage: storage});

var db = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'root',
	database : 'testing'
});


app.get('/',(request, response) =>{
   response.sendFile(path.join(__dirname + '/test.html'));
});

app.get('/1',(request, response) =>{
   response.render('photography');
});

app.use(express.urlencoded({ extended: false  }));
app.use(express.json());
app.set('view engine', 'ejs');


app.use(session({
   secret: 'secret',
   resave: true,
   saveUninitialized: true,
   
 }));

 app.use(express.static(__dirname));

    

app.post('/',function(req,res){
   //login
   var username2 = req.body.username2;
   var password2 = req.body.password2;
   var username1 = req.body.username1;
   var password1 = req.body.password1;
   var username3 = req.body.username3;
   var password3 = req.body.password3;
   var stu_email = req.body.stuemail;
   var stu_name = req.body.stuname;
   var teaemail = req.body.teaemail;
   var teaname = req.body.teaname;
   var domain = req.body.domain;
   var quali = req.body.quali;
   var role = req.body.role;
   
if(username1){
   
   db.query("SELECT * FROM login_student",(err,results1,fields)=>{
   var c = 0;
      for(i=0;i<results1.length;i++){
         if(username1 == results1[i].username){
            js_alert.alert("username already exists in student");
            c = 1;
            break;
         }
      }
      if(c==0){
         
            bcrypt.hash(password1, saltRounds, function(err, hash) {
               var student_data = {
                  "name" : stu_name,
                  "username" : username1,
                  "password" : hash,
                  "email" : stu_email
               };
               db.query('INSERT INTO login_student SET ?',student_data,(err,results,fields)=>{
               if(err) throw err;
            });   
            res.redirect('/')
            console.log("student2 added");
         }); 
         }
         else{
            res.send("unique nahi ahe");
            console.log("username unique nahi ahe")
         }
      
      
   });   

   

   }
   else if(username2){
//teacher
      db.query("SELECT username FROM login_teacher",(err , results1, fields)=>{
         //console.log(results1);
         
         for(i=0;i<results1.length;i++){
            //console.log(results1[i].username);
            
            if(username2==results1[i].username){
               
               db.query("SELECT password FROM login_teacher",(err , results2, fields)=>{
                  
                  for(j=0;j<results2.length;j++){
                     //console.log(results2[j].password);
               bcrypt.compare(password2, results2[j].password, function(err, result) {
                  //console.log(result);
                  if(result == true){
                     //console.log("success login");
                     req.session.tea_login = true;
                     req.session.username = username2;
                     //res.redirect('/home');
                     
                     if(req.session.tea_login){
                        console.log("0")
                        res.redirect('/mycourses');
                     }
                     
                  }
              
            });
         }
      });
   }
   else{
      console.log("wrong");
      
   }
}
});



//student
   if(!(req.session.tea_login)){
      console.log("1")
   db.query("SELECT username FROM login_student",(err , results1, fields)=>{
   console.log(username2);
   
   for(i=0;i<results1.length;i++){
      console.log(results1[i].username);
      
      if(username2==results1[i].username){
         console.log("pass1");
         db.query("SELECT password FROM login_student",(err , results2, fields)=>{
            
            for(j=0;j<results2.length;j++){
               //console.log(results2[j].password);
      bcrypt.compare(password2, results2[j].password, function(err, result) {
            //console.log(result);
            if(result == true){
               console.log("pass2");
               //console.log("success login");
               req.session.stu_login = true;
               req.session.username = username2;
               //res.redirect('/home');
               if(req.session.stu_login = true){
                  console.log(2);
                  res.redirect('/stu_course');
               }
            }
            
      });
   }
});
}
else{
console.log("wrong");

}
}
});
}

   }
   else if(username3){
      db.query("SELECT * FROM login_teacher",(err,results2,fields)=>{
         var d=0;
         for(i=0;i<results2.length;i++){
            if(username1 == results2[i].username){
               js_alert.alert("username already exists in teacher");
               d=1;
               break;
            }
         }
         if(d==0){
            bcrypt.hash(password3, saltRounds, function(err, hash) {
               var teacher_data = {
                  "username" : username3,
                  "password" : hash,
                  "domain" : domain,
                  "qualification" : quali
               };
            db.query('INSERT INTO login_teacher SET ?',teacher_data,(err,results,fields)=>{
               if(err) throw err;
            });
            res.redirect('/')
            console.log("teacher added")
         });
         }
         else{
            res.send("unique nahi ahe");
            console.log("username unique nahi ahe")
         }
            
         
      });

      
   }

});


app.get('/home',(req,res)=>{
   console.log(req.session.stu_login);
   console.log(req.session.tea_login);
   if(req.session.tea_login){
      res.send("welcome"+req.session.username);
      res.sendFile(path.join(__dirname + '/index.html'));
      //req.session.tea_login = false;
   }
   else if(req.session.stu_login){
      console.log(req.session.id);
      res.sendFile(path.join(__dirname + '/index.html'));
      //req.session.stu_login = false;

   }
   else{
      res.send("404 not found");
   }
   //req.session.destroy();
});




app.get('/mycourses',(req,res)=>{

   if(req.session.tea_login){

      let course = new Promise((resolve,reject) =>{

         db.query('select course_teacher from courses',(err,results,fields)=>{
            for(var i=0;i<results.length;i++){
               console.log(results[i]);
               if(req.session.username == results[i].course_teacher){
                  resolve();
                  break;
            }
            }
            reject();
         });
      });
      course.then(
         ()=>{
            console.log("resolve");
            res.render('mycourse',{name:req.session.username});
         },
         ()=>{
            console.log("reject");
            res.render('courses',{name:req.session.username});
         }
      )
   }
   else{
      res.send("404 NOT FOUND");
   }
   //req.session.destroy();
   

});
//add course 
app.post('/mycourses',(req,res)=>{
   //const add_course = document.getElementById('add-course')
   //add_course.addEventListener('click',(req,res)=>{
      var name = req.body.course_name;
      var info = req.body.course_info;
      var domain = req.body.course_domain;
      var course_data = {
         "course_name":name,
         "course_info":info,
         "course_teacher":req.session.username,
         "domain":domain
      }
      db.query('insert into courses set ?',course_data,(err,results,fields)=>{
         if(err) throw err; 
         res.redirect('\mycourses');  
      });
   
});



//Courses module
app.get('/stu_course',(request, response) =>{
   if(request.session.stu_login){
      //console.log(request.session.username);
      
      response.render('stu_courses',{name:request.session.username});
   }
   });  
     
app.post('/stu_course',(req,res)=>{
   console.log("Reached stu_courses");
   var name = req.body.subscribed_course_name;
   console.log(name);
      db.query('select * from courses where course_name = ?',name,(err ,results,fields)=>{
         var course_id = results[0].course_id;
         db.query('select id from login_student where username = ?',req.session.username,(err,results,fields)=>{
            var stu_id = results[0].id;
            var my_course_data = {
               "my_course_id":course_id,
               "my_id":stu_id
            }
            console.log(my_course_data);
            let promise = new Promise((resolve,reject)=>{
               db.query('select * from my_subscribed_courses',(err,results,fields)=>{
               if(results.length == 0){
                  db.query('insert into my_subscribed_courses set ?',my_course_data,(err,results,fields)=>{
                     if(err) throw err;
                   });
                   res.redirect('/user/mycourses');
               }
               for(var i=0;i<results.length;i++){
                  if(results[i].my_course_id == course_id && results[i].my_id == stu_id){
                     console.log("Resolved");
                     resolve();
                  }
                  else if(results.length == i+1){
                     console.log("Rejected");
                     reject();
                  }
               }
            });
            })
            promise.then(
               ()=>{
                  console.log("subscribed");
                  res.redirect('/user/mycourses');
               },
               ()=>{
                  db.query('insert into my_subscribed_courses set ?',my_course_data,(err,results,fields)=>{
                     if(err) throw err;
                   });
                   res.redirect('/user/mycourses');
               }
            )
            
       });
       
    });
    
});

app.get('/user/mycourses',(req,res)=>{
      db.query('select id from login_student where username = ?',req.session.username,(err,results1,fields)=>{
      //console.log(results);
      var stu_id = results1[0].id;
      courses = [];
      db.query('select my_course_id from my_subscribed_courses where my_id=?',stu_id,(err,results2,fields)=>{
         //console.log(results);
         for(var i=0;i<results2.length;i++){
         var course_id = results2[i].my_course_id;
         //console.log(course_id);
         db.query('select * from courses where course_id=?',course_id,(err,results3,fields)=>{
            //console.log(results3);
            courses.push(results3);
            if(courses.length == results2.length){
               //console.log(courses);
               res.render('stu_mycourses',{name:req.session.username,results:courses});
            }
         });
         }
      });
   });
});

//photography courses
app.get('/photography',(request, response) =>{
   if(request.session.stu_login){
      db.query('select * from courses',(err,results,fields)=>{
         //console.log(results)
         list = [];
         //var data={list:[]};
         //  
         for(var i=0;i<results.length;i++)
         {
            if(results[i].domain == 'photography')
            {
               list.push(results[i]);
            }
            
         }
         console.log(list)
         response.render('photography',{name:request.session.username,results:list});

      })
      
      
      
   }  
});

//film making courses
app.get('/film',(request, response) =>{
   if(request.session.stu_login){
      db.query('select * from courses',(err,results,fields)=>{
         console.log(results)
         list = [];
         //var data={list:[]};
         //  
         for(var i=0;i<results.length;i++)
         {
            if(results[i].domain == 'film making')
            {
               list.push(results[i]);
            }
            
         }
         response.render('photography',{name:request.session.username,results:list});

      })
      
      
      
   }  
});

//essay writing courses
app.get('/essay',(request, response) =>{
   if(request.session.stu_login){
      db.query('select * from courses',(err,results,fields)=>{
         console.log(results)
         list = [];
         //var data={list:[]};
         //  
         for(var i=0;i<results.length;i++)
         {
            if(results[i].domain == 'essay writing')
            {
               list.push(results[i]);
            }
            
         }
         response.render('photography',{name:request.session.username,results:list});

      })
      
      
      
   }  
});

//foreign language courses
app.get('/foreign',(request, response) =>{
   if(request.session.stu_login){
      db.query('select * from courses',(err,results,fields)=>{
         console.log(results)
         list = [];
         //var data={list:[]};
         //  
         for(var i=0;i<results.length;i++)
         {
            if(results[i].domain == 'foreign language')
            {
               list.push(results[i]);
            }
            
         }
         response.render('photography',{name:request.session.username,results:list});

      })
      
      
      
   }  
});

//Sketching courses
app.get('/sketching',(request, response) =>{
   if(request.session.stu_login){
      db.query('select * from courses',(err,results,fields)=>{
         console.log(results)
         list = [];
         //var data={list:[]};
         //  
         for(var i=0;i<results.length;i++)
         {
            if(results[i].domain == 'sketching')
            {
               list.push(results[i]);
            }
            
         }
         response.render('photography',{name:request.session.username,results:list});

      })
      
      
      
   }  
});


//unsubscription
app.post('/unsubscribed',(req,res)=>{
   var name = req.body.unsubscribed_course_name;
   console.log(name);
   db.query("SELECT * from courses where course_name = ?",name,(err,results,fields)=>{
      var id = results[0].course_id;
      console.log(id);
      db.query("DELETE FROM my_subscribed_courses where my_course_id = ?",id,(err,results1,fields)=>{
      
      })
   })

   res.redirect('/user/mycourses');
})


// assignment uploading module
app.get('/upload',(req,res)=>{
   if(req.session.tea_login){
      res.render('assignment_upload',{name:req.session.username});
   }
});


app.post('/upload',upload.single('myfile'), function (req, res) {
   //console.log(req.file);
   var due_date = new Date(req.body.duedate);
   //console.log(due_date);
   db.query("select course_id from courses where course_teacher =?",req.session.username,(err,results,fields)=>{
      var courseid = results[0].course_id;
      var File_data = {
         "assignment_name" : req.body.assignmentname,
         "assignment_desc" : req.file.filename,
         "course_id" : courseid,
         "due_date" : due_date,
         "assignment_type" : req.file.mimetype
         };
         db.query('INSERT INTO assignments SET ?',File_data,(err,results,fields)=>{
            if(err) throw err;
         });
         res.redirect('/upload');
         });
});


//asignment visible to student 

app.get('/assignment',(req,res)=>{
      db.query('select id from login_student where username = ?',req.session.username,(err,results,fields)=>{
      var studentid = results[0].id;
      db.query('select distinct assignments.assignment_id,assignments.assignment_name,assignments.assignment_desc,assignments.due_date,assignments.assignment_type from assignments inner join my_subscribed_courses on assignments.course_id = my_subscribed_courses.my_course_id where my_subscribed_courses.my_course_id in (select distinct my_course_id from my_subscribed_courses where my_id = ?)',studentid,(err,results1,fields)=>{
         if (err) throw err;
         res.render('stu_assignments',{name:req.session.username,results:results1});
      });
   });
});

//Student uploading assignment

app.post('/assignment',upload.single('submission_file'),function(req,res){
   var assignment_id = req.body.assignment_id;
   var assignment_name = req.body.assignment_name;
   //console.log(assignment_id);
   db.query("SELECT id,name from login_student where name = ?",req.session.username,(err,results,feilds)=>{
      var stu_id = results[0].id;
      var stu_name = results[0].name;
      //console.log(stu_id);
      var submission_data = {
         "assignment_id" : assignment_id,
         "stu_id" : stu_id,
         "stu_name" : stu_name,
         "assignment_type" : req.file.mimetype,
         "assignment_name" : assignment_name,
         "assignment_desc" : req.file.filename
      };
      db.query("INSERT into student_submission SET ?",submission_data,(err,results,feilds)=>{
         if (err) throw err;
      });
   });
   
   //Delete assignment once done is pending
   res.redirect('/assignment');

});

//teacher viewing submitted assignment

app.get('/submissions',(req,res)=>{
   if(req.session.tea_login){
      db.query("Select course_id from courses where course_teacher = ?",req.session.username,(err,results,fields)=>{
         var course_id = results[0].course_id;
         console.log(course_id);
         db.query("select assignment_desc,assignment_name,assignment_type,stu_id,stu_name from student_submission where assignment_id = ANY(select assignment_id from assignments where course_id = ?)",course_id,(err,results1,fields)=>{
            console.log(results1);
            console.log(typeof(results1));
            res.render('tea_assignments',{name:req.session.username,results:results1});
         });
      });

      
   }
});

app.listen(3000);
   


