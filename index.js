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

function query(scanKey) {
    return new Promise( result => {
        var resultArray = [];

        var params = {
            TableName: "music",
            KeyConditionExpression: "pk = :scanValue",
            ExpressionAttributeValues: { 
                ":scanValue": scanKey
            }
        };
      
        dynamodb.query(params, function (err, data) {
            if (err) console.log(err);
            else{
                data.Items.forEach((i) => {
                    resultArray.push(i.sk);
                });
            console.log("resultArray: ", resultArray);
          } 
        });
    
        result(resultArray);
    })
}

function scan(scanKey) {
    var resultArray = []

    var params = {
        TableName : "music",
        FilterExpression: "pk = :scanValue",
        ExpressionAttributeValues: {
            ":scanValue": scanKey
        }
    };

    dynamodb.scan(params, function(err, data) {
        if(err) console.log(err, err.stack);
        else {
            console.log(data);
            data.Items.forEach((i) => {
                console.log(i.sk);
                resultArray.push(i.sk);
            })
            console.log(resultArray);
        }
    })

    return resultArray;
}

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

app.get('/albums/for/artist', async (req, res) => {
    var artist = req.query.artist;
    var albums = await query(artist);
    res.send(albums);
});

app.get('/songs/for/album', async (req, res) => {
    var album = req.query.album;
    var songs = await query(album);
    res.send(songs);
});

app.get('/song', async (req, res) => {
    var song = req.query.song;
    var url = await query(song);
    res.send(url);
})



app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))