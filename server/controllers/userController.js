import User from '../models/User.js';


async function getUserByEmail(req, res){
    try{
        const userDetails = req.body;
        const users = await User.find(
            { userEmail: new RegExp(userDetails.userEmail, 'i'), role: userDetails.userRole},
            '_id userEmail' 
          );
          res.status(200).json(users);
    }catch(err){
        res.status(500).json({
            status: "error",
            message: "Internal Server Error "+ err.message,
        });
    }
}


export {getUserByEmail};