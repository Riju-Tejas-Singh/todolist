//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(express.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.set("view engine", "ejs");


// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb://localhost:27017/todolistDB",{ useNewUrlParser:true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item" ,itemsSchema);

const item1 = new Item({
  name:"Welcome to your todolist",
});

const item2 = new Item({
  name:"Click + to add new items",
});

const item3 = new Item({
  name:"<-- Hit this to delete an item",
});

const defaultItems=[item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List= mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({},function(err,founditems){
    if(founditems.length===0){

      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("successfully saved items to DB");
        }
      });

      res.redirect("/");
    }else{

  res.render("list", {listTitle: "Today", newListItems: founditems});
  }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listValue= req.body.list;
  const item=new Item({
    name:itemName
  });

  if(listValue === "Today"){
    item.save();
    res.redirect("/");
  }else{
    // for custom lists
    List.findOne({name: listValue}, function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listValue);
    });
  }



});

app.get("/:customListName" , function(req,res){
  const myName = _.capitalize(req.params.customListName);

  List.findOne({name: myName}, function(err, foundList){
    if(!err){
      if(!foundList){
        // create new

        const list =new List({
          name: myName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + myName);
      }else{
        res.render("list" , {listTitle: foundList.name , newListItems: foundList.items });
      }
    }
  });



});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }


});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
