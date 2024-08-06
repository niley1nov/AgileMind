import Story from "../models/Story.js";
async function getStoryDetails(req,res){
    try{
        const storyId = req.query.storyId;
        const storyData = Story.findOne({_id: storyId});


    }catch (err) {
        console.log( "Internal Server Error " + err.message);
        res.status(500).json({
          status: "error",
          message: "Internal Server Error " + err.message,
        });
    }
}


export {getStoryDetails};