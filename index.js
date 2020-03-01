const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
var AWS = require("aws-sdk");

const app = express();
const port = 3000;
app.use(cors());

var dynamodb = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1',
    apiVersion: '2012-08-10'
});

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

async function query(scanKey) {
    return new Promise(result => {
        var res = [];

        var params = {
            TableName: "music",
            KeyConditionExpression: "pk = :scanValue",
            ExpressionAttributeValues: {
                ":scanValue": scanKey
            }
        };

        dynamodb.query(params, function (err, data) {
            if (err) console.log(err);
            else {
                data.Items.forEach((i) => {
                    res.push(i.sk);
                });
                console.log("resultArray: ", res);
            }
            result(res);
        });
    })
}

async function scan(scanKey) {
    return new Promise((resolve, reject) => {
        var res = []
            var params = {
                TableName: "music",
                FilterExpression: "pk = :scanValue",
                ExpressionAttributeValues: {
                    ":scanValue": scanKey
                }
            };

            dynamodb.scan(params, function (err, data) {
                if (err) console.log(err, err.stack);
                else {
                    console.log(data);
                    data.Items.forEach((i) => {
                        console.log(i.sk);
                        res.push(i.sk);
                    })
                    console.log(res);
                }
                resolve(res);
            })
    })
}

async function putDDB(id, name, email){
    return new Promise((resolve, reject)=>{
        // console.log(typeof id)
        var params = {
            ReturnConsumedCapacity: "TOTAL",
            TableName: "users",
            Item: {
                "pk": name,
                "sk": id,
                "email": email
            }
        };

        dynamodb.put(params, function(err, data){
            if (err) console.log(err);
            else{
                console.log(data);
            }
        })
    })
} 


app.get('/genres', async (req, res) => {
    var gen = await scan("genre")
    res.send(gen)
});

app.get('/artists/for/genre', async (req, res) => {
    var genre = req.query.genre;
    console.log('genre ' + genre)
    var artists = await query(genre);
    res.status(200).send(artists);
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

app.post('/save-user', async (req, res) => {
    var id = req.query.id;
    var name =  req.query.name;
    var email = req.query.email;
    putDDB(id, name, email)
    // .then(res => {
    //     console.log(res)
    //     console.log('booty')
    // })
    .catch(e =>{
        res.status(400).send('booty');
    });
    var gen = await scan("genre")
    res.status(200).send(gen);
})

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))