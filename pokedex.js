"use strict";
        
if (process.argv.length != 3 || isNaN(process.argv[2])) {
    process.stdout.write("Usage pokedex.js portNumber");
    process.exit(1);
  }

const bodyParser = require("body-parser");
const express = require("express");
const http = require("http");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, './.env') }) 
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const portNum = Number(process.argv[2]);

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const db = process.env.MONGO_DB_NAME;
const collection = process.env.MONGO_COLLECTION;

const uri = `mongodb+srv://${userName}:${password}@cluster0.hppxahh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function insert(client, db, collection, newApplication) {
    await client.db(db).collection(collection).insertOne(newApplication);
}

async function getPokemon(client, db, collection) {
    let filter = {};
    const cursor = client.db(db)
    .collection(collection)
    .find(filter);

    return await cursor.toArray();
}

(async () => {
    await client.connect();

    app.set("views", path.resolve(__dirname, "templates"));
    app.set("view engine", "ejs");
    app.use(bodyParser.urlencoded({extended:false}));
    app.use(express.static(path.join(__dirname, "stylesheet")))
    app.use(express.static(path.join(__dirname, "images")))

    let pokemonList = [];
    let urls = [`https://pokeapi.co/api/v2/pokemon/1`, 
    `https://pokeapi.co/api/v2/pokemon/4`,
    `https://pokeapi.co/api/v2/pokemon/7`,
    `https://pokeapi.co/api/v2/pokemon/25`];
    
    urls.forEach(async elem => {
        const result = await fetch(elem);
        const {name, id, sprites, stats, types} = await result.json();
        pokemonList.push({
            name: name,
            id: id,
            hp: stats[0].base_stat,
            attack: stats[1].base_stat,
            defence: stats[2].base_stat,
            speed: stats[5].base_stat,
            image: sprites['front_default'],
            type: types.map(type => type.type.name).join(', ')
        });
    });

    app.get("/pickPokemon", (req, res) => {
        pokemonList.sort((a,b) => {return a.id - b.id});
        const port = `<form action="http://localhost:${portNum}/getPokemon" method="post">`;
        let pokemons = ``;
        pokemonList.forEach(elem => {
            pokemons += `<li><img src="${elem.image}"><h2>${elem.name}</h2><p>Type: ${elem.type}</p></li>`
        });
        const vars = {pokemons: pokemons, port: port};
        res.render("pickPokemon", vars);
    });

    app.get("/", async (req, res) => {
        let pick = ``;
        let pokemons = ``;
        let result = await getPokemon(client, db, collection);
        if (result.length === 0) {
            pokemons += `<p id="empty">Pokedex Is Empty</p>`;
            pick += `<a href="/pickPokemon" id="button-main">Pick Pokemon</a><br><br>`;
        } else {
            pokemons += `
                <div id="card">
                    <img id="card-image" src="${result[0].image}">
                    <h2 id="card-name">${result[0].name}</h2>
                    <hr id="card-line">
                    <p>Type: ${result[0].type}</p>
                    <p id="hp">Hp: ${result[0].hp}</p>
                    <p id="attack">Attack: ${result[0].attack}</p>
                    <p id="defence">Defence: ${result[0].defence}</p>
                    <p id="speed">Speed: ${result[0].speed}</p>
                </div>
            `;
        }

        const vars = {pokemons: pokemons, pick: pick};
        res.render("myPokedex", vars);
    });

    app.post("/getPokemon", async (req, res) => {
        let pokemons = ``;
        let characteristics = ``;
        let evolList = [];
        if (req.body.pick === "pikachu") {
            const pikachu = pokemonList[3];
            await insert(client, db, collection, pikachu);
            pokemons += `<li><img src="${pikachu.image}"><h2>${pikachu.name}</h2></li>`
            const result = await fetch("https://pokeapi.co/api/v2/pokemon/26");
            const {name, sprites} = await result.json();
            evolList.push({
                name: name,
                image: sprites['front_default']
            });

            characteristics += `<p id="hp">Hp: ${pikachu.hp}</p>
                                <p id="attack">Attack: ${pikachu.attack}</p>
                                <p id="defence">Defence: ${pikachu.defence}</p>
                                <p id="speed">Speed: ${pikachu.speed}</p>`;
        }   
        
        if (req.body.pick === "bulbasaur") {
            const bulbasaur = pokemonList[0];
            await insert(client, db, collection, bulbasaur);
            pokemons += `<li><img src="${bulbasaur.image}"><h2>${bulbasaur.name}</h2></li>`
            let result = await fetch("https://pokeapi.co/api/v2/pokemon/2");
            const first = await result.json();
            evolList.push({
                name: first.name,
                image: first.sprites['front_default']
            });

            result = await fetch("https://pokeapi.co/api/v2/pokemon/3");
            const second = await result.json();
            evolList.push({
                name: second.name,
                image: second.sprites['front_default']
            });
            characteristics += `<p id="hp">Hp: ${bulbasaur.hp}</p>
                                <p id="attack">Attack: ${bulbasaur.attack}</p>
                                <p id="defence">Defence: ${bulbasaur.defence}</p>
                                <p id="speed">Speed: ${bulbasaur.speed}</p>`;
        }

        if (req.body.pick === "charmander") {
            const charmander = pokemonList[1];
            await insert(client, db, collection, charmander);
            pokemons += `<li><img src="${charmander.image}"><h2>${charmander.name}</h2></li>`
            let result = await fetch("https://pokeapi.co/api/v2/pokemon/5");
            const first = await result.json();
            evolList.push({
                name: first.name,
                image: first.sprites['front_default']
            });

            result = await fetch("https://pokeapi.co/api/v2/pokemon/6");
            const second = await result.json();
            evolList.push({
                name: second.name,
                image: second.sprites['front_default']
            });
            characteristics += `<p id="hp">Hp: ${charmander.hp}</p>
                                <p id="attack">Attack: ${charmander.attack}</p>
                                <p id="defence">Defence: ${charmander.defence}</p>
                                <p id="speed">Speed: ${charmander.speed}</p>`;
        }

        if (req.body.pick === "squirtle") {
            const squirtle = pokemonList[2];
            await insert(client, db, collection, squirtle);
            pokemons += `<li><img src="${squirtle.image}"><h2>${squirtle.name}</h2></li>`
            let result = await fetch("https://pokeapi.co/api/v2/pokemon/8");
            const first = await result.json();
            evolList.push({
                name: first.name,
                image: first.sprites['front_default']
            });

            result = await fetch("https://pokeapi.co/api/v2/pokemon/9");
            const second = await result.json();
            evolList.push({
                name: second.name,
                image: second.sprites['front_default']
            });
            characteristics += `<p id="hp">Hp: ${squirtle.hp}</p>
                                <p id="attack">Attack: ${squirtle.attack}</p>
                                <p id="defence">Defence: ${squirtle.defence}</p>
                                <p id="speed">Speed: ${squirtle.speed}</p>`;
        }
        evolList.forEach(elem => {
            pokemons += `<li><img src="${elem.image}"><h2>${elem.name}</h2></li>`
        });
        const vars = {pokemons: pokemons, characteristics: characteristics};
        res.render("getPokemon", vars);
    });

    app.listen(portNum);
    let prompt = "Stop to shutdown the server: ";
    console.log(`Web server started and running at http://localhost:${portNum}`);
    process.stdin.setEncoding("utf8");
    process.stdout.write(prompt);
    process.stdin.on('readable', async () => {
        let input = process.stdin.read().trim();
        if (input === "stop") {
            process.stdout.write("Shutting down the server");
            await client.close();
            process.exit(0);
        } else {
            process.stdout.write(`Invalid command: ${input}\n`);
        }    
        process.stdout.write(prompt);
        process.stdin.resume();
    });
})();