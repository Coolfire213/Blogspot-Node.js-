/********************************************************************** 
*  WEB322 – Assignment 3 
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.   
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including web sites) or distributed to other students. 
*  
*  Name: Aaron Maniyakku   Student ID:152752192  Date: 17/06/2022
* 
*  Online (Heroku) URL: https://whispering-dawn-82178.herokuapp.com/

 
********************************************************************************/


const express = require('express');
const blogData = require("./blog-service");
const path = require("path");
const app = express();
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier');

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

const upload = multer();

cloudinary.config({
    cloud_name: 'web322-app',
    api_key: '757251886141221',
    api_secret: 'GLDlBLCaPmx4HNzZj8MTHdcJjG8',
    secure: true
});

//Routes 
app.get('/', (req, res) => {
    res.redirect("/about");
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"))
});

app.get('/blog', (req, res) => {
    blogData.getPublishedPosts().then((data => {
        res.json(data);
    })).catch(err => {
        res.json({ message: err });
    });
});

app.get('/posts', (req, res) => {
    blogData.getAllPosts().then((data => {
        res.json(data);
    })).catch(err => {
        res.json({ message: err });
    });
});

app.get('/categories', (req, res) => {
    blogData.getCategories().then((data => {
        res.json(data);
    })).catch(err => {
        res.json({ message: err });
    });
});

//POST
app.post('/posts/add', upload.single("featureImage"), function (req, res,next) {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
              (error, result) => {
                if (result) {
                  resolve(result);
                } else {
                  reject(error);
                }
              }
            );

          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
    }

    upload(req).then((uploaded)=> {
        req.body.featureImage = uploaded.url;
    })

    blogData.addPost(req.body).then((data => {
        res.sendFile(path.join(__dirname, '/data/posts.json'))
    }))
});

app.get('/posts/add', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/addPost.html'))
})

//Error handling
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views/error.html'))
})

blogData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log('server listening on: ' + HTTP_PORT);
    });
}).catch((err) => {
    console.log(err);
})
