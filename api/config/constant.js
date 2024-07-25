const GLOBALS = {
    
    APP_NAME: process.env.APP_NAME,

    API_KEY: process.env.API_KEY,

    API_PASSWORD: process.env.API_PASSWORD,

    BASE_URL: 'http://192.168.1.244:7890/moov_app/api/v1/',

    BASE_URL_WITHOUT_API: 'http://192.168.1.244:7890/',

    PORT_BASE_URL: 'http://192.168.1.244:7890/',

    BASE_URL_WITHOUT_PORT: 'http://192.168.1.244/',

    // BASE_URL: process.env.BASE_URL,
    // BASE_URL_WITHOUT_API: process.env.BASE_URL_WITHOUT_API,
    // PORT_BASE_URL: process.env.PORT_BASE_URL,
    // BASE_URL_WITHOUT_PORT: process.env.BASE_URL_WITHOUT_PORT,

    KEY: process.env.KEY,

    IV: process.env.IV,

    EMAIL_ID: process.env.EMAIL_ID,

    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,

    LOGO: 'NodeJs/Moov App/backend/api/public/images/app_icon.svg',
    
    ARROW_IMAGE: 'arrow-right.gif',

};

module.exports = GLOBALS;