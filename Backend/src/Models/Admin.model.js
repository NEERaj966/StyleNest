import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const AdminSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true, 
    },
    location: {
        type: String,
        required: true,
    },
    
}, { timestamps: true });



AdminSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next;

    this.password = await bcrypt.hash(this.password, 10)
    next;
})



AdminSchema.methods.ispasswordCorrect = async function(password){
    return await bcrypt.compare(password , this.password)
}




AdminSchema.methods.generateAuthToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const Admin = mongoose.model('Admin', AdminSchema); 
