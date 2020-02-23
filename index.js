const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
var AWS = require("aws-sdk");

const app = express();
const port = 3000;
app.use(cors());

// Create DynamoDB document client
var dynamodb = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1',
    apiVersion: '2012-08-10'
});
var buck = 'thicc-boi-thiccbucket-1lqm0m2iu7gji';
const s3 = new AWS.S3({
    region: 'us-east-1',
    Bucket: 'thicc-boi-thiccbucket-1lqm0m2iu7gji'
});

let params = {
    Bucket: "thicc-boi-thiccbucket-1lqm0m2iu7gji",
};

app.get('/', (req, res) => {
    res.send('Hello World, from express');
});

function assign(obj, keyPath, value) {
    lastKeyIndex = keyPath.length - 1;
    for (var i = 0; i < lastKeyIndex; ++i) {
        key = keyPath[i];
        if (!(key in obj)) {
            obj[key] = {}
        }
        obj = obj[key];
    }
    obj[keyPath[lastKeyIndex]] = value;
}
var obj = {};
app.get('/entities', (req, res) => {
    s3.listObjectsV2(params, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            data.Contents.forEach((i) => {
                var href = this.request.httpRequest.endpoint.href;
                var bucketUrl = href + buck + "/";
                var songKey = i.Key;
                var songUrl = bucketUrl + encodeURIComponent(songKey);
                var res = i.Key.split("/");
                assign(obj, res, songUrl)
            })
        }
        res.send(obj);
    })
});
var library = {};

app.get('/genres', (req,res) => {
    var genres = scan("Genres");
    res.send(genres);
});

app.get('/artists/for/genre', async (req, res) => {
    var genre = req.query.genre;
    var artists = await query(genre);
    res.send(artists);
});



app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))