const ncp = require('ncp').ncp;
ncp.limit = 16;

function AssetCopy(){
    return {
        copyRecursive : function(){
            ncp("C:\development\repos\bids-tool\SarnovaBid\SarnovaBid-Web\target\SarnovaBid-Web\resources", "C:\development\tomcat-1\webapps\SarnovaBid-Web\resources", function (err) {
                if (err) {
                  return console.error(err);
                }
                console.log('done!');
            });
        }
    }
}

export { AssetCopy };