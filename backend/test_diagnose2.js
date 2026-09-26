const axios = require('axios');
async function test() {
    try {
        const formData = new FormData(); // Using global Node FormData
        formData.append("file", new Blob([""]), "potato_leaf.jpg");
        const pyRes = await axios.post("http://localhost:8000/diagnose/disease", formData, { timeout: 1500 });
        console.log(pyRes.data.disease_name);
    } catch(e) {
        console.error(e.message);
    }
}
test();
