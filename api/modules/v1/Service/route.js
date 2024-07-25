const path = require("path");
const multer = require("multer")
var express = require("express");
var middleware = require("../../../middleware/validation");
var service_module = require("./service_module");
const common = require("../../../config/common");
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


// Banner List
router.post("/banner_list", (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        service_module.bannerList(request, (code, message, data) => {
            middleware.send_response(req, res, code, message, data);
        })
    })
});

// Brand List
router.post("/brand_list", (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        service_module.brandList(request, (code, message, data) => {
            middleware.send_response(req, res, code, message, data);
        })
    })
});

// Reason List
router.post('/reason_list', (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        service_module.reasonList(request, (code, message, data) => {
            middleware.send_response(req, res, code, message, data)
        })
    })
})

// Category List
router.post("/category_list", (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        service_module.categoryList(request, (code, message, data) => {
            middleware.send_response(req, res, code, message, data);
        })
    })
});

// Product Category List
router.post('/product_type_list', (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        service_module.productTypeList(request, (code, message, data) => {
            middleware.send_response(req, res, code, message, data)
        })
    })
})

// Category Wise Shop List
router.post('/category_wise_shop', (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        service_module.categoryShopListing(request, (code, message, data) => {
            middleware.send_response(req, res, code, message, data)
        })
    })
})

// Product List
router.post("/product_list", (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        service_module.productList(request, (code, message, data) => {
            middleware.send_response(req, res, code, message, data);
        })
    })
});

// Normal Shop List
router.post('/shop_list', (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        common.d_shop_list(request, (code, message, data) => {
            middleware.send_response(req, res, code, message, data)
        })
    })
})

// Nearby Shop List
router.post('/nearby_shop_list', (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        service_module.nearbyShop(request, (code, message, data) => {
            middleware.send_response(req, res, code, message, data);
        })
    })
});

// Promo Code List
router.post('/promo_code_list', (req, res) => {
    middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id

        service_module.promoCodeList(request, (code, message, data) => {
            middleware.send_response(req, res, code, message, data)
        })
    })
})



module.exports = router