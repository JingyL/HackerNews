"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList = new StoryList();

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
    storyList = await StoryList.getStories();
    $storiesLoadingMsg.remove();

    putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
    // console.debug("generateStoryMarkup", story);

    const hostName = story.getHostName();
    return $(`
      <li id="${story.storyId}">
      <span class="star"> &#9734;</span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

// get favorite stories list
function generateFavoriteMarkup(story) {
    const hostName = story.getHostName();
    return $(`
        <li id="${story.storyId}">
        <span class="star"> &#9734;</span>
          <a href="${story.url}" target="a_blank" class="story-link">
            ${story.title}
          </a>
          <small class="story-hostname">(${hostName})</small>
          <small class="story-author">by ${story.author}</small>
          <small class="story-user">posted by ${story.username}</small>
        </li>
      `);
}
/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
    console.debug("putStoriesOnPage");

    $allStoriesList.empty();

    // loop through all of our stories and generate HTML for them

    for (let story of storyList.stories) {
        const $story = generateStoryMarkup(story);
        $allStoriesList.append($story);
    }

    $allStoriesList.show();
}

//  get list of fav stories and put on page

async function putFavStoriesOnPage() {
    console.debug("putStorputFavStoriesOnPageiesOnPage");

    $favStories.empty();

    await checkForRememberedUser();
    if (currentUser) {
        let favstories = currentUser.favorites;
    for (let story of favstories){
        const $favstory = generateStoryMarkup(story);
        $favStories.append($favstory);
    }
    }
    $favStories.show();
    console.log($favStories);
}

// put submit stories on the api data and on html page
async function submitStories() {
    const title = document.querySelector('#author');
    const author = document.querySelector('#title');
    const url = document.querySelector('#url');
    // create new StoryList
    let storyInfo = {
        title: title.value,
        url: url.value,
        author: author.value,
    }
    await checkForRememberedUser();
    if (currentUser) {
        await storyList.addStory(currentUser, new Story(storyInfo));
    }
    await getAndShowStoriesOnStart();
}

// submit button function
$("#submitBtn").on("click", async function (e) {
    e.preventDefault();
    await submitStories();
    $('.submit-form').hide();

});

// like the stories
$body.on('click', ".star", async function (e) {
    e.preventDefault();
    e.target.className = "starChangeColor";
    let storyId = e.target.parentElement.getAttribute('id');
    await checkForRememberedUser();
    if (currentUser) {
        let user = new User(currentUser);
        await user.addFavorite(currentUser, storyId);
    }

})



$body.on("click","#favorites", async function (e) {
    e.preventDefault();
    await putFavStoriesOnPage();
    // $('.submit-form').hide();

});
