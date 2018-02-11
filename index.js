// import {AssetCopy} from "./modules/AssetCopy.js";

const express = require('express');
const moment = require("moment");
const path = require("path");

// const assetCopy = AssetCopy();
const app = express();
const router = express.Router();
const port = 9090;

app.use(express.static('public'));

app.get('/',function(req,res){
    res.sendFile(path.resolve('./public/view/index.html'));
});

app.get('/api/project',function(req,res){
    res.sendFile(path.resolve('./project.json'));
});

app.get('/api/tomcat/start',function(req,res){
    var exec = require('child_process').exec;
    exec('startup', {
    cwd: 'C:\\development\\tomcat-1\\bin'
    }, function(error, stdout, stderr) {
        
    });
    res.send({startup:new Date()});
});

app.get('/api/tomcat/stop',function(req,res){
    var exec = require('child_process').exec;
    exec('catalina stop -force', {
    cwd: 'C:\\development\\tomcat-1\\bin'
    }, function(error, stdout, stderr) {
        console.log(error,stdout,stderr);
        if(error || stderr){
            if(error){
                res.send({failed:true, error:error});
            }else{
                res.send({failed:true, stderr:stderr});
            }
            return;
        }
        res.send({shutdown:new Date(),output:stdout});
    });
});

app.get('/copy',function(req,res){
    // const ncp = require('ncp').ncp;
    // ncp.limit = 16;

    // ncp("C:\\development\\repos\\bids-tool\\SarnovaBid\\SarnovaBid-Web\\target\\SarnovaBid-Web\\resources", "C:\\development\\tomcat-1\\webapps\\SarnovaBid-Web\\resources", function (err) {
    //     if (err) {
    //       return console.error(err);
    //     }
    //     console.log('done!');
    //     res.send("DONE!!!")
    // });

    // var exec = require('child_process').exec;
    // exec('mvn package', {
    // cwd: 'C:\\development\\repos\\bids-tool\\SarnovaBid\\SarnovaBid-Web'
    // }, function(error, stdout, stderr) {
    //     res.send(stdout);
    // });



    var exec = require('child_process').exec;
    exec('shutdown', {
    cwd: 'C:\\development\\tomcat-1\\bin'
    }, function(error, stdout, stderr) {
        // console.log(error,stdout,stderr);
        res.send(stdout);
        // res.send(stderr);
    });
});


app.listen(port);
console.log('Tomcat Manager Started at PORT:',port);