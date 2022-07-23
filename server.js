/********************************************************************** 
*  WEB322 – Assignment 5
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.   
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including web sites) or distributed to other students. 
*  
*  Name: Aaron Maniyakku   Student ID:152752192  Date: 17/06/2022
* 
*  Online (Heroku) URL: https://serene-taiga-72565.herokuapp.com/

 
********************************************************************************/


const express = require('express');
const blogData = require("./blog-service");
const path = require("path");
const app = express();
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier');
const exphbs = require('express-handlebars');
const stripJs = require('strip-js')


const HTTP_PORT = process.env.PORT || 8080;

app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
        navLink: function(url, options){
            return '<li' + 
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
            '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },

        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
            return options.inverse(this);
            } else {
            return options.fn(this);
            }
        },

        safeHTML: function(context){
            return stripJs(context);
        },

        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }
               
    }
}));

app.set('view engine', '.hbs');

app.use(express.static('public'));
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({extended: true}));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

const upload = multer();

cloudinary.config({
    cloud_name: 'web322-app',
    api_key: '757251886141221',
    api_secret: 'GLDlBLCaPmx4HNzZj8MTHdcJjG8',
    secure: true
});

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});



//Routes 
app.get('/', (req, res) => {
    res.redirect("/about");
});

app.get('/about', (req, res) => {
    res.render('about.hbs', {
        layout: 'main.hbs'
    })
});

app.get('/blog', async (req, res) => {
     // Declare an object to store properties for the view
     let viewData = {};

     try{
 
         // declare empty array to hold "post" objects
         let posts = [];
 
         // if there's a "category" query, filter the returned posts by category
         if(req.query.category){
             // Obtain the published "posts" by category
             posts = await blogData.getPublishedPostsByCategory(req.query.category);
         }else{
             // Obtain the published "posts"
             posts = await blogData.getPublishedPosts();
         }
 
         // sort the published posts by postDate
         posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
 
         // get the latest post from the front of the list (element 0)
         let post = posts[0]; 
 
         // store the "posts" and "post" data in the viewData object (to be passed to the view)
         viewData.posts = posts;
         viewData.post = post;
 
     }catch(err){
         viewData.message = "no results";
     }
 
     try{
         // Obtain the full list of "categories"
         let categories = await blogData.getCategories();
 
         // store the "categories" data in the viewData object (to be passed to the view)
         viewData.categories = categories;
     }catch(err){
         viewData.categoriesMessage = "no results"
     }
 
     // render the "blog" view with all of the data (viewData)
     res.render("blog", {data: viewData})
 
});

app.get('/posts', (req, res) => {
    blogData.getAllPosts().then((data => {
        if(data.length > 0)
            res.render("posts",{posts: data});
        else
            res.render("posts", {message: "no results"});  
    })).catch(err => {
        res.render("posts", {message: "no results"});
    });
});

app.get('/categories', (req, res) => {
    blogData.getCategories().then((data => {
        if(data.length > 0)
            res.render("categories",{categories: data});
        else
            res.render("categories", {message: "no results"}); 
    })).catch(err => {
        res.render("categories", {message: "no results"});
    });
});

app.get('/posts/add', (req, res) => {
    blogData.getCategories().then((data => {
        res.render('addPost.hbs',{
            categories: data,
            layout: 'main.hbs'
        })
    })).catch((err => {
        res.render('addPost.hbs',{
            categories: [],
            layout: 'main.hbs'
        })
    }))
})

app.get('/posts', function(req, res) {
    blogData.getPostsByCategory(req.query.category).then((data => {
        res.render("posts",{posts: data});
    })).catch(err => {
        res.render("posts", {message: "no results"});
    });
})

app.get('/posts', function(req, res) {
    blogData.getPostsByMinDate(req.query.minDateStr).then((data => {
        res.render("posts",{posts: data});
    })).catch(err => {
        res.render("posts", {message: "no results"});
    });
})

app.get('/post/:id', function(res,req) {
    blogData.getPostById(req.params.id).then((data => {
        res.render("posts",{posts: data});
    })).catch(err => {
        res.render("posts", {message: "no results"});
    });
})

app.get('/categories/add', (req, res) => {
    res.render('addCategory.hbs',{
        layout: 'main.hbs'
    })
})

app.get('/categories/delete/:id', function(res,req) {
    blogData.deleteCategoryById(req.params.id).then((data => {
        res.redirect('/categories')
    })).catch(err => {
        res.status(500).send("Unable to remove Category/Category not found")
    });
})

app.get('/posts/delete/:id', function(res,req) {
    blogData.deletePostById(req.params.id).then((data => {
        res.redirect('/posts')
    })).catch(err => {
        res.status(500).send("Unable to remove Post/Post not found")
    });
})

//POST
app.post('/posts/add', upload.single("featureImage"), function (req, res, next) {
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
        res.redirect('/posts')
    }))
});

app.post('/categories/add', function (req, res, next) {
    blogData.addCategory(req.body).then((data => {
        res.redirect('/categories')
    })).catch(err => {
        res.status(500).send("Unable to add Category")
    })
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
