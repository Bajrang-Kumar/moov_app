var database = require("../../../config/database");
var asyncLoop = require("node-async-loop");
var commonFunction = require("../../../config/common");
var GLOBALS = require("../../../config/constant");
const template = require("../../../config/template");



const Service = {

    bannerList: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active = '1' and is_deleted = '0'", (err, isUser) => {
            if (!err) {
                if (isUser.length > 0) {
                    database.query("select * from tbl_banner where is_deleted = '0' order by id desc", (err, result) => {
                        if (!err) {
                            if (result.length > 0) {
                                callback('1', { keyword: 'success', content: {} }, result)
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


    brandList: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active = '1' and is_deleted = '0'", (err, isUser) => {
            if (!err) {
                if (isUser.length > 0) {
                    database.query("select * from tbl_brand where is_deleted = '0' order by id desc", (err, result) => {
                        if (!err) {
                            if (result.length > 0) {
                                callback('1', { keyword: 'success', content: {} }, result)
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


    reasonList: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active = '1' and is_deleted = '0'", (err, isUser) => {
            if (!err) {
                if (isUser.length > 0) {
                    database.query("select * from tbl_reason where is_deleted = '0' order by id desc", (err, result) => {
                        if (!err) {
                            if (result.length > 0) {
                                callback('1', { keyword: 'success', content: {} }, result)
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


    productTypeList: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active = '1' and is_deleted = '0'", (err, isUser) => {
            if (!err) {
                if (isUser.length > 0) {
                    database.query("select * from tbl_master_product_type where is_deleted = '0'", (err, prodType) => {
                        if (!err) {
                            if (prodType.length > 0) {
                                callback('1', { keyword: 'success', content: {} }, prodType)
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


    categoryList: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active = '1' and is_deleted = '0'", (err, isUser) => {
            if (!err) {
                if (isUser.length > 0) {
                    commonFunction.category_list({}, (code, message, data) => {
                        if (data) {
                            callback(code, message, data)
                        } else {
                            callback(code, message, data)
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


    productList: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active = '1' and is_deleted = '0'", (err, isUser) => {
            if (!err) {
                if (isUser.length > 0) {
                    commonFunction.products_list(request, (code, message, data) => {
                        if (code === '1') {
                            callback(code, message, data)
                        } else {
                            callback(code, message, data)
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


    nearbyShop: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active = '1' and is_deleted = '0'", (err, isUser) => {
            if (!err) {
                if (isUser.length > 0) {
                    database.query("select * from tbl_user_address where is_deleted = '0' and user_id = '" + request.user_id + "' and address_type = 'current'", (err, address) => {
                        if (!err && address.length > 0) {
                            database.query("SELECT S.id, S.name, (SELECT PI.image from tbl_shop_images PI where PI.shop_id = S.id order by S.id DESC limit 1) as shop_image, CASE WHEN EXISTS (SELECT UW.id FROM tbl_like UW WHERE UW.shop_id = S.id AND UW.user_id = '" + request.user_id + "') THEN '1' ELSE '0' END as is_liked, round((6371 * acos(cos(radians('" + address[0].latitude + "')) * cos(radians(latitude)) * cos(radians(longitude) - radians('" + address[0].longitude + "')) + sin(radians('" + address[0].latitude + "')) * sin(radians(latitude)))),2) as distance_in_km , C.name as category FROM tbl_shop S inner join tbl_category C on C.id = S.category_id ORDER BY distance_in_km ASC", (err, nearby) => {
                                if (!err) {
                                    if (nearby.length > 0) {
                                        callback('1', { keyword: 'success', content: {} }, nearby)
                                    } else {
                                        callback('2', { keyword: 'no_data', content: {} }, [])
                                    }
                                } else {
                                    callback('0', { keyword: 'error_occurred', content: {} })
                                }
                            })
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


    categoryShopListing: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active = '1' and is_deleted = '0'", (err, isUser) => {
            if (!err) {
                if (isUser.length > 0) {
                    database.query("select * from tbl_user_address where user_id = '" + request.user_id + "' and address_type = 'current' and is_deleted = '0'", (err, address) => {
                        if (!err && address.length > 0) {
                            if (request.category_id !== '' && request.category_id !== undefined) {
                                database.query("select * from tbl_category where is_deleted = '0' and id = '" + request.category_id + "'", (error, cat) => {
                                    if (!error && cat.length > 0) {
                                        asyncLoop(cat, (item, next) => {
                                            let requestBody = { category_id: item.id, latitude: address[0].latitude, longitude: address[0].longitude }

                                            commonFunction.shop_list(requestBody, (code, message, data) => {
                                                if (code === '1') {
                                                    item.shopList = data
                                                    next()
                                                } else {
                                                    item.shopList = []
                                                    next()
                                                }
                                            })
                                        }, () => {
                                            callback('1', { keyword: 'success', components: {} }, cat);
                                        });
                                    } else {
                                        callback('0', { keyword: 'error_occurred', content: {} })
                                    }
                                })
                            }
                            else {
                                database.query("select * from tbl_category where is_deleted = '0'", (error, cat) => {
                                    if (!error && cat.length > 0) {
                                        asyncLoop(cat, (item, next) => {
                                            let requestBody = { category_id: item.id, latitude: address[0].latitude, longitude: address[0].longitude }

                                            commonFunction.shop_list(requestBody, (code, message, data) => {
                                                if (code === '1') {
                                                    item.shopList = data
                                                    next()
                                                } else {
                                                    item.shopList = []
                                                    next()
                                                }
                                            })
                                        }, () => {
                                            callback('1', { keyword: 'success', components: {} }, cat);
                                        });
                                    } else {
                                        callback('0', { keyword: 'error_occurred', content: {} })
                                    }
                                })
                            }
                        } else {
                            callback('2', { keyword: 'no_data', content: {} }, [])
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


    promoCodeList: (request, callback) => {
        database.query("select * from tbl_user where id = '" + request.user_id + "' and is_login = '1' and is_active = '1' and is_deleted = '0'", (err, isUser) => {
            if (!err) {
                if (isUser.length > 0) {
                    if (request.shop_id !== '' && request.shop_id !== undefined) {
                        database.query("select * from tbl_promocode where is_deleted = '0' and shop_id = '" + request.shop_id + "' order by id desc", (err, result) => {
                            if (!err) {
                                if (result.length > 0) {
                                    callback('1', { keyword: 'success', content: {} }, result)
                                } else {
                                    callback('2', { keyword: 'no_data', content: {} }, [])
                                }
                            } else {
                                callback('0', { keyword: 'error_occurred', content: {} })
                            }
                        })
                    } else {
                        database.query("select * from tbl_promocode where is_deleted = '0' order by id desc", (err, result) => {
                            if (!err) {
                                if (result.length > 0) {
                                    callback('1', { keyword: 'success', content: {} }, result)
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


    


}

module.exports = Service
