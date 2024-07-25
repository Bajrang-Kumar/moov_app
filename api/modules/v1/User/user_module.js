var database = require("../../../config/database");
var asyncLoop = require("node-async-loop");
var md5 = require("md5");
var commonFunction = require("../../../config/common");
var GLOBALS = require("../../../config/constant");
const template = require("../../../config/template");



const User = {

    signup: (request, callback) => {
        
        let requestBody = {
            role: 'user',
            first_name: request.first_name,
            last_name: request.last_name,
            email: request.email,
            country_code: request.country_code,
            phone: request.phone,
            password: md5(request.password),
            is_checked: request.is_checked
        }

        const checkQuery = 'select * from tbl_user where role = "' + requestBody.role + '" and email = "' + requestBody.email + '" and phone = "' + requestBody.phone + '"'

        const insertQuery = "insert into tbl_user set ?"

        const generateOTP = commonFunction.genOtp(4)

        database.query(checkQuery, (err, isUser) => {
            if (!err) {
                if (isUser.length > 0) {
                    callback('2', { keyword: 'duplicate_email_with_role', content: {} })
                } else {
                    database.query(insertQuery, requestBody, (error, inserted) => {
                        if (!error) {
                            if (inserted.insertId) {
                                // OTP sent for verification

                                template.otp_sent(generateOTP, (template) => {
                                    commonFunction.send_email('OTP verification', requestBody.email, template, (isSent) => {
                                        if (isSent) {

                                            const userDevice = {
                                                user_id: inserted.insertId,

                                                device_type: request.device_type,
                                                device_token: request.device_token,

                                                device_name: (request.device_name !== '' && request.device_name !== undefined) && request.device_name,
                                                os_version: (request.os_version !== '' && request.os_version !== undefined) && request.os_version,

                                                token: commonFunction.genToken(32)
                                            }

                                            database.query("update tbl_user set otp_code  = '" + generateOTP + "' where id = '" + inserted.insertId + "' and is_checked = '1' ", (errors, isUpdate) => {
                                                if (!errors) {
                                                    if (isUpdate) {
                                                        database.query("insert into tbl_user_device set ?", userDevice, (error, insertOne) => {
                                                            if (!error) {
                                                                if (insertOne.insertId) {
                                                                    commonFunction.userDetails(userDevice.user_id, (code, message, data) => {
                                                                        if (data) {
                                                                            // console.log("final added data : ", data)
                                                                            callback(code, { keyword: '_user_signup_success', content: {} }, data)
                                                                        } else {
                                                                            callback(code, message, data)
                                                                        }
                                                                    })
                                                                }
                                                                else {
                                                                    callback('2', { keyword: 'no_data', content: {} }, [])
                                                                }
                                                            }
                                                            else {
                                                                callback('0', { keyword: 'error_occurred', content: {} })
                                                            }
                                                        })
                                                    }
                                                    else {
                                                        callback('0', { keyword: 'not_saved', content: {} })
                                                    }
                                                } else {
                                                    callback('0', { keyword: 'error_occurred', content: {} })
                                                }
                                            })
                                        }
                                        else {
                                            callback('0', { keyword: '_failed_to_send_verification_email', content: {} })
                                        }
                                    })
                                })
                            }
                            else {
                                callback('0', { keyword: 'missing_params', content: {} },)
                            }
                        }
                        else {
                            callback('0', { keyword: 'error_occurred', content: {} })
                        }
                    })
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    otpVerify: (request, callback) => {
        database.query("select * from tbl_user where otp_code = '" + request.otp + "' and id = '" + request.user_id + "' ", (err, result) => {
            if (!err) {
                if (result.length > 0) {
                    database.query("update tbl_user set otp_code = '', otp_verify = '1' where id = '" + request.user_id + "'", (error, isUpdate) => {
                        if (!error) {
                            if (isUpdate) {
                                callback('1', { keyword: 'verified', content: {} },)
                            }
                            else {
                                callback('0', { keyword: 'not_saved', content: {} })
                            }
                        } else {
                            callback('0', { keyword: 'error_occurred', content: {} })
                        }
                    })
                }
                else {
                    callback('0', { keyword: 'invalid_otp', content: {} })
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    resendOtp: (request, callback) => {
        let generateOTP = commonFunction.genOtp(4)

        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_checked = '1' ", (err, result) => {
            if (!err) {
                if (result.length > 0) {
                    template.otp_sent(generateOTP, (template) => {

                        commonFunction.send_email('OTP Verification', result[0].email, template, (isSent) => {
                            if (isSent) {
                                database.query("update tbl_user set otp_code  = '" + generateOTP + "' where id = '" + result[0].id + "' ", (errors, isUpdate) => {
                                    if (!errors) {
                                        if (isUpdate) {
                                            callback('1', { keyword: 'otp_sent', content: {} })
                                        }
                                        else {
                                            callback('0', { keyword: 'not_saved', content: {} })
                                        }
                                    } else {
                                        callback('0', { keyword: 'error_occurred', content: {} })
                                    }
                                })
                            }
                            else {
                                callback('0', { keyword: '_failed_to_send_verification_email', content: {} })
                            }
                        })
                    })
                }
                else {
                    callback('0', { keyword: 'invalid_otp', content: {} })
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    login: (request, callback) => {
        database.query("select * from tbl_user where country_code = '" + request.country_code + "' and phone = '" + request.phone + "' and password = '" + md5(request.password) + "' and is_login = '0' and is_active = '0' and is_checked = '1' and is_deleted = '0' ", (err, result) => {
            if (!err) {
                if (result.length > 0) {

                    const userDevice = {
                        user_id: result[0].id,

                        device_type: request.device_type,
                        device_token: request.device_token,

                        device_name: (request.device_name !== '' && request.device_name !== undefined) && request.device_name,
                        os_version: (request.os_version !== '' && request.os_version !== undefined) && request.os_version,

                        token: commonFunction.genToken(32)
                    }

                    if (result[0].otp_verify.toString() === '1') {
                        database.query("select * from tbl_user_device where user_id = '" + userDevice.user_id + "'", (err, response) => {
                            if (!err) {
                                if (response.length > 0) {
                                    database.query('update tbl_user_device set token = "' + userDevice.token + '" where user_id = "' + userDevice.user_id + '" ', (error5, result5) => {
                                        if (!error5) {
                                            if (result5) {
                                                database.query("update tbl_user set is_login = '1' , is_active = '1' where id = '" + userDevice.user_id + "'", (errors, results) => {
                                                    if (!errors) {
                                                        if (results) {
                                                            commonFunction.userDetails(userDevice.user_id, (code, message, data) => {
                                                                if (data) {
                                                                    // console.log("final existing data : ", data)
                                                                    callback(code, { keyword: '_user_login_success', content: {} }, data)
                                                                } else {
                                                                    callback(code, message, data)
                                                                }
                                                            })
                                                        }
                                                        else {
                                                            callback('2', { keyword: 'no_data', content: {} }, [])
                                                        }
                                                    } else {
                                                        callback('0', { keyword: 'error_occurred', content: {} })
                                                    }
                                                })
                                            }
                                            else {
                                                callback('2', { keyword: 'not_saved', content: {} }, [])
                                            }
                                        }
                                        else {
                                            callback('0', { keyword: 'error_occurred', content: {} })
                                        }
                                    })
                                }
                                else {
                                    database.query("insert into tbl_user_device set ?", userDevice, (error, insertOne) => {
                                        if (!error) {
                                            if (insertOne.insertId) {
                                                database.query("update tbl_user set is_login = '1' , is_active = '1' where id = '" + userDevice.user_id + "'", (errors, results) => {
                                                    if (!errors) {
                                                        if (results) {
                                                            commonFunction.userDetails(userDevice.user_id, (code, message, data) => {
                                                                if (data) {
                                                                    // console.log("final added data : ", data)
                                                                    callback(code, { keyword: '_user_login_success', content: {} }, data)
                                                                } else {
                                                                    callback(code, message, data)
                                                                }
                                                            })
                                                        }
                                                        else {
                                                            callback('2', { keyword: 'no_data', content: {} }, [])
                                                        }
                                                    } else {
                                                        callback('0', { keyword: 'error_occurred', content: {} })
                                                    }
                                                })
                                            }
                                            else {
                                                callback('2', { keyword: 'no_data', content: {} }, [])
                                            }
                                        }
                                        else {
                                            callback('0', { keyword: 'error_occurred', content: {} })
                                        }
                                    })
                                }
                            }
                            else {
                                callback('0', { keyword: 'error_occurred', content: {} })
                            }
                        })
                    }
                    else {
                        callback('0', { keyword: '_unverified', content: {} })
                    }
                }
                else {
                    callback('2', { keyword: '_invalid_logindetails', content: {} }, [])
                }
            }
            else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    logout: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active = '1'", (err, res) => {
            if (!err) {
                if (res.length > 0) {
                    database.query("update tbl_user set is_login = '0' , is_active = '0' where id = '" + request.user_id + "'", (error, result) => {
                        if (!error && result) {
                            database.query("delete from tbl_user_device where user_id = '" + request.user_id + "'", (errors, deleted) => {
                                if (!errors) {
                                    if (deleted) {
                                        callback('1', { keyword: '_userlogout_success', content: {} })
                                    }
                                } else {
                                    callback('0', { keyword: 'error_occurred', content: {} })
                                }
                            })
                        } else {
                            callback('0', { keyword: 'error_occurred', content: {} })
                        }
                    })
                }
                else {
                    callback('2', { keyword: 'no_data', content: {} }, [])
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    delete_profile: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active  = '1' and is_deleted = '0'", (err, user) => {
            if (!err) {
                if (user.length > 0) {
                    database.query("delete from tbl_user where id = '" + request.user_id + "'", (err, deleted) => {
                        if (!err && deleted) {
                            callback('1', { keyword: 'account_deleted', content: {} })
                        } else {
                            callback('0', { keyword: 'error_occurred', content: {} })
                        }
                    })
                }
                else {
                    callback('2', { keyword: 'no_data', content: {} }, [])
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    user_profile: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active  = '1' and is_deleted = '0'", (err, user) => {
            if (!err) {
                if (user.length > 0) {
                    callback('1', { keyword: 'success', content: {} }, user)
                }
                else {
                    callback('2', { keyword: 'no_data', content: {} }, [])
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    changePassword: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and password = '" + md5(request.old_password) + "'", (err, result) => {
            if (!err) {
                if (result.length > 0) {
                    if (request.old_password !== request.new_password) {
                        if (request.new_password === request.confirm_password) {
                            database.query("update tbl_user set password = '" + md5(request.new_password) + "' where id = '" + request.user_id + "'", (error, updated) => {
                                if (!error && updated) {
                                    callback('1', { keyword: 'change_password', content: {} })
                                } else {
                                    callback('0', { keyword: 'error_occurred', content: {} })
                                }
                            })
                        } else {
                            callback('0', { keyword: 'password_do_not_match', content: {} })
                        }
                    }
                    else {
                        callback('0', { keyword: '_user_newold_password_similar', content: {} })
                    }
                } else {
                    callback('2', { keyword: 'no_data', content: {} }, [])
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    update_profile: (request, callback) => {

        const image_extension = ['jpg', 'png', 'jpeg'];
        const emailRegex = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        const codeRegex = /^\+\d{1,3}$/;

        let requestBody = {}

        if (request.profile_image !== '' && request.profile_image !== undefined && image_extension.includes(request.profile_image.split('.').pop().toLowerCase())) {

            if (request.profile_image.trim() !== '') {
                requestBody.profile_image = request.profile_image
            }
        }
        if (request.first_name !== '' && request.first_name !== undefined) {
            if (request.first_name.trim() !== '') {
                requestBody.first_name = request.first_name
            }
        }
        if (request.last_name !== '' && request.last_name !== undefined) {
            if (request.last_name.trim() !== '') {
                requestBody.last_name = request.last_name
            }
        }
        if (request.country_code !== '' && request.country_code !== undefined && codeRegex.test(request.country_code)) {
            if (request.country_code.trim() !== '') {
                requestBody.country_code = request.country_code
            }
        }
        if (request.phone !== '' && request.phone !== undefined && request.phone.length == '10') {
            if (request.phone.trim() !== '') {
                requestBody.phone = request.phone
            }
        }
        if (request.email !== '' && request.email !== undefined && emailRegex.test(request.email)) {
            if (request.email.trim() !== '') {
                requestBody.email = request.email
            }
        }

        // console.log("requestBody for update profile : : ", requestBody)

        database.query("update tbl_user set ? where id = '" + request.user_id + "'", requestBody, (err, updated) => {
            if (!err && updated) {
                callback('1', { keyword: 'success', content: {} })
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    forgotPassword: (request, callback) => {
        database.query("select * from tbl_user where country_code = '" + request.country_code + "' and phone = '" + request.phone + "' and is_login = '0' and is_active = '0' and is_deleted = '0'", (err, result) => {
            if (!err) {
                if (result.length > 0) {
                    let generateOTP = commonFunction.genOtp(4)

                    template.otp_sent(generateOTP, (template) => {
                        // Sent Email
                        commonFunction.send_email('OTP For Forget Password', result[0].email, template, (isSent) => {
                            if (isSent) {
                                database.query("update tbl_user set is_forgot = '1', otp_code  = '" + generateOTP + "', forgot_password_datetime = NOW() where id = '" + result[0].id + "'", (errors, isUpdate) => {
                                    if (!errors) {
                                        if (isUpdate) {
                                            commonFunction.userDetails(result[0].id, (code, message, data) => {
                                                if (data) {
                                                    // console.log("final existing data : ", data)
                                                    const realData = {
                                                        otp: generateOTP,
                                                        user_id: result[0].id
                                                    }
                                                    callback(code, { keyword: 'otp_for_forgetPass', content: {} }, realData)
                                                } else {
                                                    callback(code, message, data)
                                                }
                                            })
                                        }
                                        else {
                                            callback('0', { keyword: '_user_forgot_password_failed', content: {} })
                                        }
                                    } else {
                                        callback('0', { keyword: 'error_occurred', content: {} })
                                    }
                                })
                            }
                            else {
                                callback('0', { keyword: '_user_forgot_password_failed', content: {} })
                            }
                        })
                    })
                }
                else {
                    callback('2', { keyword: 'no_data', content: {} }, [])
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    verifyOTP: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and otp_code = '" + request.otp + "' and is_forgot = '1'", (err, response) => {
            if (!err) {
                if (response.length > 0) {
                    database.query("update tbl_user set otp_code = '' , forgot_password_datetime = null where id = '" + request.user_id + "'", (error, isUpdate) => {
                        if (!error) {
                            if (isUpdate) {
                                let resBody = {
                                    user_id: response[0].id
                                }
                                callback('1', { keyword: 'verified', content: {} }, resBody)
                            }
                            else {
                                callback('0', { keyword: 'not_saved', content: {} })
                            }
                        } else {
                            callback('0', { keyword: 'error_occurred', content: {} })
                        }
                    })
                } else {
                    callback('2', { keyword: 'no_data', content: {} }, [])
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    resetPassword: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_forgot = '1' and is_login = '0'", (err, result) => {
            if (!err) {
                if (result.length > 0) {
                    if (request.new_password === request.confirm_password) {
                        database.query("update tbl_user set password = '" + md5(request.new_password) + "', is_forgot = '0', password_update_datetime = NOW() where id = '" + request.user_id + "' ", (error, updated) => {
                            if (!error && updated) {
                                callback('1', { keyword: 'change_password', content: {} })
                            } else {
                                callback('0', { keyword: 'error_occurred', content: {} })
                            }
                        })
                    } else {
                        callback('0', { keyword: 'password_do_not_match', content: {} })
                    }
                } else {
                    callback('2', { keyword: 'no_data', content: {} }, [])
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    userAddress: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active = '1' and is_deleted = '0'", (err, result) => {
            if (!err) {
                if (result.length > 0) {
                    if (request.address_type !== '' && request.address_type !== undefined) {
                        database.query("select * from tbl_user_address where address_type = '" + request.address_type + "' and user_id = '" + request.user_id + "' and is_deleted = '0'", (error, address) => {
                            if (!error) {
                                if (address.length > 0) {
                                    callback('1', { keyword: 'success', content: {} }, address)
                                } else {
                                    callback('2', { keyword: 'no_data', content: {} }, [])
                                }
                            } else {
                                callback('0', { keyword: 'error_occurred', content: {} })
                            }
                        })
                    }
                    else {
                        database.query("select * from tbl_user_address where user_id = '" + request.user_id + "' and is_deleted = '0' order by id desc", (error, address) => {
                            if (!error) {
                                if (address.length > 0) {
                                    callback('1', { keyword: 'success', content: {} }, address)
                                } else {
                                    callback('2', { keyword: 'no_data', content: {} }, [])
                                }
                            } else {
                                callback('0', { keyword: 'error_occurred', content: {} })
                            }
                        })
                    }
                } else {
                    callback('2', { keyword: 'no_data', content: {} }, [])
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    manageAddress: (request, callback) => {

        if (request.type === 'add') {
            const insertObj = {}

            insertObj.user_id = request.user_id

            if (request.address_type !== '' && request.address_type !== undefined) {
                if (request.address_type.trim() !== '') {
                    insertObj.address_type = request.address_type
                }
            }
            if (request.house_name !== '' && request.house_name !== undefined) {
                if (request.house_name.trim() !== '') {
                    insertObj.house_name = request.house_name
                }
            }
            if (request.address !== '' && request.address !== undefined) {
                if (request.address.trim() !== '') {
                    insertObj.address = request.address
                }
            }
            if (request.street !== '' && request.street !== undefined) {
                if (request.street.trim() !== '') {
                    insertObj.street = request.street
                }
            }
            if (request.city !== '' && request.city !== undefined) {
                if (request.city.trim() !== '') {
                    insertObj.city = request.city
                }
            }
            if (request.state !== '' && request.state !== undefined) {
                if (request.state.trim() !== '') {
                    insertObj.state = request.state
                }
            }
            if (request.country !== '' && request.country !== undefined) {
                if (request.country.trim() !== '') {
                    insertObj.country = request.country
                }
            }
            if (request.zip_code !== '' && request.zip_code !== undefined) {
                if (request.zip_code.trim() !== '') {
                    insertObj.zip_code = request.zip_code
                }
            }
            if (request.latitude !== '' && request.latitude !== undefined) {
                if (request.latitude.trim() !== '') {
                    insertObj.latitude = request.latitude
                }
            }
            if (request.longitude !== '' && request.longitude !== undefined) {
                if (request.longitude.trim() !== '') {
                    insertObj.longitude = request.longitude
                }
            }

            database.query("insert into tbl_user_address set ?", insertObj, (err, inserted) => {
                if (!err && inserted.insertId) {
                    callback('1', { keyword: 'data_added', content: {} })
                } else {
                    callback('0', { keyword: 'error_occurred', content: {} })
                }
            })
        }
        else if (request.type === 'update') {
            database.query("select * from tbl_user_address where id = '" + request.address_id + "' and user_id = '" + request.user_id + "' and is_deleted = '0'", (error, address) => {
                if (!error) {
                    if (address.length > 0) {

                        let requestBody = {}

                        if (request.address_type !== '' && request.address_type !== undefined) {
                            if (request.address_type.trim() !== '') {
                                requestBody.address_type = request.address_type
                            }
                        }
                        if (request.house_name !== '' && request.house_name !== undefined) {
                            if (request.house_name.trim() !== '') {
                                requestBody.house_name = request.house_name
                            }
                        }
                        if (request.address !== '' && request.address !== undefined) {
                            if (request.address.trim() !== '') {
                                requestBody.address = request.address
                            }
                        }
                        if (request.street !== '' && request.street !== undefined) {
                            if (request.street.trim() !== '') {
                                requestBody.street = request.street
                            }
                        }
                        if (request.city !== '' && request.city !== undefined) {
                            if (request.city.trim() !== '') {
                                requestBody.city = request.city
                            }
                        }
                        if (request.state !== '' && request.state !== undefined) {
                            if (request.state.trim() !== '') {
                                requestBody.state = request.state
                            }
                        }
                        if (request.country !== '' && request.country !== undefined) {
                            if (request.country.trim() !== '') {
                                requestBody.country = request.country
                            }
                        }
                        if (request.zip_code !== '' && request.zip_code !== undefined) {
                            if (request.zip_code.trim() !== '') {
                                requestBody.zip_code = request.zip_code
                            }
                        }
                        if (request.latitude !== '' && request.latitude !== undefined) {
                            if (request.latitude.trim() !== '') {
                                requestBody.latitude = request.latitude
                            }
                        }
                        if (request.longitude !== '' && request.longitude !== undefined) {
                            if (request.longitude.trim() !== '') {
                                requestBody.longitude = request.longitude
                            }
                        }

                        if (Object.keys(requestBody).length > 0) {
                            database.query("update tbl_user_address set ? where id = '" + request.address_id + "' ", requestBody, (err, updated) => {
                                if (!err) {
                                    if (updated) {
                                        callback('1', { keyword: 'data_updated', content: {} })
                                    } else {
                                        callback('2', { keyword: 'not_saved', content: {} })
                                    }
                                } else {
                                    callback('0', { keyword: 'error_occurred', content: {} })
                                }
                            })
                        }
                        else {
                            callback('1', { keyword: 'data_updated', content: {} })
                        }
                    } else {
                        callback('2', { keyword: 'no_data', content: {} }, [])
                    }
                } else {
                    callback('0', { keyword: 'error_occurred', content: {} })
                }
            })
        }
        else {
            database.query("select * from tbl_user_address where id = '" + request.address_id + "' and user_id = '" + request.user_id + "' and is_deleted = '0'", (error, address) => {
                if (!error) {
                    if (address.length > 0) {
                        database.query("update tbl_user_address set is_deleted = '1' where id = '" + request.address_id + "' ", (err, deleted) => {
                            if (!err && deleted) {
                                callback('1', { keyword: 'deleted', content: {} })
                            } else {
                                callback('0', { keyword: 'error_occurred', content: {} })
                            }
                        })
                    } else {
                        callback('2', { keyword: 'no_data', content: {} }, [])
                    }
                } else {
                    callback('0', { keyword: 'error_occurred', content: {} })
                }
            })
        }
    },


    contactUs: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active = '1' and is_deleted = '0'", (err, user) => {
            if (!err) {
                if (user.length > 0) {
                    let requestBody = {
                        user_id: request.user_id,
                        first_name: request.first_name,
                        last_name: request.last_name,
                        email: request.email,
                        subject: request.subject,
                        description: request.description,
                    }
                    database.query("insert into tbl_contact set ?", requestBody, (error, inserted) => {
                        if (!error && inserted.insertId) {
                            callback('1', { keyword: 'contact_us_success', content: {} })
                        } else {
                            callback('0', { keyword: 'error_occurred', content: {} })
                        }
                    })
                } else {
                    callback('2', { keyword: 'no_data', content: {} }, [])
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    userNotification: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active = '1' and is_deleted = '0'", (err, result) => {
            if (!err) {
                if (result.length > 0) {
                    database.query("select * from tbl_notification where user_id = '" + request.user_id + "' and is_deleted = '0' group by user_id", (error, notes) => {
                        if (!error) {
                            if (notes.length > 0) {
                                callback('1', { keyword: 'success', content: {} }, notes)
                            } else {
                                callback('2', { keyword: 'no_data', content: {} }, [])
                            }
                        } else {
                            callback('0', { keyword: 'error_occurred', content: {} })
                        }
                    })
                } else {
                    callback('2', { keyword: 'no_data', content: {} }, [])
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    clearNotification: (request, callback) => {
        if (request.notification_id !== '' && request.notification_id !== undefined) {
            database.query("select * from tbl_notification where user_id = '" + request.user_id + "' and id = '" + request.notification_id + "' and is_deleted = '0'", (err, notify) => {
                if (!err) {
                    if (notify.length > 0) {
                        database.query("update tbl_notification set is_deleted = '1' where user_id = '" + request.user_id + "' and id = '" + request.notification_id + "'", (err, updated) => {
                            if (!err && updated) {
                                callback('1', { keyword: 'clear_notification', content: {} })
                            } else {
                                callback('0', { keyword: 'error_occurred', content: {} })
                            }
                        })
                    } else {
                        callback('2', { keyword: 'no_data', content: {} }, [])
                    }
                } else {
                    callback('0', { keyword: 'error_occurred', content: {} })
                }
            })
        } else {
            database.query("select * from tbl_notification where user_id = '" + request.user_id + "' and is_deleted = '0'", (err, notify) => {
                if (!err) {
                    if (notify.length > 0) {
                        database.query("update tbl_notification set is_deleted = '1' where user_id = '" + request.user_id + "'", (err, updated) => {
                            if (!err && updated) {
                                callback('1', { keyword: 'clear_notification', content: {} })
                            } else {
                                callback('0', { keyword: 'error_occurred', content: {} })
                            }
                        })
                    } else {
                        callback('2', { keyword: 'no_data', content: {} }, [])
                    }
                } else {
                    callback('0', { keyword: 'error_occurred', content: {} })
                }
            })
        }
    },


    userWishlist: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active = '1' and is_deleted = '0'", (err, result) => {
            if (!err) {
                if (result.length > 0) {
                    database.query("select * from tbl_wishlist where user_id = '" + request.user_id + "' and is_deleted = '0' order by id desc", (error, wishlist) => {
                        if (!error) {
                            if (wishlist.length > 0) {
                                callback('1', { keyword: 'success', content: {} }, wishlist)
                            } else {
                                callback('2', { keyword: 'no_data', content: {} }, [])
                            }
                        } else {
                            callback('0', { keyword: 'error_occurred', content: {} })
                        }
                    })
                } else {
                    callback('2', { keyword: 'no_data', content: {} }, [])
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    addRemoveWishlist: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active = '1' and is_deleted = '0'", (err, result) => {
            if (!err) {
                if (result.length > 0) {
                    database.query("select * from tbl_product where id = '" + request.product_id + "' and is_deleted = '0'", (error, prod) => {
                        if (!error) {
                            if (prod.length > 0) {

                                database.query("select * from tbl_wishlist where product_id = '" + request.product_id + "' and user_id = '" + request.user_id + "'", (error, wishlist) => {
                                    if (!error) {
                                        if (wishlist.length > 0) {
                                            if (wishlist[0].is_deleted === 0) {
                                                database.query("update tbl_wishlist set is_deleted = '1' where user_id = '" + request.user_id + "'", (err, isUpdated) => {
                                                    if (!err && isUpdated) {
                                                        callback('1', { keyword: 'data_removed', content: {} })
                                                    } else {
                                                        callback('0', { keyword: 'error_occurred', content: {} })
                                                    }
                                                })
                                            } else {
                                                database.query("update tbl_wishlist set is_deleted = '0' where user_id = '" + request.user_id + "'", (err, isUpdated) => {
                                                    if (!err && isUpdated) {
                                                        callback('1', { keyword: 'data_added', content: {} })
                                                    } else {
                                                        callback('0', { keyword: 'error_occurred', content: {} })
                                                    }
                                                })
                                            }
                                        } else {

                                            let requestBody = {
                                                user_id: request.user_id,
                                                product_id: request.product_id
                                            }

                                            database.query("insert into tbl_wishlist set ?", requestBody, (err, isAdded) => {
                                                if (!err && isAdded.insertId) {
                                                    callback('1', { keyword: 'data_added', content: {} })
                                                } else {
                                                    callback('0', { keyword: 'error_occurred', content: {} })
                                                }
                                            })
                                        }
                                    } else {
                                        callback('0', { keyword: 'error_occurred', content: {} })
                                    }
                                })
                            } else {
                                callback('2', { keyword: 'no_data', content: {} }, [])
                            }
                        } else {
                            callback('0', { keyword: 'error_occurred', content: {} })
                        }
                    })
                } else {
                    callback('2', { keyword: 'no_data', content: {} }, [])
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    addRemoveLike: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active = '1' and is_deleted = '0'", (err, result) => {
            if (!err) {
                if (result.length > 0) {
                    database.query("select * from tbl_shop where id = '" + request.shop_id + "' and is_deleted = '0'", (error, prod) => {
                        if (!error) {
                            if (prod.length > 0) {

                                database.query("select * from tbl_like where shop_id = '" + request.shop_id + "' and user_id = '" + request.user_id + "'", (error, wishlist) => {
                                    if (!error) {
                                        if (wishlist.length > 0) {
                                            if (wishlist[0].is_deleted === 0) {
                                                database.query("update tbl_like set is_deleted = '1' where user_id = '" + request.user_id + "'", (err, isUpdated) => {
                                                    if (!err && isUpdated) {
                                                        callback('1', { keyword: 'data_removed', content: {} })
                                                    } else {
                                                        callback('0', { keyword: 'error_occurred', content: {} })
                                                    }
                                                })
                                            } else {
                                                database.query("update tbl_like set is_deleted = '0' where user_id = '" + request.user_id + "'", (err, isUpdated) => {
                                                    if (!err && isUpdated) {
                                                        callback('1', { keyword: 'data_added', content: {} })
                                                    } else {
                                                        callback('0', { keyword: 'error_occurred', content: {} })
                                                    }
                                                })
                                            }
                                        } else {

                                            let requestBody = {
                                                user_id: request.user_id,
                                                shop_id: request.shop_id
                                            }

                                            database.query("insert into tbl_like set ?", requestBody, (err, isAdded) => {
                                                if (!err && isAdded.insertId) {
                                                    callback('1', { keyword: 'data_added', content: {} })
                                                } else {
                                                    callback('0', { keyword: 'error_occurred', content: {} })
                                                }
                                            })
                                        }
                                    } else {
                                        callback('0', { keyword: 'error_occurred', content: {} })
                                    }
                                })
                            } else {
                                callback('2', { keyword: 'no_data', content: {} }, [])
                            }
                        } else {
                            callback('0', { keyword: 'error_occurred', content: {} })
                        }
                    })
                } else {
                    callback('2', { keyword: 'no_data', content: {} }, [])
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    rate_Review_ShopByUser: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active = '1' and is_deleted = '0'", (err, result) => {
            if (!err) {
                if (result.length > 0) {
                    database.query("select * from tbl_shop where id = '" + request.shop_id + "' and is_deleted = '0'", (errors, shop) => {
                        if (!errors) {
                            if (shop.length > 0) {
                                database.query("select * from tbl_rating_review where shop_id = '" + request.shop_id + "' and user_id = '" + request.user_id + "' and is_deleted = '0'", (err, isReview) => {
                                    if (!err) {

                                        if (request.rating !== '' && request.rating !== undefined) {
                                            if (request.rating.trim() !== '') {
                                                request.rating = request.rating
                                            }
                                        }
                                        if (request.review !== '' && request.review !== undefined) {
                                            if (request.review.trim() !== '') {
                                                request.review = request.review
                                            }
                                        }

                                        if (isReview.length > 0) {
                                            database.query("update tbl_user set rating = '" + request.rating + "' , review = '" + request.review + "' where shop_id = '" + request.shop_id + "' and user_id = '" + request.user_id + "'", (error, isUpdated) => {
                                                if (!error && isUpdated) {
                                                    callback('1', { keyword: 'data_added', content: {} })
                                                } else {
                                                    callback('0', { keyword: 'error_occurred', content: {} })
                                                }
                                            })
                                        } else {

                                            let requestBody = {}

                                            if (request.shop_id !== '' && request.shop_id !== undefined) {
                                                if (request.shop_id.trim() !== '') {
                                                    requestBody.shop_id = request.shop_id
                                                }
                                            }
                                            if (request.rating !== '' && request.rating !== undefined) {
                                                if (request.rating.trim() !== '') {
                                                    requestBody.rating = request.rating
                                                }
                                            }
                                            if (request.review !== '' && request.review !== undefined) {
                                                if (request.review.trim() !== '') {
                                                    requestBody.review = request.review
                                                }
                                            }

                                            database.query("insert into tbl_rating_review set ?", requestBody, (error, isAdded) => {
                                                if (!error && isAdded.insertId) {
                                                    callback('1', { keyword: 'data_added', content: {} })
                                                } else {
                                                    callback('0', { keyword: 'error_occurred', content: {} })
                                                }
                                            })
                                        }
                                    } else {
                                        callback('0', { keyword: 'error_occurred', content: {} })
                                    }
                                })
                            } else {
                                callback('2', { keyword: 'no_data', content: {} }, [])
                            }
                        } else {
                            callback('0', { keyword: 'error_occurred', content: {} })
                        }
                    })
                } else {
                    callback('2', { keyword: 'no_data', content: {} }, [])
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    walletAmount: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active = '1' and is_deleted = '0'", (err, result) => {
            if (!err) {
                if (result.length > 0) {
                    database.query("select * from tbl_user_wallet where user_id = '" + request.user_id + "' order by id desc", (error, wallet) => {
                        if (!error) {
                            if (wallet.length > 0) {
                                let totalAmount = 0;

                                asyncLoop(wallet, (item, next) => {
                                    totalAmount += item.earn_loyalty_amount;
                                    totalAmount -= item.redeemed_amount
                                    next()
                                }, () => {
                                    let finalObj = {
                                        wallet_details: wallet,
                                        totalAmount: totalAmount
                                    }

                                    callback('1', { keyword: 'success', content: {} }, finalObj)
                                })

                            } else {
                                callback('2', { keyword: 'no_data', content: {} }, [])
                            }
                        } else {
                            callback('0', { keyword: 'error_occurred', content: {} })
                        }
                    })
                } else {
                    callback('2', { keyword: 'no_data', content: {} }, [])
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    addCard: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active = '1' and is_deleted = '0'", (err, result) => {
            if (!err) {
                if (result.length > 0) {
                    if (request.is_saved !== '' && request.is_saved !== undefined) {
                        database.query("insert into tbl_user_card set ?", request, (error, inserted) => {
                            if (!error) {
                                if (inserted.insertId) {
                                    callback('1', { keyword: 'data_added', content: {} })
                                } else {
                                    callback('2', { keyword: 'no_data', content: {} }, [])
                                }
                            } else {
                                callback('0', { keyword: 'error_occurred', content: {} })
                            }
                        })
                    } else {
                        database.query("insert into tbl_user_card set ?", request, (error, inserted) => {
                            if (!error) {
                                if (inserted.insertId) {
                                    callback('1', { keyword: 'data_added', content: {} })
                                } else {
                                    callback('2', { keyword: 'no_data', content: {} }, [])
                                }
                            } else {
                                callback('0', { keyword: 'error_occurred', content: {} })
                            }
                        })
                    }
                } else {
                    callback('2', { keyword: 'no_data', content: {} }, [])
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    addToCart: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active = '1' and is_deleted = '0'", (err, result) => {
            if (!err) {
                if (result.length > 0) {
                    database.query("select * from tbl_shop where id = '" + request.shop_id + "' and is_deleted = '0'", (errors, shop) => {
                        if (!errors) {
                            if (shop.length > 0) {
                                database.query("select * from tbl_product where id = '" + request.product_id + "' and shop_id = '" + request.shop_id + "' and is_deleted = '0'", (error, prod) => {
                                    if (!error) {
                                        if (prod.length > 0) {
                                            database.query("select * from tbl_cart where user_id = '" + request.user_id + "' and product_id = '" + request.product_id + "'", (error, cartItem) => {
                                                if (!error) {
                                                    if (cartItem.length > 0) {
                                                        database.query("update tbl_cart set quantity = '" + (parseInt(cartItem[0].quantity) + parseInt(request.quantity)) + "', base_price = '" + prod[0].discounted_price + "' , total_price = '" + (parseInt(cartItem[0].total_price) + parseInt(request.quantity * prod[0].discounted_price)) + "' where product_id = '" + request.product_id + "'", (errors, updated) => {
                                                            if (!errors && updated) {
                                                                callback('1', { keyword: 'cart_updated', content: {} })
                                                            } else {
                                                                callback('0', { keyword: 'error_occurred', content: {} })
                                                            }
                                                        })
                                                    } else {
                                                        
                                                        let insertObj = {
                                                            user_id: request.user_id,
                                                            product_id: prod[0].id,
                                                            quantity: request.quantity,
                                                            base_price: prod[0].discounted_price,
                                                            total_price: (request.quantity * prod[0].discounted_price)
                                                        }

                                                        database.query("insert into tbl_cart set ?", insertObj, (err, inserted) => {
                                                            if (!err && inserted.insertId) {
                                                                callback('1', { keyword: 'cart_added', content: {} })
                                                            } else {
                                                                callback('0', { keyword: 'error_occurred', content: {} })
                                                            }
                                                        })
                                                    }
                                                } else {
                                                    callback('0', { keyword: 'error_occurred', content: {} })
                                                }
                                            })
                                        } else {
                                            callback('2', { keyword: 'no_data', content: {} }, [])
                                        }
                                    } else {
                                        callback('0', { keyword: 'error_occurred', content: {} })
                                    }
                                })
                            } else {
                                callback('2', { keyword: 'no_data', content: {} }, [])
                            }
                        } else {
                            callback('0', { keyword: 'error_occurred', content: {} })
                        }
                    })
                } else {
                    callback('2', { keyword: 'no_data', content: {} }, [])
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    cartDetail: (request, callback) => {
        database.query("select * from tbl_user where is_login = '1' and is_active = '1' and is_deleted = '0' and id = '" + request.user_id + "'", (err, user) => {
            if (!err) {
                if (user.length > 0) {
                    database.query("select * from tbl_cart where user_id = '" + request.user_id + "'", (err, cartDetail) => {
                        if (!err) {
                            if (cartDetail.length > 0) {
                                callback('1', { keyword: 'success', content: {} }, cartDetail)
                            } else {
                                callback('2', { keyword: 'no_data', content: {} }, [])
                            }
                        } else {
                            callback('0', { keyword: 'error_occurred', content: {} }, [])
                        }
                    })
                } else {
                    callback('2', { keyword: 'no_data', content: {} }, [])
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    deleteCart: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active = '1' and is_deleted = '0'", (err, result) => {
            if (!err) {
                if (result.length > 0) {
                    database.query("select * from tbl_cart where user_id = '" + request.user_id + "' and id = '" + request.cart_id + "'", (error, cartItem) => {
                        if (!error) {
                            if (cartItem.length > 0) {
                                database.query("delete from tbl_cart  where id = '" + request.cart_id + "'", (errors, deleted) => {
                                    if (!errors && deleted) {
                                        callback('1', { keyword: 'cart_deleted', content: {} })
                                    } else {
                                        callback('0', { keyword: 'error_occurred', content: {} })
                                    }
                                })
                            } else {
                                callback('2', { keyword: 'no_data', content: {} }, [])
                            }
                        } else {
                            callback('0', { keyword: 'error_occurred', content: {} })
                        }
                    })
                } else {
                    callback('2', { keyword: 'no_data', content: {} }, [])
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    // Changing.......-.-.-.-.-.-.-.-.-.-.-.-./////////////////////////////////////////////////////////////////
    // Assumption : Discount Amount is on Total Product Price here, total_sub_amount

    placeOrder: (request, callback) => {

        let orderObj = {
            user_id: request.user_id,
            order_no: commonFunction.generateUniqueOrderNumber(),
            order_status: 'pending',

            instruction: (request.instruction !== '' && request.instruction !== undefined) ? request.instruction : null,

            // -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-Address Management--.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-
            delivery_address_id: request.delivery_address_id !== '' && request.delivery_address_id !== undefined ? request.delivery_address_id : null,

            is_shipping_address: request.is_shipping_address !== '' && request.is_shipping_address !== undefined ? request.is_shipping_address : '0',

            shipping_address: request.shipping_address !== '' && request.shipping_address !== undefined ? request.shipping_address : null,

            shipping_latitude: request.shipping_latitude !== '' && request.shipping_latitude !== undefined ? request.shipping_latitude : null,

            shipping_longitude: request.shipping_longitude !== '' && request.shipping_longitude !== undefined ? request.shipping_longitude : null,
            // -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-Address Management--.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-

            wallet_amount: (request.wallet_amount !== '' && request.wallet_amount !== undefined) && request.wallet_amount,

            vat_amount: (request.vat_amount !== '' && request.vat_amount !== undefined) && request.vat_amount,

            delivery_charge: (request.delivery_charge !== '' && request.delivery_charge !== undefined) && request.delivery_charge,

            delivery_date: (request.delivery_date !== '' && request.delivery_date !== undefined) && request.delivery_date,

            promocode_id: (request.promocode_id !== '' && request.promocode_id !== undefined) && request.promocode_id,

            // payment_type: (request.payment_type !== '' && request.payment_type !== undefined) && request.payment_type,

            payment_status: 'not_paid',

            card_id: request.card_id !== '' && request.card_id !== undefined ? request.card_id : '0',

            // payment_id: request.payment_id,
            // merchant_transaction_id: request.merchant_transaction_id,
            // pg_transaction_id: request.pg_transaction_id,
        }

        // console.log("orderObj : ", orderObj)
        // -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.

        let priceObj = { total_quantity: 0, total_sub_amount: 0, total_gross_amount: 0, total_distance: 0 }

        if (orderObj.wallet_amount) {
            database.query("select * from tbl_user_wallet where user_id = '" + request.user_id + "'", (err, wallet) => {
                if (!err && wallet.length > 0) {

                    let totalAmount = 0;
                    let afterCalci = 0;

                    asyncLoop(wallet, (item, next) => {
                        totalAmount += item.earn_loyalty_amount;
                        totalAmount -= item.redeemed_amount
                        next()
                    }, () => {
                        afterCalci = totalAmount - orderObj.wallet_amount
                    })

                    // console.log("totalAmount : ", totalAmount)
                    // console.log("afterCalci : ", afterCalci)

                    if (afterCalci > 0) {
                        database.query('insert into tbl_order set ?', orderObj, (err, inserted) => {
                            if (!err && inserted.insertId) {

                                let order_id = inserted.insertId // Order Id

                                let productData = []

                                asyncLoop(request.cart_items, (item, next) => {
                                    database.query(`SELECT * FROM tbl_product WHERE id = '${item.product_id}' AND is_deleted = '0'`, (prodErr, productresult) => {
                                        if (!prodErr) {
                                            if (productresult.length > 0) {

                                                productData.push(productresult[0].shop_id)

                                                database.query(`SELECT * FROM tbl_cart WHERE user_id = '${request.user_id}' AND product_id = '${item.product_id}'`, (cartErr, cartdetails) => {
                                                    if (!cartErr) {
                                                        if (cartdetails.length > 0) {

                                                            let orderDetailsObj = {
                                                                order_id: order_id,
                                                                picker_id: '0',
                                                                product_id: item.product_id,
                                                                quantity: item.quantity,
                                                                base_price: productresult[0].discounted_price,
                                                                total_price: parseInt(item.quantity * productresult[0].discounted_price)
                                                            }

                                                            // console.log("orderDetailsObj  : ", orderDetailsObj)
                                                            priceObj.total_sub_amount += parseInt(orderDetailsObj.total_price);

                                                            priceObj.total_quantity += parseInt(item.quantity);

                                                            database.query('insert into tbl_order_details set ?', orderDetailsObj, (ordErr, ordInserted) => {
                                                                if (!ordErr && ordInserted.insertId) {
                                                                    // console.log("ordInserted.insertId : ", ordInserted.insertId)
                                                                    next()
                                                                } else {
                                                                    next();
                                                                }
                                                            });
                                                        } else {
                                                            next()
                                                        }
                                                    } else {
                                                        next()
                                                    }
                                                });
                                            } else {
                                                next();
                                            }
                                        } else {
                                            next()
                                        }
                                    });
                                }, () => {
                                    // console.log("productData : ", productData)

                                    if (productData.every(val => val === productData[0])) {
                                        database.query("select * from tbl_shop where id = '" + productData[0] + "' and is_deleted = '0'", (err, vendorShop) => {
                                            if (!err && vendorShop.length > 0) {
                                                database.query("update tbl_order set shop_id = '" + vendorShop[0].id + "', vendor_id = '" + vendorShop[0].vendor_id + "' where user_id = '" + request.user_id + "' and id = '" + order_id + "'")
                                            }
                                        })
                                    }

                                    priceObj.total_gross_amount = parseInt(priceObj.total_sub_amount + priceObj.total_gross_amount)

                                    let upOrder = {
                                        delivery_address_id: orderObj.delivery_address_id,
                                        is_shipping_address: orderObj.is_shipping_address,
                                        shipping_address: orderObj.shipping_address,
                                        shipping_latitude: orderObj.shipping_latitude,
                                        shipping_longitude: orderObj.shipping_longitude,
                                        instruction: orderObj.instruction,
                                        promocode_id: orderObj.promocode_id,
                                        delivery_charge: orderObj.delivery_charge,
                                        vat_amount: orderObj.vat_amount,
                                        delivery_date: orderObj.delivery_date,
                                    }

                                    if (upOrder.instruction) {
                                        database.query("update tbl_order set instruction = '" + upOrder.instruction + "' where id = '" + order_id + "'")
                                    }
                                    if (upOrder.delivery_address_id !== '' && upOrder.delivery_address_id !== undefined && upOrder.delivery_address_id !== null) {
                                        database.query("select * from tbl_user_address where user_id = '" + request.user_id + "' and id = '" + upOrder.delivery_address_id + "' and is_deleted = '0'", (addErr, addRes) => {
                                            if (!addErr && addRes.length > 0) {
                                                database.query("update tbl_order set delivery_address_id = '" + upOrder.delivery_address_id + "', delivery_address = '" + addRes[0].address + "', delivery_latitude = '" + addRes[0].latitude + "' , delivery_longitude = '" + addRes[0].longitude + "' where id = '" + order_id + "'")
                                            }
                                        })
                                        if (upOrder.is_shipping_address !== '' && upOrder.is_shipping_address !== undefined && upOrder.is_shipping_address !== null && upOrder.is_shipping_address === '1' && upOrder.delivery_address_id) {
                                            database.query("select * from tbl_user_address where user_id = '" + request.user_id + "' and id = '" + upOrder.delivery_address_id + "' and is_deleted = '0'", (addErr, addRes) => {
                                                if (!addErr && addRes.length > 0) {
                                                    database.query("update tbl_order set is_shipping_address = '" + upOrder.is_shipping_address + "', shipping_address = '" + addRes[0].address + "', shipping_latitude = '" + addRes[0].latitude + "' , shipping_longitude = '" + addRes[0].longitude + "' where id = '" + order_id + "'")
                                                }
                                            })
                                        }
                                    }
                                    if (upOrder.is_shipping_address !== '' && upOrder.is_shipping_address !== undefined && upOrder.is_shipping_address !== null && upOrder.is_shipping_address === '0') {
                                        database.query("update tbl_order set is_shipping_address = '0', shipping_address = '" + upOrder.shipping_address + "', shipping_latitude = '" + upOrder.shipping_latitude + "' , shipping_longitude = '" + upOrder.shipping_longitude + "' where id = '" + order_id + "'")
                                    }
                                    if (upOrder.vat_amount) {
                                        priceObj.total_gross_amount += parseInt(upOrder.vat_amount)

                                        database.query("update tbl_order set vat_amount = '" + upOrder.vat_amount + "' where id = '" + order_id + "'")
                                    }
                                    if (upOrder.delivery_charge) {
                                        priceObj.total_gross_amount += parseInt(upOrder.delivery_charge)

                                        database.query("update tbl_order set delivery_charge = '" + upOrder.delivery_charge + "' where id = '" + order_id + "'")
                                    }

                                    priceObj.total_gross_amount -= parseInt(orderObj.wallet_amount)

                                    if (upOrder.delivery_date) {
                                        database.query("update tbl_order set delivery_date = '" + upOrder.delivery_date + "' where id = '" + order_id + "'")
                                    }

                                    database.query("insert into tbl_user_wallet set user_id = '" + request.user_id + "', redeemed_amount = '" + orderObj.wallet_amount + "'", (err, inserted) => {
                                        if (!err && inserted.insertId) {
                                            database.query("update tbl_order set wallet_amount = '" + orderObj.wallet_amount + "' where id = '" + order_id + "'")
                                        }
                                    })

                                    let distanceQuery = "select round((6371 * acos(cos(radians(UA.latitude)) * cos(radians(S.latitude)) * cos(radians(S.longitude) - radians(UA.longitude)) + sin(radians(UA.latitude)) * sin(radians(S.latitude)))),2) as distance_in_km from tbl_user_address as UA inner join tbl_shop as S on S.id = '" + productData[0] + "' where S.id = '" + productData[0] + "' and UA.user_id = '" + request.user_id + "' and UA.id = '" + upOrder.delivery_address_id + "' and UA.is_deleted = '0'"

                                    database.query(distanceQuery, (err, user_shop) => {
                                        if (!err && user_shop.length > 0) {

                                            priceObj.total_distance += user_shop[0].distance_in_km

                                            database.query('update tbl_order set ? where user_id = "' + request.user_id + '" and id = "' + order_id + '"', priceObj, (error, updresult) => {
                                                if (!error && updresult) {

                                                    if (upOrder.promocode_id) {
                                                        database.query("select * from tbl_promocode where id = '" + upOrder.promocode_id + "' and is_deleted = '0'", (err, code) => {
                                                            if (!err && code.length > 0) {
                                                                if (code[0].discount_type === 'percentage') {
                                                                    let percentageDiscount = priceObj.total_sub_amount * (parseInt(code[0].discount_amount) / 100);

                                                                    priceObj.total_sub_amount -= percentageDiscount;

                                                                    // console.log("Updated percentage Value : ", priceObj.total_sub_amount)

                                                                    database.query("update tbl_order set promocode_id = '" + upOrder.promocode_id + "', promocode = '" + code[0].promo_code + "',  promocode_discount = '" + code[0].discount_amount + " %' , discount_amount = '" + percentageDiscount + "', total_sub_amount = '" + priceObj.total_sub_amount + "' where id = '" + order_id + "'")
                                                                } else {
                                                                    priceObj.total_sub_amount -= parseInt(code[0].discount_amount)

                                                                    // console.log("Updated Flat Value : ", priceObj.total_sub_amount)

                                                                    database.query("update tbl_order set promocode_id = '" + upOrder.promocode_id + "', promocode = '" + code[0].promo_code + "',  promocode_discount = '" + code[0].discount_amount + " off' , discount_amount = '" + code[0].discount_amount + "', total_sub_amount = '" + priceObj.total_sub_amount + "' where id = '" + order_id + "'")
                                                                }
                                                            }
                                                        })
                                                    }

                                                    // return callback('1', { keyword: 'order_success', content: {} })

                                                    database.query(`SELECT * FROM tbl_order WHERE id = '${order_id}' and user_id = '${request.user_id}'`, (ordErr, orderdetails) => {
                                                        if (!ordErr && orderdetails.length > 0) {
                                                            database.query('delete from tbl_cart where user_id = "' + request.user_id + '"', (delErr, deleted) => {
                                                                if (!delErr && deleted) {
                                                                    commonFunction.userOrder(request.user_id, (code, message, data) => {
                                                                        if (code === '1') {
                                                                            callback(code, { keyword: 'order_success', content: {} }, data)
                                                                        } else {
                                                                            callback(code, message, data)
                                                                        }
                                                                    })
                                                                } else {
                                                                    callback('0', { keyword: 'error_occurred', content: {} },);
                                                                }
                                                            });
                                                        } else {
                                                            callback('0', { keyword: 'error_occurred', content: {} },);
                                                        }
                                                    });
                                                } else {
                                                    callback('0', { keyword: 'error_occurred', content: {} },);
                                                }
                                            });
                                        }
                                        else {
                                            callback('0', { keyword: 'error_occurred', content: {} },);
                                        }
                                    })
                                });
                            }
                        });
                    } else {
                        callback('0', { keyword: 'low_amount', content: {} })
                    }
                }
            })
        }
        else {
            database.query('insert into tbl_order set ?', orderObj, (err, inserted) => {
                if (!err && inserted.insertId) {

                    let order_id = inserted.insertId // Order Id

                    let productData = []

                    asyncLoop(request.cart_items, (item, next) => {
                        database.query(`SELECT * FROM tbl_product WHERE id = '${item.product_id}' AND is_deleted = '0'`, (prodErr, productresult) => {
                            if (!prodErr) {
                                if (productresult.length > 0) {

                                    productData.push(productresult[0].shop_id)

                                    database.query(`SELECT * FROM tbl_cart WHERE user_id = '${request.user_id}' AND product_id = '${item.product_id}'`, (cartErr, cartdetails) => {
                                        if (!cartErr) {
                                            if (cartdetails.length > 0) {

                                                let orderDetailsObj = {
                                                    order_id: order_id,
                                                    picker_id: '0',
                                                    product_id: item.product_id,
                                                    quantity: item.quantity,
                                                    base_price: productresult[0].discounted_price,
                                                    total_price: parseInt(item.quantity * productresult[0].discounted_price)
                                                }

                                                // console.log("orderDetailsObj  : ", orderDetailsObj)
                                                priceObj.total_sub_amount += parseInt(orderDetailsObj.total_price);

                                                priceObj.total_quantity += parseInt(item.quantity);

                                                database.query('insert into tbl_order_details set ?', orderDetailsObj, (ordErr, ordInserted) => {
                                                    if (!ordErr && ordInserted.insertId) {
                                                        // console.log("ordInserted.insertId : ", ordInserted.insertId)
                                                        next()
                                                    } else {
                                                        next();
                                                    }
                                                });
                                            } else {
                                                next()
                                            }
                                        } else {
                                            next()
                                        }
                                    });
                                } else {
                                    next();
                                }
                            } else {
                                next()
                            }
                        });
                    }, () => {

                        let upOrder = {
                            delivery_address_id: orderObj.delivery_address_id,
                            is_shipping_address: orderObj.is_shipping_address,
                            shipping_address: orderObj.shipping_address,
                            shipping_latitude: orderObj.shipping_latitude,
                            shipping_longitude: orderObj.shipping_longitude,
                            instruction: orderObj.instruction,
                            promocode_id: orderObj.promocode_id,
                            delivery_charge: orderObj.delivery_charge,
                            vat_amount: orderObj.vat_amount,
                            delivery_date: orderObj.delivery_date,
                        }

                        // console.log("productData : ", productData)

                        let shopCondition = productData.every(val => val === productData[0])

                        if (shopCondition) {
                            database.query("select * from tbl_shop where id = '" + productData[0] + "' and is_deleted = '0'", (err, vendorShop) => {
                                if (!err && vendorShop.length > 0) {
                                    database.query("update tbl_order set shop_id = '" + vendorShop[0].id + "', vendor_id = '" + vendorShop[0].vendor_id + "' where user_id = '" + request.user_id + "' and id = '" + order_id + "'")
                                }
                            })
                        }

                        let final_total = parseInt(priceObj.total_sub_amount + priceObj.total_gross_amount)

                        priceObj.total_gross_amount = final_total

                        if (upOrder.instruction) {
                            database.query("update tbl_order set instruction = '" + upOrder.instruction + "' where id = '" + order_id + "'")
                        }

                        // round((6371 * acos(cos(radians(latitude)) * cos(radians('" + shopAddress[0].latitude + "')) * cos(radians('" + shopAddress[0].longitude + "') - radians(longitude)) + sin(radians(latitude)) * sin(radians('" + shopAddress[0].latitude + "')))),2) as distance_in_km

                        if (upOrder.delivery_address_id !== '' && upOrder.delivery_address_id !== undefined && upOrder.delivery_address_id !== null) {
                            database.query("select * from tbl_user_address where user_id = '" + request.user_id + "' and id = '" + upOrder.delivery_address_id + "' and is_deleted = '0'", (addErr, addRes) => {
                                if (!addErr && addRes.length > 0) {
                                    database.query("update tbl_order set delivery_address_id = '" + upOrder.delivery_address_id + "', delivery_address = '" + addRes[0].address + "', delivery_latitude = '" + addRes[0].latitude + "' , delivery_longitude = '" + addRes[0].longitude + "' where id = '" + order_id + "'")
                                }
                            })

                            if (upOrder.is_shipping_address !== '' && upOrder.is_shipping_address !== undefined && upOrder.is_shipping_address !== null && upOrder.is_shipping_address === '1' && upOrder.delivery_address_id) {
                                database.query("select * from tbl_user_address where user_id = '" + request.user_id + "' and id = '" + upOrder.delivery_address_id + "' and is_deleted = '0'", (addErr, addRes) => {
                                    if (!addErr && addRes.length > 0) {
                                        database.query("update tbl_order set is_shipping_address = '" + upOrder.is_shipping_address + "', shipping_address = '" + addRes[0].address + "', shipping_latitude = '" + addRes[0].latitude + "' , shipping_longitude = '" + addRes[0].longitude + "' where id = '" + order_id + "'")
                                    }
                                })
                            }
                        }

                        if (upOrder.is_shipping_address !== '' && upOrder.is_shipping_address !== undefined && upOrder.is_shipping_address !== null && upOrder.is_shipping_address === '0') {
                            database.query("update tbl_order set is_shipping_address = '0', shipping_address = '" + upOrder.shipping_address + "', shipping_latitude = '" + upOrder.shipping_latitude + "' , shipping_longitude = '" + upOrder.shipping_longitude + "' where id = '" + order_id + "'")
                        }

                        if (upOrder.vat_amount) {
                            priceObj.total_gross_amount += parseInt(upOrder.vat_amount)

                            database.query("update tbl_order set vat_amount = '" + upOrder.vat_amount + "' where id = '" + order_id + "'")
                        }

                        if (upOrder.delivery_charge) {
                            priceObj.total_gross_amount += parseInt(upOrder.delivery_charge)

                            database.query("update tbl_order set delivery_charge = '" + upOrder.delivery_charge + "' where id = '" + order_id + "'")
                        }

                        if (upOrder.delivery_date) {
                            database.query("update tbl_order set delivery_date = '" + upOrder.delivery_date + "' where id = '" + order_id + "'")
                        }

                        let distanceQuery = "select round((6371 * acos(cos(radians(UA.latitude)) * cos(radians(S.latitude)) * cos(radians(S.longitude) - radians(UA.longitude)) + sin(radians(UA.latitude)) * sin(radians(S.latitude)))),2) as distance_in_km from tbl_user_address as UA inner join tbl_shop as S on S.id = '" + productData[0] + "' where S.id = '" + productData[0] + "' and UA.user_id = '" + request.user_id + "' and UA.id = '" + upOrder.delivery_address_id + "' and UA.is_deleted = '0'"

                        database.query(distanceQuery, (err, user_shop) => {
                            if (!err && user_shop.length > 0) {

                                priceObj.total_distance += user_shop[0].distance_in_km

                                database.query('update tbl_order set ? where user_id = "' + request.user_id + '" and id = "' + order_id + '"', priceObj, (error, updresult) => {
                                    if (!error && updresult) {

                                        if (upOrder.promocode_id) {
                                            database.query("select * from tbl_promocode where id = '" + upOrder.promocode_id + "' and is_deleted = '0'", (err, code) => {
                                                if (!err && code.length > 0) {
                                                    if (code[0].discount_type === 'percentage') {

                                                        let percentageDiscount = priceObj.total_sub_amount * (parseInt(code[0].discount_amount) / 100);

                                                        // console.log("percentageDiscount : ", percentageDiscount)

                                                        priceObj.total_sub_amount -= percentageDiscount;

                                                        // console.log("Updated percentage Value : ", priceObj.total_sub_amount)

                                                        database.query("update tbl_order set promocode_id = '" + upOrder.promocode_id + "', promocode = '" + code[0].promo_code + "',  promocode_discount = '" + code[0].discount_amount + " %' , discount_amount = '" + percentageDiscount + "', total_sub_amount = '" +
                                                            priceObj.total_sub_amount + "' where id = '" + order_id + "'")

                                                    } else {
                                                        priceObj.total_sub_amount -= parseInt(code[0].discount_amount)

                                                        // console.log("Updated Flat Value : ", priceObj.total_sub_amount)

                                                        database.query("update tbl_order set promocode_id = '" + upOrder.promocode_id + "', promocode = '" + code[0].promo_code + "',  promocode_discount = '" + code[0].discount_amount + " off' , discount_amount = '" + code[0].discount_amount + "', total_sub_amount = '" + priceObj.total_sub_amount + "' where id = '" + order_id + "'")
                                                    }
                                                }
                                            })
                                        }

                                        // return callback('1', { keyword: 'order_success', content: {} })

                                        database.query(`SELECT * FROM tbl_order WHERE id = '${order_id}' and user_id = '${request.user_id}'`, (ordErr, fullOrder) => {
                                            if (!ordErr && fullOrder.length > 0) {
                                                database.query('delete from tbl_cart where user_id = "' + request.user_id + '"', (delErr, deleted) => {
                                                    if (!delErr && deleted) {
                                                        commonFunction.userOrder(request.user_id, (code, message, data) => {
                                                            if (code === '1') {
                                                                callback(code, { keyword: 'order_success', content: {} }, data)
                                                            } else {
                                                                callback(code, message, data)
                                                            }
                                                        })
                                                    } else {
                                                        callback('0', { keyword: 'error_occurred', content: {} },);
                                                    }
                                                });
                                            } else {
                                                callback('0', { keyword: 'error_occurred', content: {} },);
                                            }
                                        });

                                    } else {
                                        callback('0', { keyword: 'error_occurred', content: {} },);
                                    }
                                });
                            }
                            else {
                                callback('0', { keyword: 'error_occurred', content: {} },);
                            }
                        })
                    });

                } else {
                    callback('0', { keyword: 'error_occurred', content: {} },)
                }
            });
        }
    },


    cancelOrder: (request, callback) => {
        database.query("select * from tbl_order where id = '" + request.order_id + "' and is_deleted = '0'", (err, order) => {
            if (!err) {
                if (order.length > 0) {

                    const orderTime = new Date(order[0].insert_datetime);
                    const currentTime = new Date();

                    const timeDifference = currentTime - orderTime;
                    // console.log('timeDifference : ', timeDifference)

                    // Check if the current time is within 1 minute of insert_datetime
                    if (timeDifference <= 60000 && timeDifference >= 0) {
                        const updateQuery = `UPDATE tbl_order SET order_status = 'cancelled', cancel_reason = '${request.reason}', cancelled_by = 'user' WHERE id = '${request.order_id}'
                        `;

                        database.query(updateQuery, (updateError, updated) => {
                            if (!updateError && updated) {
                                callback('1', { keyword: 'order_cancel', content: {} });
                            } else {
                                callback('0', { keyword: 'error_occurred', content: {} });
                            }
                        });

                    } else {
                        callback('0', { keyword: 'too_late_to_cancel', content: {} });
                    }
                } else {
                    callback('2', { keyword: 'no_data', content: {} }, [])
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },


    orderDetail: (request, callback) => {
        if (request.order_no !== '' && request.order_no !== undefined) {
            database.query("select * from tbl_order where user_id = '" + request.user_id + "' and order_no = '" + request.order_no + "' and is_deleted = '0'", (err, orderDetail) => {
                if (!err) {
                    if (orderDetail.length > 0) {
                        database.query("select U.id as user_id, concat(U.first_name, ' ', U.last_name) as full_name, concat(U.country_code,' ', U.phone) as phone , concat(UA.house_name,' ',UA.address,' ',UA.street,' ',UA.city,' ',UA.state,' ',UA.country,' ',UA.zip_code) as delivery_address from tbl_user U left join tbl_user_address UA on UA.user_id  = U.id where UA.id = '" + orderDetail[0].delivery_address_id + "' and UA.is_deleted = '0' and U.id = '" + request.user_id + "'", (err, userData) => {
                            if (!err && userData.length > 0) {
                                commonFunction.vendorDetail(orderDetail[0].vendor_id, (code, message, data) => {
                                    orderDetail[0].userDetail = userData
                                    orderDetail[0].vendorShopDetail = data
                                    callback(code, message, orderDetail)
                                })
                            }
                        })
                    } else {
                        callback('2', { keyword: 'no_data', content: {} }, [])
                    }
                } else {
                    callback('0', { keyword: 'error_occurred', content: {} })
                }
            })
        }
        else if (request.order_id !== '' && request.order_id !== undefined) {
            database.query("select * from tbl_order where user_id = '" + request.user_id + "' and id = '" + request.order_id + "' and is_deleted = '0'", (err, orderDetail) => {
                if (!err) {
                    if (orderDetail.length > 0) {
                        database.query("select U.id as user_id, concat(U.first_name, ' ', U.last_name) as full_name, concat(U.country_code,' ', U.phone) as phone , concat(UA.house_name,' ',UA.address,' ',UA.street,' ',UA.city,' ',UA.state,' ',UA.country,' ',UA.zip_code) as delivery_address from tbl_user U left join tbl_user_address UA on UA.user_id  = U.id where UA.id = '" + orderDetail[0].delivery_address_id + "' and UA.is_deleted = '0' and U.id = '" + request.user_id + "'", (err, userData) => {
                            if (!err && userData.length > 0) {
                                commonFunction.vendorDetail(orderDetail[0].vendor_id, (code, message, data) => {
                                    orderDetail[0].userDetail = userData
                                    orderDetail[0].vendorShopDetail = data
                                    callback(code, message, orderDetail)
                                })
                            }
                        })
                    } else {
                        callback('2', { keyword: 'no_data', content: {} }, [])
                    }
                } else {
                    callback('0', { keyword: 'error_occurred', content: {} })
                }
            })
        }
        else {
            database.query("select * from tbl_order where user_id = '" + request.user_id + "' and is_deleted = '0'", (err, orderDetail) => {
                if (!err) {
                    if (orderDetail.length > 0) {
                        database.query("select U.id as user_id, concat(U.first_name, ' ', U.last_name) as full_name, concat(U.country_code,' ', U.phone) as phone , concat(UA.house_name,' ',UA.address,' ',UA.street,' ',UA.city,' ',UA.state,' ',UA.country,' ',UA.zip_code) as delivery_address from tbl_user U left join tbl_user_address UA on UA.user_id  = U.id where UA.id = '" + orderDetail[0].delivery_address_id + "' and UA.is_deleted = '0' and U.id = '" + request.user_id + "'", (err, userData) => {
                            if (!err && userData.length > 0) {
                                commonFunction.vendorDetail(orderDetail[0].vendor_id, (code, message, data) => {
                                    orderDetail[0].userDetail = userData
                                    orderDetail[0].vendorShopDetail = data
                                    callback(code, message, orderDetail)
                                })
                            }
                        })
                    } else {
                        callback('2', { keyword: 'no_data', content: {} }, [])
                    }
                } else {
                    callback('0', { keyword: 'error_occurred', content: {} })
                }
            })
        }
    },


}

module.exports = User