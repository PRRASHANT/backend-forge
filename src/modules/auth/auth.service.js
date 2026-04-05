const User = require("./auth.model");

const registerUser = async (userData) => {

    const { name, email, password } = userData;

    
    const existingUser = await User.findOne({ email });

    if(existingUser){
        throw new Error("User already exists");
    }

    const user = await User.create({
        name,
        email,
        password
    });

    return user;

};

module.exports = {
    registerUser
};