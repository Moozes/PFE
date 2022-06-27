const FormData = require('form-data')
const axios = require('axios')
const url = process.env.FLASK_URL

// async function uploadToFlask(file) {
//     const response = await axios.get(url+"/hello"); 
//     return response
// }
async function uploadToFlask(file) {
    const form = new FormData();
    form.append('image-for-prediction', file.buffer, file.originalname);
    
    const request_config = {
      headers: {
        ...form.getHeaders()
      }
    };
    const response = await axios.post(url, form, request_config); 
    return response
}

module.exports = uploadToFlask