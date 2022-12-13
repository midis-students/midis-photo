const request = require('request');
const fs = require("fs")

// node app.js LOGIN PASSWORD file.png

if(process.argv.length==5){
    request.post("https://portal.midis.info/auth/", {
        formData:{
            AUTH_FORM:'Y',
            TYPE: 'AUTH',
            USER_LOGIN: process.argv[2],
            USER_PASSWORD: process.argv[3]
        }
    }, (err, res)=>{
        var PHPSESSID = res.headers['set-cookie'][0];
        request.get("https://portal.midis.info/company/personal/user/0/?IFRAME=Y&IFRAME_TYPE=SIDE_SLIDER", {
            headers:{
                Cookie:PHPSESSID
            }
        }, (err, ress)=>{
            var sessid = ress.body.split('"')
            for (let i = 0; i < sessid.length; i++) {
                const element = sessid[i];
                if(element.length==32&&/[0-9a-z]{32}/gm.test(element)) {
                    sessid=element
                    break;
                }
            }
        
            var signed = ress.body.split("'")
            signed = signed[signed.indexOf("SIGNED_PARAMETERS")+2]
        
            var req = request.post("https://portal.midis.info/bitrix/services/main/ajax.php?mode=ajax&c=bitrix%3Aintranet.user.profile&action=loadPhoto", {
                headers:{
                    "x-bitrix-csrf-token": sessid,
                    "Cookie":PHPSESSID
                }
            }, function (err, resp, body) {
                console.log(body)
            });

            var form = req.form();
            form.append('signedParameters', signed);
            form.append('newPhoto', fs.createReadStream(process.argv[4]));
        })
    })
}else{
    console.log("Argv not found")
}