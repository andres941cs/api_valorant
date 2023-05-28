//Herramientas de scraping
const cheerio = require("cheerio");
const axios = require("axios");
//Herramientas de servidor
const express = require("express");

const app = express();

const url = "https://tracker.gg/valorant/insights/agents"; // Reemplaza con la URL de la página web que quieres escrapear

function Personaje(image, name, role, pickRate, WinRate) {
  this.image = image;
  this.name = name;
  this.role = role;
  this.pickRate = pickRate;
  this.WinRate = WinRate;
}
const Personajes = [];
dataApi = [];
axios
  .get(url)
  .then((response) => {
    const $ = cheerio.load(response.data);
    const elementos = $(".st-content__item--link"); // Seleccionar el elemento por su clase
    elementos.each((index, elemento) => {
      const imagen = $(elemento).find(".image img").attr("src");
      const nombre = $(elemento).find(".info .value").eq(0).text();
      const tipo = $(elemento).find(".info .label").eq(0).text();
      const pickRate = $(elemento).find(".info .value").eq(1).text();
      const WinRate = $(elemento).find(".info .value").eq(2).text();
      //console.log(imagen,nombre, tipo, pickRate, WinRate);
      const personaje = new Personaje(imagen, nombre, tipo, pickRate, WinRate);
      Personajes.push(personaje);
    });
    dataApi = Personajes.slice(0, 6);
    //console.log(data);
  })
  .catch((error) => {
    console.log(error);
  });

// let dataRank = {};
// async function getData(tag) {
//   tag = tag.replace("#", "%23");
//   let url = "https://tracker.gg/valorant/profile/riot/" + tag + "/overview";
//   console.log(url);
//   axios.get(url).then((response) => {
//     const $ = cheerio.load(response.data);
//     const divInfo = $(".rating-entry__rank-info");
//     const divRank = divInfo.find(".value");
//     const rango = divRank.eq(0).text().trim();
//     const divIcon = $(".rating-entry__rank-icon");
//     const image = divIcon.find("img").attr("src");
//     dataRank = {
//       Rango: rango,
//       Icono: image,
//     };
//   });
  
// }
function getData(tag) {
  return new Promise((resolve, reject) => {
    tag = tag.replace("#", "%23");
    const url = "https://tracker.gg/valorant/profile/riot/" + tag + "/overview";
    console.log(url);
    axios.get(url)
      .then((response) => {
        const $ = cheerio.load(response.data);
        const divInfo = $(".rating-entry__rank-info");
        const divRank = divInfo.find(".value");
        const rango = divRank.eq(0).text().trim();
        const divIcon = $(".rating-entry__rank-icon");
        const image = divIcon.find("img").attr("src");
    
        const data = {
          Rango: rango,
          Icono: image,
        };
        resolve(data);
      })
      .catch((error) => {
        console.error(error);
        reject(new Error("Error al obtener los datos"));
      });
  });
}



//Servidor
app.get("/", (req, res) => {
  res.json(dataApi);
});

// app.get("/user/:tag", async (req, res) => {
//   // tag = req.params.tag;
//   // //tag = tag.replace("#", "%23")
//   // const data = getData(tag);
//   // //console.log(data);
//   //  res.json(data);
// });

app.get('/user/:tag', (req, res) => {
  const tag = req.params.tag;
  getData(tag)
    .then((data) => {
      console.log(data);
      res.json(data);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    });
});


app.listen(3000, () => {
  console.log("API listening on port 3000");
});
