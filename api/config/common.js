const asyncLoop = require('node-async-loop');
let conn = require('../config/database');
const { v4: uuidv4 } = require("uuid");



let common = {

    // Send Email 
    send_email: (subject, to_email, message, callback) => {
        let transporter = require('nodemailer').createTransport(
            {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_ID,
                    pass: process.env.EMAIL_PASSWORD
                }
            }
        );

        let mailOptions = {
            from: process.env.EMAIL_ID,
            to: to_email,
            subject: subject,
            html: message
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                // console.log("Sending Email Error : ", err);
                callback(false);
            }
            else {
                // console.log("Success Email sent : ", info);
                callback(true);
            }
        });
    },

    // Generate Unique Numbers
    generateUniqueOrderNumber: function () {
        let uuid_split = uuidv4().split('-');
        return (uuid_split[0] + uuid_split[uuid_split.length - 1]).toUpperCase();
    },

    // Generate OTP
    genOtp: (length) => {
        var d = '0123456789';
        let otp = "";
        for (var i = 0; i < length; i++) {
            otp += d[Math.floor(Math.random() * 10)];
        }
        return otp;
    },

    // Generate Token
    genToken: (length) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    },

    // Update Token
    updateToken: (user_id, deviceDetails, callback) => {
        conn.query("select * from tbl_user_device where user_id = '" + user_id + "' and is_deleted = 0", (error, result) => {
            if (!error) {
                if (result.length > 0) {
                    conn.query("update tbl_user_device set ? where user_id = '" + user_id + "' and is_deleted = 0", [deviceDetails], (error, response) => {
                        callback('1', { keyword: 'data_saved', content: {} }, response);
                        // console.log("error updating response=-=-=-", error, response);
                    });
                }
                else {
                    conn.query("Insert into tbl_user_device set ?", [deviceDetails], (error, response) => {
                        callback('1', { keyword: 'success', content: {} }, response);
                        // console.log("error inserting  response=-=-=-", error, response);
                    });
                }
            }
            else {
                callback('0', { keyword: 'error_occurred', content: {} });
            }
        });
    },

    // User Details
    userDetails: (user_id, callback) => {
        conn.query("select U.id, U.role, U.first_name, U.last_name, concat(U.first_name,' ', U.last_name) as name, U.email, U.is_login, concat(DATE_FORMAT(U.insert_datetime, '%W, %M %e, %Y'),' at ', DATE_FORMAT(U.insert_datetime, '%h:%i %p')) as joined_on, IFNULL(UD.token, '') as token from tbl_user U left join tbl_user_device UD on UD.user_id = U.id where U.is_deleted = '0' and U.id = " + user_id + "", (error, result) => {
            if (!error) {
                if (result.length > 0) {
                    let userdata = result[0];
                    callback('1', { keyword: 'success', content: {} }, userdata);
                }
                else {
                    callback('2', { keyword: 'no_data', content: {} }, []);
                }
            }
            else {
                callback('0', { keyword: 'error_occurred', content: {} });
            }
        });
    },

    // Vendor Details
    vendorDetail: (user_id, callback) => {
        conn.query("select U.id as vendor_id, S.id as shop_id, concat(U.first_name,' ', U.last_name) as vendor_name, concat(U.country_code,' ', U.phone) as contact, S.name as shop_name, S.about as shop_about, S.address as shop_address, S.avg_rating as shop_avg_rating, S.total_review as shop_total_review from tbl_user U left join tbl_shop S on S.vendor_id = U.id where U.is_deleted = '0' and U.id = " + user_id + "", (error, result) => {
            if (!error) {
                if (result.length > 0) {

                    let userdata = result[0];
                    callback('1', { keyword: 'success', content: {} }, userdata);
                }
                else {
                    callback('2', { keyword: 'no_data', content: {} }, []);
                }
            }
            else {
                callback('0', { keyword: 'error_occurred', content: {} });
            }
        });
    },

    // Admin Details
    admin_details: (admin_id, callback) => {
        const userQuery = "select A.id, A.role, concat('https://savitabhabhi.s3.amazonaws.com/user/', A.profile_image) as profile_image, A.first_name, A.last_name, concat(A.first_name,' ', A.last_name) as name, A.email,  A.country_code, A.phone, A.is_login,  A.is_active, concat(DATE_FORMAT(A.insert_datetime, '%W, %M %e, %Y'),' at ', DATE_FORMAT(A.insert_datetime, '%h:%i %p')) as joined_on, ADS.token from tbl_admin A inner join tbl_admin_session ADS on ADS.admin_id = A.id where A.is_deleted = '0' and A.id = '" + admin_id + "' "

        conn.query(userQuery, (error, result) => {
            if (!error) {
                if (result.length > 0) {
                    let userdata = result[0];
                    callback('1', { keyword: 'success', content: {} }, userdata);
                }
                else {
                    callback('2', { keyword: 'no_data', content: {} }, []);
                }
            }
            else {
                callback('0', { keyword: 'error_occurred', content: {} });
            }
        });
    },

    // User List
    users_list: (user_id, callback) => {
        conn.query("select * from tbl_user where is_deleted = '0'", (error, result) => {
            if (!error) {
                if (result.length > 0) {
                    callback('1', { keyword: 'success', content: {} }, result);
                }
                else {
                    callback('2', { keyword: 'no_data', content: {} }, []);
                }
            }
            else {
                callback('0', { keyword: 'error_occurred', content: {} });
            }
        });
    },

    // User Order Detail
    userOrder: (user_id, callback) => {
        conn.query("select id, role, profile_image, concat(first_name,' ', last_name) as full_name, concat(country_code,' ', phone) as phone, email from tbl_user where is_login  = '1' and is_deleted = '0' and id = '" + user_id + "'", (error, result) => {
            if (!error) {
                if (result.length > 0) {
                    conn.query("select * from tbl_order where user_id = '" + user_id + "'", (ordErr, orderDet) => {
                        if (!ordErr) {
                            if (orderDet.length > 0) {
                                result[0].order_details = orderDet

                                callback('1', { keyword: 'success', content: {} }, result);
                            } else {
                                callback('2', { keyword: 'no_data', content: {} }, []);
                            }
                        } else {
                            callback('0', { keyword: 'error_occurred', content: {} });
                        }
                    })
                }
                else {
                    callback('2', { keyword: 'no_data', content: {} }, []);
                }
            }
            else {
                callback('0', { keyword: 'error_occurred', content: {} });
            }
        });
    },

    // Vendor List
    vendors_list: (user_id, callback) => {
        conn.query("select * from tbl_vendor where is_deleted = '0'", (error, result) => {
            if (!error) {
                if (result.length > 0) {
                    callback('1', { keyword: 'success', content: {} }, result);
                }
                else {
                    callback('2', { keyword: 'no_data', content: {} }, []);
                }
            }
            else {
                callback('0', { keyword: 'error_occurred', content: {} });
            }
        });
    },

    // Product List
    products_list: (request, callback) => {

        // console.log("request  : ", request)

        let Squery = "SELECT P.*, (SELECT BR.logo FROM tbl_brand BR WHERE BR.id = P.brand_id ) as brand_logo, (SELECT PT.product_type_id FROM tbl_product_type PT WHERE PT.product_id = P.id ) as prod_typeID, (SELECT UW.name FROM tbl_master_product_type UW WHERE UW.id = prod_typeID ) as prod_type , CASE WHEN (SELECT UW.id FROM tbl_wishlist UW WHERE UW.product_id = P.id AND UW.user_id = '" + request.user_id + "') THEN '1' ELSE '0' END as is_liked from tbl_product P"

        if (request.product_id !== '' && request.product_id !== undefined) {
            let condition = " where P.id = '" + request.product_id + "'"
            conn.query(Squery + condition, (error, result) => {
                if (!error) {
                    if (result.length > 0) {
                        asyncLoop(result, (item, next) => {
                            conn.query("select id, product_id, image from tbl_product_image where product_id = '" + item.id + "'", (err, image) => {
                                if (!err) {
                                    if (image) {
                                        item.images = image;
                                        next()
                                    }
                                    else {
                                        item.images = [];
                                        next();
                                    }
                                } else {
                                    next()
                                }
                            })
                        }, () => {
                            callback('1', { keyword: 'success', content: {} }, result);
                        })
                    }
                    else {
                        callback('2', { keyword: 'no_data', content: {} }, []);
                    }
                }
                else {
                    callback('0', { keyword: 'error_occurred', content: {} });
                }
            });
        }
        else if (request.sort !== '' && request.sort !== undefined) {
            if (request.sort === 'desc') {
                let condition = " order by P.price DESC "
                conn.query(Squery + condition, (error, result) => {
                    if (!error) {
                        if (result.length > 0) {
                            asyncLoop(result, (item, next) => {
                                conn.query("select id, product_id, image from tbl_product_image where product_id = '" + item.id + "'", (err, image) => {
                                    if (!err) {
                                        if (image) {
                                            item.images = image;
                                            next()
                                        }
                                        else {
                                            item.images = [];
                                            next();
                                        }
                                    } else {
                                        next()
                                    }
                                })
                            }, () => {
                                callback('1', { keyword: 'success', content: {} }, result);
                            })
                        }
                        else {
                            callback('2', { keyword: 'no_data', content: {} }, []);
                        }
                    }
                    else {
                        callback('0', { keyword: 'error_occurred', content: {} });
                    }
                });
            } else {
                let condition = " order by P.price ASC "
                conn.query(Squery + condition, (error, result) => {
                    if (!error) {
                        if (result.length > 0) {
                            asyncLoop(result, (item, next) => {
                                conn.query("select id, product_id, image from tbl_product_image where product_id = '" + item.id + "'", (err, image) => {
                                    if (!err) {
                                        if (image) {
                                            item.images = image;
                                            next()
                                        }
                                        else {
                                            item.images = [];
                                            next();
                                        }
                                    } else {
                                        next()
                                    }
                                })
                            }, () => {
                                callback('1', { keyword: 'success', content: {} }, result);
                            })
                        }
                        else {
                            callback('2', { keyword: 'no_data', content: {} }, []);
                        }
                    }
                    else {
                        callback('0', { keyword: 'error_occurred', content: {} });
                    }
                });
            }
        }
        else if (request.prod_type_id !== '' && request.prod_type_id !== undefined) {
            let condition = " HAVING prod_typeID = '" + request.prod_type_id + "' "
            conn.query(Squery + condition, (error, result) => {
                if (!error) {
                    if (result.length > 0) {
                        asyncLoop(result, (item, next) => {
                            conn.query("select id, product_id, image from tbl_product_image where product_id = '" + item.id + "'", (err, image) => {
                                if (!err) {
                                    if (image) {
                                        item.images = image;
                                        next()
                                    }
                                    else {
                                        item.images = [];
                                        next();
                                    }
                                } else {
                                    next()
                                }
                            })
                        }, () => {
                            callback('1', { keyword: 'success', content: {} }, result);
                        })
                    }
                    else {
                        callback('2', { keyword: 'no_data', content: {} }, []);
                    }
                }
                else {
                    callback('0', { keyword: 'error_occurred', content: {} });
                }
            });
        }
        else {
            conn.query(Squery, (error, result) => {
                if (!error) {
                    if (result.length > 0) {
                        asyncLoop(result, (item, next) => {
                            conn.query("select id, product_id, image from tbl_product_image where product_id = '" + item.id + "'", (err, image) => {
                                if (!err) {
                                    if (image) {
                                        item.images = image;
                                        next()
                                    }
                                    else {
                                        item.images = [];
                                        next();
                                    }
                                } else {
                                    next()
                                }
                            })
                        }, () => {
                            callback('1', { keyword: 'success', content: {} }, result);
                        })
                    }
                    else {
                        callback('2', { keyword: 'no_data', content: {} }, []);
                    }
                }
                else {
                    callback('0', { keyword: 'error_occurred', content: {} });
                }
            });
        }
    },

    // Distance Shop List
    d_shop_list: (request, callback) => {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        const today = new Date();
        const dayName = daysOfWeek[today.getDay()].toLowerCase();

        conn.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active = '1' and is_deleted = '0'", (err, isUser) => {
            if (!err) {
                if (isUser.length > 0) {
                    conn.query("select * from tbl_user_address where is_deleted = '0' and user_id = '" + request.user_id + "' and address_type = 'current'", (err, address) => {
                        if (!err && address.length > 0) {
                            if (request.category_id !== '' && request.category_id !== undefined) {
                                // console.log("category id    : ", request.category_id)
                                // qnC62ccjJMKcSDbcrVM5KCv8lKpJaKoaffgF7LS3Prs=

                                conn.query("select S.*, CASE WHEN EXISTS (SELECT OS.id FROM tbl_shop_timing OS WHERE OS.shop_id = S.id and OS.day = '" + dayName + "') THEN 'Yes' ELSE 'No' END as is_open, (SELECT concat(OS.open_time, ' - ', OS.close_time) FROM tbl_shop_timing OS WHERE OS.shop_id = S.id and OS.day = '" + dayName + "' limit 1)  as open_close_timing, (SELECT PI.image from tbl_shop_images PI where PI.shop_id = S.id order by S.id DESC limit 1) as shop_image, CASE WHEN EXISTS (SELECT UW.id FROM tbl_like UW WHERE UW.shop_id = S.id AND UW.user_id = '" + request.user_id + "') THEN '1' ELSE '0' END as is_liked, round((6371 * acos(cos(radians('" + address[0].latitude + "')) * cos(radians(latitude)) * cos(radians(longitude) - radians('" + address[0].longitude + "')) + sin(radians('" + address[0].latitude + "')) * sin(radians(latitude)))),2) as distance_in_km from tbl_shop S where S.is_deleted = '0' and S.category_id = '" + request.category_id + "' ORDER BY distance_in_km ASC", (err, result) => {
                                    if (!err) {
                                        if (result.length > 0) {
                                            asyncLoop(result, (item, next) => {
                                                let productType = [];
                                                let prodTypeIds = item.product_type_id.split(',');
                                                asyncLoop(prodTypeIds, (item2, next2) => {
                                                    conn.query("select id, name from tbl_master_product_type where id = '" + item2 + "'", (err, prod) => {
                                                        if (!err) {
                                                            if (prod.length > 0) {
                                                                productType.push(prod[0])
                                                                next2()
                                                            } else {
                                                                next2()
                                                            }
                                                        } else {
                                                            next2()
                                                        }
                                                    })
                                                }, () => {
                                                    item.productType = productType;
                                                    next();
                                                });
                                            }, () => {
                                                callback('1', { keyword: 'success', content: {} }, result)
                                            })
                                        } else {
                                            callback('2', { keyword: 'no_data', content: {} }, [])
                                        }
                                    } else {
                                        callback('0', { keyword: 'error_occurred', content: {} })
                                    }
                                })
                            }
                            else if (request.shop_id !== '' && request.shop_id !== undefined) {
                                // console.log("shop id    : ", request.shop_id)
                                // /33nceR6NPyPsCymkzjPaT056umZfdZehzYOEJqMMfI=

                                conn.query("select S.*, CASE WHEN EXISTS (SELECT OS.id FROM tbl_shop_timing OS WHERE OS.shop_id = S.id and OS.day = '" + dayName + "') THEN 'Yes' ELSE 'No' END as is_open, (SELECT concat(OS.open_time, ' - ', OS.close_time) FROM tbl_shop_timing OS WHERE OS.shop_id = S.id and OS.day = '" + dayName + "' limit 1)  as open_close_timing, (SELECT PI.image from tbl_shop_images PI where PI.shop_id = S.id order by S.id DESC limit 1) as shop_image, CASE WHEN EXISTS (SELECT UW.id FROM tbl_like UW WHERE UW.shop_id = S.id AND UW.user_id = '" + request.user_id + "') THEN '1' ELSE '0' END as is_liked, round((6371 * acos(cos(radians('" + address[0].latitude + "')) * cos(radians(latitude)) * cos(radians(longitude) - radians('" + address[0].longitude + "')) + sin(radians('" + address[0].latitude + "')) * sin(radians(latitude)))),2) as distance_in_km from tbl_shop S where S.is_deleted = '0' and S.id = '" + request.shop_id + "'", (err, result) => {
                                    if (!err) {
                                        if (result.length > 0) {
                                            asyncLoop(result, (item, next) => {
                                                let productType = [];
                                                let prodTypeIds = item.product_type_id.split(',');
                                                asyncLoop(prodTypeIds, (item2, next2) => {
                                                    conn.query("select id, name from tbl_master_product_type where id = '" + item2 + "'", (err, prod) => {
                                                        if (!err) {
                                                            if (prod.length > 0) {
                                                                productType.push(prod[0])
                                                                next2()
                                                            } else {
                                                                next2()
                                                            }
                                                        } else {
                                                            next2()
                                                        }
                                                    })
                                                }, () => {
                                                    item.productType = productType;
                                                    next();
                                                });
                                            }, () => {
                                                callback('1', { keyword: 'success', content: {} }, result)
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
                                conn.query("select S.*, CASE WHEN EXISTS (SELECT OS.id FROM tbl_shop_timing OS WHERE OS.shop_id = S.id and OS.day = '" + dayName + "') THEN 'Yes' ELSE 'No' END as is_open, (SELECT concat(OS.open_time, ' - ', OS.close_time) FROM tbl_shop_timing OS WHERE OS.shop_id = S.id and OS.day = '" + dayName + "' limit 1)  as open_close_timing, (SELECT PI.image from tbl_shop_images PI where PI.shop_id = S.id order by S.id DESC limit 1) as shop_image, CASE WHEN EXISTS (SELECT UW.id FROM tbl_like UW WHERE UW.shop_id = S.id AND UW.user_id = '" + request.user_id + "') THEN '1' ELSE '0' END as is_liked, round((6371 * acos(cos(radians('" + address[0].latitude + "')) * cos(radians(latitude)) * cos(radians(longitude) - radians('" + address[0].longitude + "')) + sin(radians('" + address[0].latitude + "')) * sin(radians(latitude)))),2) as distance_in_km from tbl_shop S where S.is_deleted = '0' ORDER BY distance_in_km ASC", (err, result) => {
                                    if (!err) {
                                        if (result.length > 0) {
                                            asyncLoop(result, (item, next) => {
                                                let productType = [];
                                                let prodTypeIds = item.product_type_id.split(',');
                                                asyncLoop(prodTypeIds, (item2, next2) => {
                                                    conn.query("select id, name from tbl_master_product_type where id = '" + item2 + "'", (err, prod) => {
                                                        if (!err) {
                                                            if (prod.length > 0) {
                                                                productType.push(prod[0])
                                                                next2()
                                                            } else {
                                                                next2()
                                                            }
                                                        } else {
                                                            next2()
                                                        }
                                                    })
                                                }, () => {
                                                    item.productType = productType;
                                                    next();
                                                });
                                            }, () => {
                                                callback('1', { keyword: 'success', content: {} }, result)
                                            })
                                        } else {
                                            callback('2', { keyword: 'no_data', content: {} }, [])
                                        }
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
    },

    // Shop List
    shop_list: (request, callback) => {

        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        const today = new Date();
        const dayName = daysOfWeek[today.getDay()].toLowerCase();

        conn.query("select S.*, CASE WHEN EXISTS (SELECT OS.id FROM tbl_shop_timing OS WHERE OS.shop_id = S.id and OS.day = '" + dayName + "') THEN 'Yes' ELSE 'No' END as is_open, (SELECT concat(OS.open_time, ' - ', OS.close_time) FROM tbl_shop_timing OS WHERE OS.shop_id = S.id and OS.day = '" + dayName + "' limit 1)  as open_close_timing, round((6371 * acos(cos(radians('" + request.latitude + "')) * cos(radians(latitude)) * cos(radians(longitude) - radians('" + request.longitude + "')) + sin(radians('" + request.latitude + "')) * sin(radians(latitude)))),2) as distance_in_km, (SELECT PI.image from tbl_shop_images PI where PI.shop_id = S.id limit 1) as shop_image from tbl_shop S where S.is_deleted = '0' and S.category_id = '" + request.category_id + "' ORDER BY distance_in_km ASC", (err, result) => {
            if (!err) {
                if (result.length > 0) {
                    asyncLoop(result, (item, next) => {
                        let productType = [];
                        let prodTypeIds = item.product_type_id.split(',');
                        asyncLoop(prodTypeIds, (item2, next2) => {
                            conn.query("select id, name from tbl_master_product_type where id = '" + item2 + "'", (err, prod) => {
                                if (!err) {
                                    if (prod.length > 0) {
                                        productType.push(prod[0])
                                        next2()
                                    } else {
                                        next2()
                                    }
                                } else {
                                    next2()
                                }
                            })
                        }, () => {
                            item.productType = productType;
                            next();
                        });
                    }, () => {
                        callback('1', { keyword: 'success', content: {} }, result)
                    })
                } else {
                    callback('2', { keyword: 'no_data', content: {} }, [])
                }
            } else {
                callback('0', { keyword: 'error_occurred', content: {} })
            }
        })
    },

    // Country List
    country_list: (user_id, callback) => {
        conn.query("select * from tbl_country where is_deleted = '0'", (error, result) => {
            if (!error) {
                if (result.length > 0) {
                    callback('1', { keyword: 'success', content: {} }, result);
                }
                else {
                    callback('2', { keyword: 'no_data', content: {} }, []);
                }
            }
            else {
                callback('0', { keyword: 'error_occurred', content: {} });
            }
        });
    },

    // Category List
    category_list: (user_id, callback) => {
        conn.query("select * from tbl_category where is_deleted = '0' order by id desc", (error, result) => {
            if (!error) {
                if (result.length > 0) {
                    callback('1', { keyword: 'success', content: {} }, result);
                }
                else {
                    callback('2', { keyword: 'no_data', content: {} }, []);
                }
            }
            else {
                callback('0', { keyword: 'error_occurred', content: {} });
            }
        });
    },

    // Unique Admin Email
    checkAdminEmail: (request, callback) => {
        conn.query("select * from tbl_admin where email = '" + request.email + "'", (error, result) => {
            if (!error) {
                if (result.length > 0) {
                    callback(true);
                }
                else {
                    callback(false);
                }
            }
            else {
                callback('0', { keyword: 'error_occurred', content: {} });
            }
        });
    },

    // Unique Admin Phone
    checkAdminPhone: (request, callback) => {
        conn.query("select * from tbl_admin where phone = '" + request.phone + "' ", (error, result) => {
            if (!error) {
                if (result.length > 0) {
                    callback(true);
                }
                else {
                    callback(false);
                }
            }
            else {
                callback('0', { keyword: 'error_occurred', content: {} });
            }
        });
    },

    // Unique User Email
    checkUserEmail: (request, callback) => {
        conn.query("select * from tbl_user where email = '" + request.email + "' ", (error, result) => {
            if (!error) {
                if (result.length > 0) {
                    callback(true);
                }
                else {
                    callback(false);
                }
            }
            else {
                callback('0', { keyword: 'error_occurred', content: {} });
            }
        });
    },

    // Unique User Phone
    checkUserPhone: (request, callback) => {
        conn.query("select * from tbl_user where phone = '" + request.phone + "' ", (error, result) => {
            if (!error) {
                if (result.length > 0) {
                    callback(true);
                }
                else {
                    callback(false);
                }
            }
            else {
                callback('0', { keyword: 'error_occurred', content: {} });
            }
        });
    },

    // Unique Vendor Email
    checkVendorEmail: (request, callback) => {
        conn.query("select * from tbl_vendor where vendor_email = '" + request.vendor_email + "' ", (error, result) => {
            if (!error) {
                if (result.length > 0) {
                    callback(true);
                }
                else {
                    callback(false);
                }
            }
            else {
                callback('0', { keyword: 'error_occurred', content: {} });
            }
        });
    },

    // Unique Vendor Phone
    checkVendorPhone: (request, callback) => {
        conn.query("select * from tbl_vendor where vendor_phone = '" + request.vendor_phone + "' ", (error, result) => {
            if (!error) {
                if (result.length > 0) {
                    callback(true);
                }
                else {
                    callback(false);
                }
            }
            else {
                callback('0', { keyword: 'error_occurred', content: {} });
            }
        });
    },

    // common CRUD Function

    /*
 ** Function to get single detail from table
 */
    common_Singleselect: function (query, callback) {
        conn.query(query, function (err, result) {
            // console.log('query : ', this.sql);
            if (!err && result.length > 0) {
                callback(result[0]);
            } else {
                if (err) {
                    console.log("Common single Select Error :- ", err);
                }
                callback(null);
            }
        });
    },

    /*
    ** Function to get multiple details from table
    */
    common_Multipleselect: function (query, callback) {
        conn.query(query, function (err, result) {
            // console.log('query : ', this.sql);
            if (!err && result.length > 0) {
                callback(result);
            } else {
                if (err) {
                    console.log("Common Multiple Select Error :- ", err);
                }
                callback(null);
            }
        });
    },

    /*
    ** Function to insert into table
    */
    common_insert: function (tabelname, insparam, callback) {
        conn.query(
            "INSERT INTO " + tabelname + " SET ?",
            insparam,
            function (err, result) {
                if (!err) {
                    callback(result.insertId);
                } else {
                    console.log("Common insert Error :- ", err);
                    callback(0);
                }
            }
        );
    },

    /*
    ** Function to update table details
    */
    common_update: function (tabelname, wherecon, updparam, callback) {
        conn.query(
            "UPDATE " + tabelname + " SET ? WHERE " + wherecon,
            updparam,
            function (err, result) {
                if (!err) {
                    callback(true);
                } else {
                    console.log("Common Update Error :- ", err);
                    callback(false);
                }
            }
        );
    },

}

module.exports = common;