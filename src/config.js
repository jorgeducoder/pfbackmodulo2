import * as url from 'url';


const config = {
    APP_NAME: 'Appbemod2',
    //PORT: 5050,
    DIRNAME: url.fileURLToPath(new URL('.', import.meta.url)),
    // getter: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/uploads` },
   // MONGODB_URI: 'mongodb://127.0.0.1:27017/coder70190',
    // MONGODB_URI: 'mongodb+srv://coder70190:coder2024@cluster0.4qaobt3.mongodb.net/coder70190',
    SECRET: 'coder70190secret',  // mo tiene que ver con GH
    GITHUB_CLIENT_ID: 'Iv23liFB7EMCED1OFwwG',
    GITHUB_CLIENT_SECRET: '60c2d59d972f98b123246cab80cadd8a34caf9bf',
    GITHUB_CALLBACK_URL: 'http://localhost:8080/api/users/githubcallback'
};


export default config;
