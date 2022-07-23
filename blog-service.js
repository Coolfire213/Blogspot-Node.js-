const Sequelize = require('sequelize');
const {gte} = Sequelize.Op;

var sequelize = new Sequelize('d8t1p2ugcp56hj', 'ghfviaepvqeewu', '1c20b00b312322006be1eff5a39cf92095be7d3146a885a754fe4ddab6f3a10d', {
    host: 'ec2-107-22-122-106.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Post = sequelize.define('Post', {
  ID: Sequelize.INTEGER,
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN
});

var Category = sequelize.define('Category', {
  ID: Sequelize.INTEGER,
  category: Sequelize.STRING
});

Post.belongsTo(Category, {foreignKey: 'category'});



module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    sequelize.sync().then(function () {
      console.log("Sync successful.")
      resolve();
    }).catch(function () {
      reject("unable to sync the database");
    })
  });
};

module.exports.getAllPosts = function () {
  return new Promise((resolve, reject) => {
    Post.findAll().then(function (data) {
      resolve(data);
    }).catch(function() {
      reject("no results found");
    })
  });
};

module.exports.getPublishedPosts = function () {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        published: true
      }
    }).then(function(data) {
        resolve(data);
    }).catch(function () {
        reject("no results found")
    })
  });
};

module.exports.getCategories = function () {
  return new Promise((resolve, reject) => {
    Category.findAll().then(function (data) {
      resolve(data);
    }).catch(function() {
      reject("no results found");
    })
  });
};

module.exports.addPost = function (postData) {
  return new Promise(async (resolve, reject) => {
    postData.published = (postData.published) ? true : false;
    for (const key in postData) {
      if (Object.hasOwnProperty.call(postData, key)) {
        if(postData[key] == ""){
          postData[key] = null
        }  
      }
    }
    postData.postDate = new Date().toLocaleDateString("en-ca", "yyyy-mm-dd");
    Post.create({
      ID: Post.length + 1,
      body: postData.body,
      title: postData.title,
      postDate: postData.postDate,
      featureImage: postData.featureImage,
      published: postData.published
    }).then(function () {
      resolve();
    }).catch(function() {
      reject("unable to create post");
    })
  });
};

module.exports.getPostsByCategory = function (Category) {
  return new Promise((resolve,reject) => {
    Post.findAll({
      where: {
        category: Category
      }
    }).then(function(data) {
        resolve(data);
    }).catch(function () {
        reject("no results found")
    })
  });
}

module.exports.getPostsByMinDate = function (minDateStr) {
  return new Promise((resolve,reject) =>{
    Post.findAll({
      where: {
        postData: {
          [gte]: new Date(minDateStr)
        }
      }
    }).then(function (data) {
      resolve(data)
    }).catch(function() {
      reject("no results found")
    })
  });
}

module.exports.getPostById = function (id) {
  return new Promise((resolve,reject) => {
    Post.findAll({
      where: {
        ID: id 
      }
    }).then(function (data) {
      resolve(data[0])
    }).catch(function() {
      reject("no results found")
    })
  });
}

module.exports.getPublishedPostsByCategory = function(Category) {
  return new Promise((resolve,reject) => {
    Post.findAll({
      where: {
        category: Category,
        published: true
      }
    }).then(function(data) {
        resolve(data);
    }).catch(function () {
        reject("no results found")
    })
  });
}

module.exports.addCategory = function (categoryData) {
  return new Promise(async (resolve, reject) => {
    for (const key in categoryData) {
      if (Object.hasOwnProperty.call(categoryData, key)) {
        if(categoryData[key] == ""){
          categoryData[key] = null
        }  
      }
    }
    Category.create({
      ID: Category.length + 1,
      category: categoryData.category
    }).then(function () {
      resolve();
    }).catch(function() {
      reject("unable to create category");
    })
  });
};

module.exports.deleteCategoryById = function (id) {
  return new Promise((resolve, reject) => {
    Category.destroy({
      where: {
        ID: id
      }
    }).then(function () {
      resolve();
    }).catch(function() {
      reject("Unable to delete category");
    })
  });
};

module.exports.deletePostById = function (id) {
  return new Promise((resolve, reject) => {
    Post.destroy({
      where: {
        ID: id
      }
    }).then(function () {
      resolve();
    }).catch(function() {
      reject("Unable to delete the post");
    })
  });
};