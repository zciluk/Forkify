import axios from 'axios'
import { key, proxy} from '../config';
export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {

        try {
            const string = `${proxy}https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`;
            const res = await axios(string);   
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients= res.data.recipe.ingredients;   
            
        } catch (error) {
            alert(error);
        }

        
    }

    calcTime() {
        // we need 15 min for each ingridient
        const numING = this.ingredients.length;
        const periods = Math.ceil(numING / 3);
        this.time = periods * 15;
    }

    calcServings() {
        this.servings = 4;    
    }

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoon', 'teaspoons', 'tsps', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g'];
        
        const newIngredients = this.ingredients.map(el => {
            // 1. Uniform units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });
            // 2. remove parentheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');
            
            // 3. Parse ingredients into count unit and ingredient
            const arrIng = ingredient.split(' ');
            
            let unitIndex = arrIng.findIndex(el2 => units.includes(el2));
           
            let objIng;
            if(unitIndex > 5) { unitIndex = -1 };
            if (unitIndex > -1 ) {
                // there is a unit
                const arrCount = arrIng.slice(0, unitIndex); // Ex. 3 1/2 cups, arrCount is [4, 1/2]
                let count;
                if (arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join("+"));
                }
                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                }
            } else if (parseInt(arrIng[0], 10)) {
                // There is no unit but first element is a number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            } 
            else if (unitIndex === -1 ) {
                // there is no unit and no number
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }


            return objIng;

        });
        this.ingredients = newIngredients;

    }

    updateServings(type) {
        // Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;
        // Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });
        this.servings = newServings;
    }
}
