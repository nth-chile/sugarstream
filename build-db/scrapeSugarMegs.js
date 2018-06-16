// This gets all archive.org identifiers from sugarmegs based on the ENTRY variable you define below. This writes them to identifiers_ENTRY.js
var ENTRIES = [
  "RollingThunderRevue"
]

var counta = 0

var ENTRY = ENTRIES[counta]

const puppeteer = require('puppeteer')
const fs = require("fs")

var browser = undefined
var page = undefined

let scrape = async () => {
  if (browser == undefined) {
    browser = await puppeteer.launch()
    page = await browser.newPage()
  }

    await page.goto('http://tela.sugarmegs.org/bands.aspx');
    await page.select('body > form > select', ENTRY)
    await page.waitFor(3500)
    const result = await page.evaluate(
      () => {
        try {
          let links = document.querySelectorAll('[href^="http://www.archive.org"]')
          let identifiers = []

          for ( let i = 0; i < links.length; i++) {
            let href = links[`${i}`].href
            let splitHref = href.split('/')
            identifiers.push(splitHref[splitHref.length - 2]);
          }
          return {
            identifiers
          }
        } catch (err) {
          return 'err'
        }
      }
    )

    return result;
};

var thenn = (output) => {
    console.log("length: ", output.identifiers.length);

    if (output.identifiers.length == 0) {
      console.log("output:", output)
    }

    fs.writeFile(`./identifiers/identifiers_${ENTRY}.js`, JSON.stringify(output),function(err) {
        if(err) return console.log(err);

        console.log("The file was saved!");

        if (ENTRIES[++counta]) {
          ENTRY = ENTRIES[counta];
          scrape().then((output) => thenn(output));
        } else {
          browser.close();
        }
    });
}

scrape().then((output) => thenn(output));
