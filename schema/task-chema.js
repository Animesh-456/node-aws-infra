import mongoose from 'mongoose';
const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee',
        default: null,
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee',
        default: null,
    },
    status: {
        type: String,
        enum: ['pending', 'complete'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    files: [
        {
            type: String, // Assuming you're storing file paths or URLs as strings
        }
    ],
});

const task = new mongoose.model("task", taskSchema)
export default task