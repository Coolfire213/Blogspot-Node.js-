const fs = require("fs");
const { resolve } = require("path");

let posts = [];
let categories = [];

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/posts.json", "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        posts = JSON.parse(data);

        fs.readFile("./data/categories.json", "utf8", (err, data) => {
          if (err) {
            reject(err);
          } else {
            categories = JSON.parse(data);
            resolve();
          }
        });
      }
    });
  });
};

module.exports.getAllPosts = function () {
  return new Promise((resolve, reject) => {
    posts.length > 0 ? resolve(posts) : reject("no results returned");
  });
};

module.exports.getPublishedPosts = function () {
  return new Promise((resolve, reject) => {
    posts.length > 0
      ? resolve(posts.filter((post) => post.published))
      : reject("no results returned");
  });
};

module.exports.getCategories = function () {
  return new Promise((resolve, reject) => {
    categories.length > 0 ? resolve(categories) : reject("no results returned");
  });
};

module.exports.addPost = function (postData) {
  return new Promise(async (resolve, reject) => {
    postData.published = postData.published === "on";
    const newPost = {
      ...postData,
      postDate: new Date().toLocaleDateString("en-ca", "yyyy-mm-dd"),
      id: posts.length + 1,
    };
    let obj = await fs.readFileSync("./data/posts.json");
    let object = obj ? JSON.parse(obj) : [];
    object.push(newPost);
    const stringPosts = JSON.stringify(object);
    fs.writeFile("./data/posts.json", stringPosts, (e) => {
      resolve(true);
    });
  });
};

module.exports.getPostsByCategory = function (category) {
  return new Promise((resolve,reject) => {
    if(posts.length > 0)  {
    posts.id == category ? resolve(posts) : reject("no results found");
    }
  });
}

module.exports.getPostsByMinDate = function (minDateStr) {
  return new Promise((resolve,reject) =>{
    if (new Date(minDateStr) >= new Date(posts.postDate)) {
      resolve(posts);
    } else {
      reject("no results found");
    }
  });
}

module.exports.getPostById = function (id) {
  return new Promise((resolve,reject) => {
    if (posts.id == id) {
      resolve(posts)
    } else {
      reject("no results found")
    }
  });
}

module.exports.getPublishedPostsByCategory = function(category) {
  return new Promise((resolve,reject) => {
    if (posts.published == true && posts.category == category)
      resolve(posts)
    else
      reject("no resluts found")
  })
}
