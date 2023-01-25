//jshint esversion;6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require ("lodash");

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Adarsh1510:zlx0kylpb9Op101n@cluster0.ck7kp7q.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, "useUnifiedTopology": true });

const itemSchema = {
   name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
   name: "test1"
});

const item2 = new Item({
   name: "test2323"
});

const item3 = new Item({
   name: "test3312"
});


const defaultItem = [item1, item2, item3];

const listSchema = {
   name: String,
   items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
   Item.find({}, function (err, foundItem) {

      if (foundItem.length === 0) {
         Item.insertMany(defaultItem, function (err) {
            if (err) {
               console.log(err);
            } else {
               console.log("Success!");
            }
         });
         res.redirect("/");
      } else {
         res.render("list", { listTitle: "Today", newlistItems: foundItem });
      }
   });

   app.get("/:customListName", function (req, res) {
      const customListName = _.capitalize(req.params.customListName);
      List.findOne({ name: customListName }, function (err, foundlist) {
         if (!err) {
            if (!foundlist) {
               const list = new List({
                  name: customListName,
                  items: defaultItem
               });

               list.save();
               res.redirect("/" + customListName)
            } else {
               // console.log("Exists!");
               res.render("list", { listTitle: foundlist.name, newlistItems: foundlist.items })
            }
         }
      })
   });

});
app.post("/", function (req, res) {
   const itemName = req.body.newItem;
   const listName = req.body.list;

   const item = new Item({
      name: itemName
   });
   if (listName === "Today") {
      item.save();
      res.redirect("/");
   }else{
      List.findOne({name: listName}, function(err, foundlist){
         foundlist.items.push(item);
         foundlist.save();
         res.redirect("/" + listName);
      });
   }


});

app.post("/delete", function (req, res) {
   const cheakedItemId = req.body.cheakbox;
   const listName =req.body.listName;


   if(listName=== "Today"){
      Item.findByIdAndRemove(cheakedItemId, function (err) {
         if (!err) {
            console.log("Succes! delete item");
            res.redirect("/")
         }
      }) 
   }else{
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: cheakedItemId}}}, function(err, foundlist){
         if(!err){
            res.redirect("/" + listName);
         }
      })
   }

   
});

app.post("/work", function (res, req) {
   let item = req.body.newItem;
   workItems.push(item);
   res.redirect("/work");
});


app.listen(3000, function () {
   console.log("Server Started on port 3000")
})