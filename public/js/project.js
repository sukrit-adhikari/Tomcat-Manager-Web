new Vue({
    el: '#tomcatManager',
    data: {
      manage: {
            tomcat:{
                    bin:null
                }
            },
    },
    mounted: function () {
        var self = this;
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
        populateModal : function(text){
            $('#responseReceivedModal .modal-body').html(text);
        },
        showModal: function(){
            $('#responseReceivedModal').modal('show');
        },
        sendTomcatStopRequest: function(){
            var self = this;
            $.ajax({
                url: '/api/tomcat/stop',
                method: 'GET',
                success: function (response) {
                    if(response.failed && response.stderr){
                        self.populateModal(response.stderr);
                    }
                    if(response.failed && response.error){
                        self.populateModal(response.error);
                    }
                    if(response.shutdown){
                        self.populateModal(response.shutdown);
                    }
                    self.showModal();
                },
                error: function (error) {
                    alert(JSON.stringify(error));
                }
            });
        },
        sendTomcatStartRequest: function(){
            var self = this;
            $.ajax({
                url: '/api/tomcat/start',
                method: 'GET',
                success: function (response) {
                    if(response.startup){
                        self.populateModal(response.startup);
                    }
                    self.showModal();
                },
                error: function (error) {
                    alert(JSON.stringify(error));
                }
            });
        }
    }
});