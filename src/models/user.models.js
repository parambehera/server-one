import mongoose ,{Schema} from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
    },
    phoneNo:{
        type:Number,
        required:true
    },
   refreshToken:{
    type:String
   },
   message:{
    type:String
   }
},{timestamps:true})

userSchema.pre("save",async function (next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password,10)
    next();
})

userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            id:this._id
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password)
}


export const User = mongoose.model("User",userSchema);