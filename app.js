const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();
const day = date.getDate();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-abhimanyu:abhimanyuYdyadav@todolistcluster.fu7jzy8.mongodb.net/todolistDB");

const itemsSchema = mongoose.Schema({
  name: String
});
const Item = mongoose.model("item",itemsSchema);

const item1 = new Item({
  name:"Welcome to ToDoList"
});
const item2 = new Item({
  name:"Hit the + button to add a new item."
});
const item3 = new Item({
  name:"<-- Hit this to delete an item"
});

const defaultItems=[item1, item2, item3];

const listSchema={
  name:String,
  items: [itemsSchema]
};
const List= mongoose.model("list", listSchema);

app.get("/", function(req, res) {
  Item.find({},function(err, foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err)
        }else{
          console.log("Successfully Addded to DB.")
        }
      });
      res.redirect("/");
    }else{
      
      res.render("list", {listTitle: day, newListItems: foundItems});
    }   
  });
});

app.get("/:customListName", function(req,res){
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list= new List({
          name:customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});


app.post("/", function(req, res){
  const itemName=req.body.newItem;
  const listName=req.body.list;
  
  const item=new Item({
    name:itemName
  });
  
  if(listName===day){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName)
    });
  }
  
});

app.post("/delete", function(req, res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  

  if(listName===day){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  }else{
   List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err){
    if(!err){
      res.redirect("/"+listName);
    }
   })
  }

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started successfully.");
});


