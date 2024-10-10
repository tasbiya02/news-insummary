const request = require('request');
const cheerio = require('cheerio');
const News = require("./init/News");
const moment = require('moment-timezone');
const  processContent  = require('./utils/contentProcessor');

const url = "https://inc42.com";

async function fetchInc42News() {
    request(url, cb);
}

function cb(error, response, html) {
    if (error) {
        console.log('error:', error)
    }
    else {
        handlehtml(html);
    }

};



async function handlehtml(html) {

    let $ = cheerio.load(html);
    const anchorTags = $('.entry-title.recommended-block-head a');
    for (let idx = 1; idx < 3; idx++) {
        let anchor = anchorTags[idx];
        let text = $(anchor).text().trim();
        let href = $(anchor).attr('href');
        let data = await News.findOne({ read_more: href });
        if (!data) {
            insertData(text,href);
        }
    }    
}

function insertData(text, href) {
    let url2 = href;
    request(url2, cb2);
    function cb2(error, response, html) {
        if (error) {
            console.log('error:', error)
        }
        else {
            handlehtml2(html);
        }
    };
    let handlehtml2 = async (html) => {

        let $ = cheerio.load(html);

        let paragraphDiv = $('.single-post-summary p');
        let content = ''
        paragraphDiv.each((index, element) => {
            let paragraphText = $(element).text().trim();
            content += paragraphText + '\n';
        })
        content = processContent(content);


        let imgElement = $('.single-featured-thumb-container img');

        if (imgElement.length > 0) {
            let img_url = imgElement.attr('src') ||
                imgElement.attr('data-src') ||
                imgElement.attr('data-lazy-src') ||
                imgElement.attr('data-original') ||
                imgElement.attr('data-img-url') ||
                imgElement.attr('data-cfsrc') || "https://media.istockphoto.com/id/1409309637/vector/breaking-news-label-banner-isolated-vector-design.jpg?s=612x612&w=0&k=20&c=JoQHezk8t4hw8xXR1_DtTeWELoUzroAevPHo0Lth2Ow=";


            let date = $('.date span:first-child').text() || moment.tz("Asia/Kolkata").format('DD MMMM, YYYY');

            let new_data = new News({
                title: text,
                source: "Inc42 | ",
                read_more: href,
                date: date,
                content: content,
                img_url: img_url,
                category: "Startup"
            })
            try {
                await new_data.save();
            } catch (err) {
                console.error("Error saving document(inc42):", err);
            }
        }
    }
}
fetchInc42News();
setInterval(fetchInc42News, 24*60*60*1000);
module.exports = { fetchInc42News };

