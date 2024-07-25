var con = require('../../../config/database');
var GLOBALS = require('../../../config/constant');

var API = {

    /**
     * Function to get api users list
     * 04-06-2021
     * @param {Function} callback 
     */
    apiuserList: function (callback) {

        con.query("SELECT u.*, concat(u.first_name,' ',u.last_name) as user_name,concat('" + GLOBALS.S3_BUCKET_ROOT + GLOBALS.USER_IMAGE + "','',u.profile_image) as profile_image,IFNULL(ut.device_token,'') as device_token, IFNULL(ut.device_type,'') as device_type, IFNULL(ut.token,'') as token, CASE WHEN u.is_login = '0' THEN 'Offline' ELSE 'Online' END as is_login, ut.insert_datetime as last_login, ut.update_datetime as insert_datetime FROM tbl_user u LEFT JOIN tbl_user_device as ut ON u.id = ut.user_id WHERE u.is_deleted = '0' GROUP BY u.id", function (err, result, fields) {
            if (!err && result.length > 0) {
                // console.log(result, "hello");
                callback(result);
            } else {
                // console.log(err, "error");
                callback(null, err);
            }
        });
    },
}

module.exports = API;