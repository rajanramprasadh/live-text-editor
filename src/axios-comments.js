import axios from 'axios';

const instance = axios.create({
    baseURL: "https://live-text-editor-comments.firebaseio.com/"
});

export default instance;