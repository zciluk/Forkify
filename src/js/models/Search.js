import axios from 'axios';
import { key, proxy } from '../config';
export default class Search {
    constructor(query) {
        this.query = query;
    }
    
    // https://www.food2fork.com/api/search
    // 0e94920efdca774ef7c20e814a71c567

    async getResult(query) {
 
        try {
            const string = `${proxy}https://www.food2fork.com/api/search?key=${key}&q=${this.query}`;
            const res = await axios(string);    
            this.result = res.data.recipes;          
        } catch (error) {
            alert(error);
        }
    }

}

