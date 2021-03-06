const Twit = require("twit"); //Importamos la libreria de Twitter
const { FeedEmitter } = require("rss-emitter-ts"); //Libreria que escucha feeds
const rssConverter = require("rss-converter");
const fs = require("fs");
const cron = require("node-cron");
var config = require('./config.js'); //Importamos la configuracion de las credenciales de twitter desde el archivo config.js

const emitter = new FeedEmitter(); //Inicializa el lector de feeds


/**Configuración de parametros**/

const prob_rt = 50;
const prob_mg = 50;
const prob_follow = 50;
const min_followers = 50; //Minimo de seguidores para que interaccione con la cuenta

//Limite de acciones por dia
const mg_diarios = 50;
const rt_diarios = 20;
const follow_diarios = 10;

//Control de las acciones por dia actualmente
var mg_diarios_actuales = 0;
var rt_diarios_actuales = 0;
var follow_diarios_actuales = 0;

/**-Configuración de parametros**/

//Configuramos la API de Twitter, los datos estan en el .env
var T = new Twit(config);

/**Lista de feeds */

emitter.add({
  url: "https://www.essensworld.com/940123055",
  refresh: 20000,
  ignoreFirst: true
});

/**Mostrar las feeds**/
const allFeeds = emitter.list();
const feeds = allFeeds.map(feed => feed.url).join("\n");
console.log("Escuchando las feeds:\n" + feeds);
/**-Mostrar las feeds**/

/**-Lista de feeds */

/**Deteccion de nuevos post en las feeds añadidas**/
emitter.on("item:new", item => {
  const tweet = "🥇  " + item.title + " 👇🏻 " + item.link;
  console.log("Tweet publicado:\n" + tweet);
  //nuevo_tweet(tweet);
});
/**-Deteccion de nuevos post en las feeds añadidas**/

/**Publicación de post antiguos de nuestro blog**/

cron.schedule("30 30 12 * * *", () => {
  let obj = {};

  const blog_feed = "https://www.essensworld.com/940123055"; //Reemplazar por url de nuestro blog

  async function cantidad() {

    (async () => {
      let feed = await rssConverter.toJson(blog_feed);

      obj = feed.items;
    })();
    return true;
  }

  cantidad();

  (async () => {
    let feed = await rssConverter.toJson(blog_feed);
    const length = Object.keys(obj).length;
    const random = Math.floor(Math.random() * length + 0);

    const tweet =
      "👉🏻 " +
      feed.items[random].title +
      " #RecordandoPosts\n" +
      feed.items[random].link;

    console.log("Tweet publicado:\n" + tweet);

    nuevo_tweet(tweet);
  })();
});

/**-Publicación de post antiguos de nuestro blog**/

/**Reset de acciones diarias**/
cron.schedule("10 20 8 * * *", () => {
   mg_diarios_actuales = 0;
   rt_diarios_actuales = 0;
   follow_diarios_actuales = 0;
});


// Momento en el que el bot comienza a dar Like, Retweet y Follow según los hashtags siguientes:


console.log("Buscando tweets . . .");

const stream1 = T.stream("statuses/filter", { track: "#skincare" });
const stream2 = T.stream("statuses/filter", { track: "#beauty" });
const stream3 = T.stream("statuses/filter", { track: "#bodycare" });
const stream4 = T.stream("statuses/filter", { track: "#essens" });
const stream5 = T.stream("statuses/filter", { track: "#bodycream" });
const stream6 = T.stream("statuses/filter", { track: "#makeup" });
const stream7 = T.stream("statuses/filter", { track: "#naturalcosmetics" });
const stream8 = T.stream("statuses/filter", { track: "#crueltyfree" });

/** Me gusta a post de hastag/texto concreto **/

stream1.on("tweet", meGusta);
stream2.on("tweet", meGusta);
stream3.on("tweet", meGusta);
stream4.on("tweet", meGusta);
stream5.on("tweet", meGusta);
stream6.on("tweet", meGusta);
stream7.on("tweet", meGusta);
stream8.on("tweet", meGusta);


/** RT a post de hastag/texto concreto **/

stream1.on("tweet", reTweet);
stream2.on("tweet", reTweet);
stream3.on("tweet", reTweet);
stream4.on("tweet", reTweet);
stream5.on("tweet", reTweet);
stream6.on("tweet", reTweet);
stream7.on("tweet", reTweet);
stream8.on("tweet", reTweet);


/** Follow a post de hastag/texto concreto **/

stream1.on("tweet", seguirCuenta);
stream2.on("tweet", seguirCuenta);
stream3.on("tweet", seguirCuenta);
stream4.on("tweet", seguirCuenta);
stream5.on("tweet", seguirCuenta);
stream6.on("tweet", seguirCuenta);
stream7.on("tweet", seguirCuenta);
stream8.on("tweet", seguirCuenta);


// Funcion encargada de dar Me Gusta

function meGusta(tweet) {
    if (randomNumber() < prob_mg && tweet.user.followers_count>min_followers && (mg_diarios_actuales<mg_diarios) && tweet.entities.hashtags.length<3) {
      T.post("favorites/create", { id: tweet.id_str }, function(
        err,
        data,
        response
      ) {
        console.log("Me gusta dado a: @" + tweet.user.screen_name);
      });
      mg_diarios_actuales++;
      console.log("Hoy llevas "+mg_diarios_actuales+" me gusta dados.");
    }
  }

// Funcion encargada de dar Retweet

function reTweet(tweet) {
    if (randomNumber() < prob_rt && tweet.user.followers_count>min_followers*2 && (rt_diarios_actuales<rt_diarios) && tweet.entities.hashtags.length<3) {
      T.post("statuses/retweet/:id", { id: tweet.id_str }, function(
        err,
        data,
        response
      ) {
        console.log("RT dado a: @" + tweet.user.screen_name);
      });
      rt_diarios_actuales++;
      console.log("Hoy llevas "+rt_diarios_actuales+" RT gusta dados.");
    }
  }

// Funcion encargada de seguir a una cuenta

function seguirCuenta(tweet) {
    if (randomNumber() < prob_follow && tweet.user.followers_count>(min_followers/2) && (follow_diarios_actuales<follow_diarios) && tweet.entities.hashtags.length<3) {
      T.post(
        "friendships/create",
        { screen_name: tweet.user.screen_name },
        function(err, res) {
          if (err) {
            console.log(err);
          } else {
            console.log("Has seguido a: " + tweet.user.screen_name);
          }
        }
      );
      follow_diarios_actuales++;
      console.log("Hoy llevas "+follow_diarios_actuales+" cuentas seguidas.");
    }
  }

  function nuevo_tweet(texto) {
    var params = {
      status: texto
    };
    T.post("statuses/update", params, function(err, data, response) {
      console.log("Tweet publicado: "+data.text);
    });
  }

  function tweet_image(b64content, myMessage) {

    // Primero creamos el objeto media

    T.post("media/upload", { media_data: b64content }, function(
      err,
      data,
      response
    ) {
      console.log(err);
      var mediaIdStr = data.media_id_string;
      var meta_params = { media_id: mediaIdStr };

      T.post("media/metadata/create", meta_params, function(err, data, response) {
        if (!err) {

          // Adjuntamos el objeto media al tweet

          var params = { status: myMessage, media_ids: [mediaIdStr] };

          T.post("statuses/update", params, function(err, data, response) {
            console.log(data);
          });
        }
      });
    });
  }

  function randomNumber() {
    return Math.floor(Math.random() * 100 + 1);
  }
