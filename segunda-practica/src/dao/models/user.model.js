import mongoose from 'mongoose';
import { createHash, isValidPassword } from '../../utils.js';

const userCollection = "Users";

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true, max: 100 },
    last_name: { type: String, required: true, max: 100 },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true, max: 100 },
    password: { type: String, required: true },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'carts',
        default: null
    },
    role: { type: String, default: 'user' }
});

//Hash de contraseña
userSchema.pre('save', function (next) {
    if (this.isModified('password') || this.isNew) {
        this.password = createHash(this.password);
    }
    next();
})

//Comparar la password
userSchema.methods.comparePassword = function (password) {
    return isValidPassword(this, password);
}

const userModel = mongoose.model(userCollection, userSchema);

export default userModel;