// Global app controller
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import { elements, renderLoader, clearLoader } from './views/base';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';

/* Global state of the app 
*- Search object
*- Current recipe object
*- shopping list object
* - liked recipes
*/
const state = {};
//SEARCH CONTROLLER
const controlSearch = async () => {
    // 1. Get query from the view
    const query = searchView.getInput(); //TODO
    if(query) {
        // 2.New search object and add the state
        state.search = new Search(query);

        // 3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResult();
        renderLoader(elements.searchRes);
        try {
        // 4. Search for recipes
        await state.search.getResult();

        // 5. render results on UI 
        clearLoader();
        searchView.renderResults(state.search.result);
        } catch (error) {
            alert("Error during reatriving search results");
            clearLoader();
        }
    }
}
elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResult();
        searchView.renderResults(state.search.result, goToPage);    
    }



});


//RECIPE CONTROLLER
const controlRecipe = async () => {
    const id = window.location.hash.replace('#', '');
    if(id) {
        //Prepae UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        // Highlight selected recipe 
        if(state.search)  searchView.highlightSelected(id); 
        
        // Create new recipe object
        state.recipe = new Recipe(id);
        try {
        // Get recipe data
        await state.recipe.getRecipe();
        
        // calculate servings and time
        state.recipe.calcTime();
        state.recipe.calcServings();
        
        // Render recipe
        state.recipe.parseIngredients();
        clearLoader();
        
        recipeView.rednerRecipe(
            state.recipe, 
            ((state.likes) && (state.likes.isLiked(id))) ? state.likes.isLiked(id) : false);
        } catch(error) {
            alert(error);
        }
    }
    
}
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

//LIst Controller
const controlList = () => {
    //create new list if there is none yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list 
    state.recipe.ingredients.forEach(el => {
         const item = state.list.addItem(el.count, el.unit, el.ingredient); 
         listView.renderItem(item);

    });
}

// Handle delete and update of list item elements
elements.shopping.addEventListener('click', e =>{
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        //delete from state
        state.list.deleteItem(id);
        // delete from UI
        listView.deleteItem(id);
        //update

    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});


// LIKE Controller

const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // user has not yet liked current recipe
    if(!state.likes.isLiked(currentID)) {
        // add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // toggle the like button
        likesView.toggleLikeBtn(true);
        // add like to UI list
        likesView.renderLike(newLike);

    // user has liked
    } else {
        // remove like 
        state.likes.deleteLike(currentID);
        // toggle the like button
        likesView.toggleLikeBtn(false);
        // remove like to UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());

}

//Restore like recipe on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    state.likes.readStorage();

    //toggle button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    //redner recipes in menu
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        if(state.recipe.servings > 1 ) {
        state.recipe.updateServings('dec');
        recipeView.updateServingsIngredients(state.recipe);
    }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
        
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping list
        controlList();

    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // like controller
        controlLike();
    }
    
});

