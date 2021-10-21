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


async function generateMarkup(story) {
    // console.debug("generateStoryMarkup", story);

    const hostName = story.getHostName();
    let className = await addClassName(story);

    return $(`
      <li id="${story.storyId}">
      <span class="${className}"> &#9734;</span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

async function generateUserStoriesMarkup(story) {
    // console.debug("generateStoryMarkup", story);

    const hostName = story.getHostName();
    let className = await addClassName(story);
    
    return $(`
      <li id="${story.storyId}">
      <i class="fa fa-trash" aria-hidden="true" id="deleteBtn"></i>
      <span class="${className}"> &#9734;</span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

async function addClassName(story) {
    let favListId = await checkFav();
    let className;
    if (favListId.includes(story.storyId)) {
        className = "starChangeColor";
    } else {
        className = "star";
    }
    return className;
}

async function checkFav(){
    await checkForRememberedUser();
    if (currentUser) {
        let userFav = new User(currentUser).favorites;
        let favStoriesIds = [];
        for (let each of userFav) {
            favStoriesIds.push(each.storyId);   
        }
        return favStoriesIds;
    }
}

async function checkOwnStories(){
    await checkForRememberedUser();
    if (currentUser) {
        let ownstories = new User(currentUser).ownStories;
        console.log(ownstories)
        return ownstories;
    }
}


/** Gets list of stories/fav/ownerstories from server
 * generates their HTML, and puts on page. */

async function putStoriesOnPage() {
    console.debug("putStoriesOnPage");
    $allStoriesList.empty();
    $submitStories.hide();
    $favStories.hide();
    $userStories.hide();
    // loop through all of our stories and generate HTML for them
    for (let story of storyList.stories) {
        const $story = await generateMarkup(story);
        $allStoriesList.append($story);
    }
    $allStoriesList.show();
}

async function putFavStoriesOnPage() {
    console.debug("putStorputFavStoriesOnPageiesOnPage");

    $favStories.empty();
    await checkForRememberedUser();
    if (currentUser) {
        let favstories = currentUser.favorites;
        console.log("fav" + favstories)
    for (let story of favstories){
        const $favstory = await generateMarkup(story);
        $favStories.append($favstory);
    }
    }
    $favStories.show();
    console.log($favStories);
}


async function putUserStoriesOnPage() {
    console.debug("putStorputFavStoriesOnPageiesOnPage");

    $userStories.empty();

    await checkForRememberedUser();
    if (currentUser) {
        let userstories = currentUser.ownStories;
    for (let story of userstories){
        const $userstory = await generateUserStoriesMarkup(story);
        $userStories.append($userstory);
    }
    }
    $userStories.show();
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

// submit stories
$("#submitBtn").on("click", async function (e) {
    e.preventDefault();
    await submitStories();
    $submitStories.hide();
});

// delete stories

$body.on("click", "#deleteBtn", async function (e) {
    e.preventDefault();
    let storyId = e.target.parentElement.getAttribute("id");
    await checkForRememberedUser();
    if (currentUser) {
        await currentUser.deleteStory(storyId);;
        console.log(currentUser.ownStories);
    }
    console.log("delte");
    await putUserStoriesOnPage();
    // $submitStories.hide();

});

// like the stories
$body.on('click', ".star", async function (e) {
    e.preventDefault();
    let storyId = e.target.parentElement.getAttribute('id');
        e.target.className = "starChangeColor";
        await checkForRememberedUser();
        if (currentUser) {
            await currentUser.addFavorite(storyId);
            getAndShowStoriesOnStart()
            console.log("curr"+ currentUser.favorites);
        }
})


$body.on('click', ".starChangeColor", async function (e) {
    e.preventDefault();
    let storyId = e.target.parentElement.getAttribute('id');
    e.target.className = "star";
    await checkForRememberedUser();
    if (currentUser) {
        await currentUser.deleteFavorite(storyId);
        console.log(currentUser.favorites);
    }


})

// fav Nav click
$body.on("click","#favorites", async function (e) {
    e.preventDefault();
    await putFavStoriesOnPage();
    $allStoriesList.hide();
    $userStories.hide();
    $submitStories.hide();

});

// story Nav click
$body.on("click","#stories", async function (e) {
    e.preventDefault();
    await putUserStoriesOnPage();
    $allStoriesList.hide();
    $favStories.hide();
    $submitStories.hide();
});

