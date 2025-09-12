import mongoose from 'mongoose';
//import autoIncrement from 'mongoose-auto-increment';

// how our document look like
const employeeSchema = mongoose.Schema({
    fname: String,
    lname: String,
    email: {
        unique: true,
        type: String
    },
    username: {
        unique: true,
        type: String
    },
    account_type: String,
    description: String,
    password: String
});


// autoIncrement.initialize(mongoose.connection);
// userSchema.plugin(autoIncrement.plugin, 'user');
// we need to turn it into a model
// const postUser = mongoose.model('user', userSchema);

// export default postUser;
const employee = new mongoose.model("employee", employeeSchema);

export default employee