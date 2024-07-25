const path = require("path");
const multer = require("multer")
var express = require("express");
var middleware = require("../../../middleware/validation");
var driver_module = require("./driver_module");
var router = express.Router();


// File Upload Using Multer
const storageuploads = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "uploads/users/")
    },
    filename: (req, file, callback) => {
        //get extention
        const extention = path.extname(file.originalname);
        //generate radom file path
        const uuid = Date.now() + "-" + Math.round(Math.random() * 1e6);
        const fileName = uuid + extention;
        // req.body.image = fileName
        callback(null, fileName);
        // console.log(fileName);
    }
});

const uploadFile = multer({ storage: storageuploads });


// signUp api
router.post("/signup", uploadFile.single("image"), function (req, res) {
    // middleware.decryption(req.body,function(request){

    let request_data = req.body;
    // request_data.image = req.file.filename;

    // console.log(req.file,"----------------",req.body);
    rules = {
        role: 'required',
        first_name: 'required',
        last_name: 'required',
        email: 'required|email',
        password: 'required',
        country_code: 'required',
        phone: 'required',

        device_type: 'required',
        device_name: 'required',
        device_token: 'required',
        os_version: 'required',
    }

    message = {
        required: req.language.required,
        email: req.language.email,
    }

    if (middleware.checkValidationRules(res, request_data, rules, message)) {
        driver_module.signup(request_data, function (code, message, data) {
            middleware.send_response(req, res, code, message, data);
        })
    }

    // })
});



module.exports = router