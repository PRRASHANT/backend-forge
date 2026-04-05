const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    }
},
{
    timestamps: true
});

/* Hash password before saving (modern mongoose style) */
userSchema.pre("save", async function(){

    if(!this.isModified("password")){
        return;
    }

    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt);

});

/* Compare password during login */
userSchema.methods.comparePassword = async function(enteredPassword){

    return bcrypt.compare(enteredPassword, this.password);

};

module.exports = mongoose.model("User", userSchema);