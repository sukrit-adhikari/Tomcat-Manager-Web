new Vue({
    el: '#tomcatManager',
    data: {
      manage: {
            tomcat:{
                    bin:null
                }
            },
      state:{
          building:false
      },
      timer: {
        loadLog: null,
        watchFolder: {},
      },
      watching:{},
      log: "",
    },
    watch: {
        log: function (val) {
            // setTimeout(
            //     function(){
                   
            //     }
            //     ,500);
        }
    },
    mounted: function () {
        var self = this;
        self.loadLog();
        
        $.ajax({
            url: '/api/project',
            method: 'GET',
            success: function (response) {
               self.manage = response;
            },
            error: function (error) {
                console.log(error);
            }
        });
    },
    methods:{
        isBuilding: function(){
            return this.state.building;
        },
        populateModal : function(text){
            $('#responseReceivedModal .modal-body').html(text);
        },
        showModal: function(){
            this.populateModal("Loading...");
            $('#responseReceivedModal').modal('show');
        },
        sendTomcatStopRequest: function(tomcatBin){
            var self = this;
            // self.showModal();
            $.ajax({
                url: '/api/tomcat/stop',
                method: 'GET',
                data:{tomcatBin:tomcatBin},
                success: function (response) {
                    // if(response.failed && response.stderr){
                    //     self.log+=response.stderr;
                    // }
                    // if(response.failed && response.error){
                    //     self.log+=response.error;
                    // }
                    // if(response.shutdown){
                    //     self.log+=response.shutdown;
                    // }
                },
                error: function (error) {
                    self.log+="<CONSOLE> Stopping Tomcat Failed...\n";
                    console.log(JSON.stringify(error));
                }
            });
        },
        sendTomcatStartRequest: function(tomcatBin){
            var self = this;
            // self.showModal();
            $.ajax({
                url: '/api/tomcat/start',
                method: 'GET',
                data:{tomcatBin:tomcatBin},
                success: function (response) {
                    // if(response.startup){
                    //     self.populateModal(response.startup);
                    // }
                },
                error: function (error) {
                    self.log+="<CONSOLE> Starting Tomcat Failed...\n";
                    console.log(JSON.stringify(error));
                }
            });
        },
        loadLog: function(){
            var self = this;
            clearInterval(this.timer.loadLog);
            this.timer.loadLog = setInterval(function(){
                $.ajax({
                    method: 'GET',
                    url: '/api/log',
                    data: {previousSize:self.log.length === 0 ? -1 : self.log.length },
                    success: function (response, textStatus, jqXHR) {
                        if(!response.noChange && self.log.length !== jqXHR.getResponseHeader("X-LOG-FILE-SIZE")){
                            self.log = response;
                        }
                        if(!$("#log").is(":focus")){
                            $("#log").animate({
                                scrollTop:$("#log")[0].scrollHeight - $("#log").height()
                            },200,function(){
                                // success clbck           
                            })
                        }
                    },
                    error: function (error) {
                        self.log+="<CONSOLE> Loading Log Failed...\n";
                        console.log(JSON.stringify(error));
                    }
                });
            },2000);
            
        },
        sendBuildRequest: function(location){
            var self = this;
            this.state.building = true;
            $.ajax({
                url: '/api/build',
                method: 'GET',
                data:{location:location},
                success: function (response) {
                    self.state.building = false;
                },
                error: function (error) {
                    self.state.building = false;
                    alert(JSON.stringify(error));
                }
            });
        },
        watchFolder: function(from,to){
            var self = this;
            var timerHash = md5(from+to);
            this.watching[timerHash] = true;
            $.ajax({
                url: '/api/copy/folder',
                method: 'GET',
                data:{from:from,to:to},
                success: function (response) {
                    self.populateModal(response.message);
                },
                error: function (error) {
                    alert(JSON.stringify(error));
                }
            });
        },
        copyFile: function(from,to){
            var self = this;
            $.ajax({
                url: '/api/copy/file',
                method: 'GET',
                data:{from:from,to:to},
                success: function (response) {
                    
                },
                error: function (error) {
                    alert(JSON.stringify(error));
                }
            });
        },
        isWatching: function(from,to){
            var hash = md5(from+to);
            if(this.watching[hash]){
                return true;
            }
            return false;
        }
    }
});