const casual = require("casual");
const fetch = require("node-fetch");


// musics: {key: music}
var musics = {};

const get = async () => {
  if (Object.keys(musics).length === 0) {
    const url = 'https://shazam.p.rapidapi.com/songs/list-recommendations?key=484129036&locale=en-US';
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Host': 'shazam.p.rapidapi.com',
            'X-RapidAPI-Key': '577dc0b40bmsh6ea6fa79b9105aep161387jsn5ee36599a5f6'
        }
        };
    const message = await fetch(url, options);
    const m = await message.json();
    var template_musics = Object.values(m.tracks);
    for(var i=0; i < template_musics.length; i++){
        template_musics[i]["heart"] = false;
        musics[template_musics[i]["key"]] = template_musics[i];
    }
  }
  else{
    Object.keys(musics).forEach(function(key) {
        musics[key]["heart"] = false;
    });
  }
  return musics;
};

const userlist = async(user_list) =>{
    await get();
    for(var i = 0; i < user_list.length; i++){
        const music = user_list[i];
        musics[music]["heart"] = true;
    }
    return musics;
}

const get_user = async(user_list) =>{
    await userlist(user_list);
    var musics_for_user = {};
    for(var i = 0; i < user_list.length; i++){
        const music = user_list[i]; // key
        musics_for_user[music] = musics[music];
    }
    return musics_for_user;
}

const get_album = async(album) => {
    if (Object.keys(musics).length === 0) {
        await get();
    }
    return musics[album];
}

module.exports = {
  get,
  userlist,
  get_user,
  get_album,
};
