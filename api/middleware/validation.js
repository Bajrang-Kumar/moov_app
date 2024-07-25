// const Validator = require('Validator')
const conn = require('../config/database')
const { default: localizify } = require('localizify')
const en = require('../language/en')
const fr = require('../language/fr')
const ar = require('../language/ar')
const { t } = require('localizify')
const cryptLib = require('cryptlib')

let shaKey = cryptLib.getHashSha256(process.env.KEY, 32)

let doNotCheckToken = new Array('login', 'signup', 'forgot_password', 'verify_otp', 'reset_form', 'resend_forgot_otp', 'reset_password', 'success');

let middleware = {

    extHeaderLang: (req, res, callback) => {
        let headerLang = (req.headers['accept-language'] != undefined && req.headers['accept-language'] != '') ? req.headers['accept-language'] : 'en';

        req.lang = headerLang;

        req.language = (headerLang === 'en') ? en : (headerLang === 'ar') ? ar : fr;

        localizify.add('en', en).add('ar', ar).add('fr', fr).setLocale(req.language);

        callback();
    },

    validateApikey: (req, res, callback) => {

        let api_key = (req.headers['api-key'] != undefined && req.headers['api-key'] != '') ? req.headers['api-key'] : '';

        if (api_key != '') {
            try {
                let dec_api_key = cryptLib.decrypt(api_key, shaKey, process.env.IV);
                if (dec_api_key != "" && dec_api_key == process.env.API_KEY) {
                    callback();
                }
                else {
                    resData = {
                        code: '0',
                        message: t('header_key_incorrect')
                    }
                    res.status(401);
                    res.send(resData);
                }
            } catch (error) {
                resData = {
                    code: '0',
                    message: t('header_key_incorrect')
                }
                res.status(401);
                res.send(resData);
            }
        }
        else {
            resData = {
                code: '0',
                message: t("header_key_incorrect")
            }
            res.status(401);
            res.send(resData);
        }
    },

    validateHeaderToken: (req, res, callback) => {
        let headToken = (req.headers['token'] != undefined && req.headers['token'] != '') ? cryptLib.decrypt(req.headers['token'], shaKey, process.env.IV).replace(/\s/g, '') : '';

        // let headToken = (req.headers['token'] != undefined && req.headers['token'] != '') ? req.headers['token'] : '';

        let pathOfUrl = req.path.split('/');

        if (doNotCheckToken.indexOf(pathOfUrl[4]) === -1) {
            if (headToken != '') {
                if (pathOfUrl[3] === 'admin') {
                    conn.query("select * from tbl_admin_session where token = '" + headToken + "' ", (err, adminResult) => {
                        if (!err && adminResult.length > 0) {
                            req.user_id = adminResult[0].admin_id;
                            callback();
                        }
                        else {
                            res_data = {
                                code: '0',
                                message: t('header_token_incorrect')
                            }
                            res.status(401);
                            res.send(res_data);
                        }
                    })
                } else {
                    conn.query("select * from tbl_user_device where token = ?", [headToken], (error, result) => {
                        if (!error && result.length > 0) {
                            req.user_id = result[0].user_id;
                            callback();
                        }
                        else {
                            res_data = {
                                code: '0',
                                message: t('header_token_incorrect')
                            }
                            res.status(401);
                            res.send(res_data);
                        }
                    });
                }
            }
            else {
                res_data = {
                    code: '0',
                    message: t('header_token_incorrect')
                }
                res.status(401);
                res.send(res_data);
            }
        }
        else {
            callback();
        }
    },

    checkValidationRules: (res, request, rules, message) => {

        let valid = require('Validator').make(request, rules, message);

        if (valid.fails()) {
            let errors = valid.getErrors();
            var error = "";
            for (var key in errors) {
                error = errors[key][0];
                break;
            }
            resData = {
                code: '0',
                message: error
            }
            res.status(200);
            res.send(resData);
            return false;
        }
        else {
            return true;
        }
    },

    send_response: (req, res, code, message, data) => {
        middleware.getMessage(req.lang, message, (trans_message) => {
            if (data == null) {
                resData = {
                    code: code,
                    message: trans_message,
                    data: data
                }
                // middleware.
                res.status(200);
                res.send(resData);
            }
            else {
                resData = {
                    code: code,
                    message: trans_message,
                    data: data
                }
                res.status(200);
                res.send(resData);
            }
        });
    },

    getMessage: (language, message, callback) => {
        localizify.add('en', en).add('ar', ar).add('fr', fr).setLocale(language);

        callback(t(message.keyword, message.content));
    },

    encryption: (response_data, callback) => {
        let response = cryptLib.encrypt(JSON.stringify(response_data), shaKey, process.env.IV);
        callback(response);
        // callback(response_data);
    },

    decryption: (encrypt_text, callback) => {
        if (encrypt_text != undefined && Object.keys(encrypt_text).length !== 0) {
            try {
                let request = JSON.parse(cryptLib.decrypt(encrypt_text, shaKey, process.env.IV));
                callback(request);
            } catch (error) {
                // console.log("error   /./././.", error)
                callback({});
            }
        } else {
            callback({});
        }
    },
}

module.exports = middleware