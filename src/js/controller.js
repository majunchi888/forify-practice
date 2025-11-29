import * as model from './model.js'
import recipeView from './view/recipeView.js'
import searchView from './view/searchView.js'
import resultsView from './view/resultsView.js'
import paginationView from './view/paginationView.js'
import bookmarksView from './view/bookmarksView.js'
import addRecipeView from './view/addRecipeView.js'

import 'core-js/stable'
import 'regenerator-runtime/runtime'
import { MODAL_CLOSE_SEC } from './config.js'


const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1)

    if (!id) return

    recipeView.renderSpinner()
    //update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage())

    //updating bookmarks
    bookmarksView.update(model.state.bookmarks)

    //loading recipe
    await model.loadRecipe(id)

    // console.log(recipe);

    //rendering recipe
    recipeView.render(model.state.recipe)

  } catch (err) {
    recipeView.renderError()
    console.error(err);

  }
}

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner()

    //get search query
    const query = searchView.getQuery()
    if (!query) return

    //Load search results
    await model.loadSearchResults(query)

    //render results
    // resultsView.render(model.state.search.results)
    resultsView.render(model.getSearchResultsPage())

    //4 render initial pagination buttons
    paginationView.render(model.state.search)
  } catch (err) {
    recipeView.renderError()
  }
}

const controlPagination = function (goToPage) {
  //render new results
  resultsView.render(model.getSearchResultsPage(goToPage))

  //4 render new pagination buttons
  paginationView.render(model.state.search)

}

const controlServings = function (newServings) {
  // updata the recipe servings(in state)
  model.updateServings(newServings)

  //updata the recipe view 
  // recipeView.render(model.state.recipe)
  recipeView.update(model.state.recipe)
}

const controlAddBbookmark = function () {
  // 1 add/rempve bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe)
  else model.deleteBookmark(model.state.recipe.id)

  //updata recipe view
  recipeView.update(model.state.recipe)
  //render bookmarks
  bookmarksView.render(model.state.bookmarks)
}

const controlBbookmarks = function () {
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function (newRecipe) {
  try {
    //show loading spinner
    addRecipeView.renderSpinner()
    //upload the new recipe data
    await model.uploadRecipe(newRecipe)
    console.log(model.state.recipe);

    //render recipe
    recipeView.render(model.state.recipe)

    //success message
    addRecipeView.renderMessage()

    //render bookmark view
    bookmarksView.render(model.state.bookmarks)

    //change id in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`)

    //close form window
    setTimeout(() => {
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message)
  }

}

const clearAllBookmarks = function () {
  localStorage.clear()
}


const init = function () {
  bookmarksView.addHandlerRender(controlBbookmarks)
  recipeView.addHandlerRender(controlRecipes)
  recipeView.addHandlerUpdateServings(controlServings)
  recipeView.addHandlerAddBookmark(controlAddBbookmark)
  searchView.addHandlerSearch(controlSearchResults)
  paginationView.addHandlerClick(controlPagination)
  addRecipeView.addHandlerUpload(controlAddRecipe)
  console.log('Welcome!');

}
init()