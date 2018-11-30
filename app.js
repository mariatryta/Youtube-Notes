// After loading Google APIs platform library we want to create (in index.html) we use the created gapi object to load the auth2 library
function handleClientLoad() {
    //init GoogleAuth object -> then you can call   gapi.auth2.GoogleAuth methods
    gapi.load('client:auth2', youtubeAPI.initClient);
    console.log('handle succesfull');
}

const iframeAPI = (function () {
    let player;
    return {
        loadIFrame: function () {
            const scriptTag = document.createElement('script');
            scriptTag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(scriptTag, firstScriptTag);
        },
        createPlayer: function () {
            player = new YT.Player('player', {
                height: '390',
                width: '640',
                videoId: 'M7lc1UVf-VE',
            });
        }

    };
})();

const youtubeAPI = (function () {
    let client_Id = config.CLIENT_ID;
    let discovery_Docs = config.DISCOVERY_DOCS;

    // Authorization scopes required by the API. If using multiple scopes,
    // separated them with spaces.
    const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';
    const authorizeButton = document.getElementById('authorize-button');
    const signoutButton = document.getElementById('signout-button');
    const searchInputs = document.getElementById('search-container');
    const video = document.getElementById('video-container');
    let playlist = "PLmzegTgwHDZ7ID1KJhBj6s0ZSSxU-uoRj";

    return {
        //When you initialize the GoogleAuth object, you configure the object with your OAuth 2.0 client ID and any additional options you want to specify. Then, if the user has already signed in, the GoogleAuth object restores the user's sign-in state from the previous session
        initClient: function () {
            gapi.client.init({
                discoveryDocs: discovery_Docs,
                clientId: client_Id,
                scope: SCOPES,
            }).then(() => {
                //Listen for changes in the current user's sign-in state.listen() passes true to this function when the user signs in, and false when the user signs out.
                gapi.auth2.getAuthInstance().isSignedIn.listen(youtubeAPI.updateSigninStatus);

                //true if the user is signed in, or false if the user is signed out or the GoogleAuth object isn't initialized.
                youtubeAPI.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
                
                //button listeners
                authorizeButton.onclick = youtubeAPI.handleAuthClick;
                signoutButton.onclick = youtubeAPI.handleSignoutClick;
            });
        },

        // updating the UI -> buttons
        updateSigninStatus: function (isSignedIn) {
            if (isSignedIn) {
                authorizeButton.style.display = 'none';
                signoutButton.style.display = 'block';
                video.style.display = 'block';
                searchInputs.style.display = 'block';
                youtubeAPI.getChannel();
                iframeAPI.createPlayer();

            } else {
                authorizeButton.style.display = 'inline-block';
                signoutButton.style.display = 'none';
                video.style.display = 'none';
                searchInputs.style.display = 'none';
            }
        },

        // When the user clicks Authorize, the gapi.auth2.getAuthInstance().signIn() function is called, which shows user a popup window to let user authorize. 
        handleAuthClick: function (e) {
            e.preventDefault();
            gapi.auth2.getAuthInstance().signIn();

        },

        handleSignoutClick: function (event) {
            gapi.auth2.getAuthInstance().signOut();
        },
        // make all functions into object and then available all variables in that object 
        getChannel: function () {
            gapi.client.youtube
                .channels
                .list({
                    mine: true,
                    part: "snippet"
                })
                .then(response => {
                    let channelInfo = response.result.items[0];
                    let channelId = channelInfo.id;
                    youtubeAPI.getPlaylist(channelId);
                })
                .catch(err => alert("load channel failed"));

        },

        getPlaylist: function (id) {
            gapi.client.youtube.playlists
                .list({
                    channelId: id,
                    part: 'snippet,contentDetails'
                })
                .then(response => {
                    let playlistList = response.result.items;
                    let playlistOne = playlistList[0].id;
                    youtubeAPI.getPlaylistVideos(playlistOne);
                })
                .catch(err => alert("failed: getplaylist"));
        },


        getPlaylistVideos: function (playlistId) {
            gapi.client.youtube.playlistItems
                .list({
                    playlistId: playlistId,
                    part: 'snippet',
                    maxResults: 10
                })
                .then(response => {
                    let videos = response;
                })
                .catch(err => alert("oops"));
        },

    };
})();

const app = (function (iframeAPI, youtubeAPI) {
    iframeAPI.loadIFrame();
    return {
        init: function () {
        }
    };

})(iframeAPI, youtubeAPI);
// init
app.init();