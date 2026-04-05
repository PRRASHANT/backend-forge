const authService = require("./auth.service");

const register = async (req, res) => {

    try{

        const user = await authService.registerUser(req.body);

        const userObj = user.toObject();

        delete userObj.password;

        res.status(201).json({
            message: "User created",
            user: userObj
        });

    }catch(error){

        res.status(400).json({
            message: error.message
        });

    }

};

module.exports = {
    register
};