// import {AssetCopy} from "./modules/AssetCopy.js";

const express = require('express');
var compression = require('compression');
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const getFolderSize = require('get-folder-size');
const md5 = require('md5');
const ncp = require('ncp').ncp;
ncp.limit = 16;

// const assetCopy = AssetCopy();
const app = express();
const router = express.Router();
const port = 9090;
const logFile = './manager.log';

const folderSize = {};
const assetCopyTimer = {};

app.use(express.static('public'));
app.use(compression());

var logStream = fs.createWriteStream(logFile, {flags: 'w'});

// const WebSocket = require('ws');
// const wss = new WebSocket.Server({
//   port: 9091,
// });

app.get('/',function(req,res){
    res.sendFile(path.resolve('./public/view/index.html'));
});

app.get('/api/project',function(req,res){
    res.sendFile(path.resolve('./project.json'));
});

app.get('/api/tomcat/start',function(req,res){
    var spawn = require('child_process').spawn;

    var execution = spawn('catalina run', {
    cwd: req.query.tomcatBin,
    silent:true,
    maxBuffer: 1024 * 1000,
    shell:true,
    });

    execution.stdout.resume();
    execution.stderr.resume();

    execution.stdout.on('data', function(data) {
        logStream.write(data);
        console.log(data.length+" bytes output from tomcat.");
    });
    execution.stderr.on('data', (data) => {
        logStream.write(data);
        console.log(data);
    });
    execution.on('close', (code) => {
        logStream.write(code);
        console.log(code);
    });
    res.send({startup:new Date()});
});


app.get('/api/build',function(req,res){
    var location = req.query.location;
    var spawn = require('child_process').spawn;
    var execution = spawn('mvn package', {
    cwd: location,
    silent:true,
    maxBuffer: 1024 * 300,
    shell:true,
    });
    // execution.stdout.pipe(logStream);
    execution.stdout.on('data', function(data) {
        logStream.write(data);
        console.log(data);
    });
});

app.get('/api/copy/file',function(req,res){
    var from = req.query.from.replace(/\\\\/g, '\\');
    var to = req.query.to.replace(/\\\\/g, '\\');
    try{
        var fromParts = from.split("\\");
        var fileName = fromParts[fromParts.length -1];
        fs.copyFileSync(from, path.join(to,fileName));
        var message = {action:"copyFile",success:true,from:from,to:to};
        logStream.write(JSON.stringify(message)+'\n');
        res.send(message);
    }catch(error){
        logStream.write(JSON.stringify(error)+'\n');
        res.send(error);
    }
});

app.get('/api/log',function(req,res){
    const stats = fs.statSync(logFile);
    const fileSizeInBytes = stats.size;
    res.setHeader('X-LOG-FILE-SIZE',fileSizeInBytes);
    if(req.query.previousSize !== null){
        if(parseInt(req.query.previousSize,10) === parseInt(fileSizeInBytes,10)){
            res.send({noChange:true});
            return;
        }
    }
    res.sendFile(path.resolve(logFile));
});

app.get('/api/tomcat/stop',function(req,res){
    var exec = require('child_process').exec;
    var execution = exec('catalina stop -force', {
        cwd: req.query.tomcatBin,
        }, function(error, stdout, stderr) {
            console.log(error,stdout,stderr);
            // stdout = stdout.replace(new RegExp('\r?\n','g'), '<br />');
            // stderr = stderr.replace(new RegExp('\r?\n','g'), '<br />');
            if(error || stderr){
                if(error){
                    logStream.write(JSON.stringify(error));
                    res.send({failed:true, error:error});
                }else{
                    logStream.write(stderr);
                    res.send({failed:true, stderr:stderr});
                }
                return;
            }
            res.send({shutdown:new Date(),output:stdout});
        });
});

app.get('/api/copy/folder',function(req,res){
    var from =  req.query.from.replace(/\\\\/g, '\\');
    var to = req.query.to.replace(/\\\\/g, '\\');

    var timerHash = md5(from+to);
    clearInterval(assetCopyTimer[timerHash]);

    assetCopyTimer[timerHash] = setInterval(
            function(){
                getFolderSize(from, function(err,size){
                    if(err){
                        logStream.write(err);
                        return;
                    }
                    console.log("Size "+size+" Folder "+from);
                    if(folderSize[md5(from)] === size){ // no change no copy
                        return;
                    }
                    folderSize[md5(from)] = size;
                    ncp(from, to , function (err) {
                        if (err) {
                        var response = {success:false,error:err,from:from,to:to};
                        logStream.write(JSON.stringify(response)+'\n');
                        console.log(response);
                        }else{
                            var response = {success:true,from:from,to:to};
                            logStream.write(JSON.stringify(response)+'\n');
                            console.log(response);
                        }
                    });
                })
            },
            2000);

    res.send({message:"Copy request received."});
});

app.listen(port);
console.log('Tomcat Manager Started at PORT:',port);