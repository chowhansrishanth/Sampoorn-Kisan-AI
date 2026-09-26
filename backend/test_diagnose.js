const axios = require('axios');
const FormData = require('form-data');
const form = new FormData();
form.append('filename', 'tomato_leaf.jpg');
axios.post('http://localhost:5000/api/disease/diagnose', form).then(res => console.log(res.data)).catch(err => console.log(err.response ? err.response.data : err.message));
