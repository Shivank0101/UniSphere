import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, // Faculty or the user themselves
    },
    markedAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ["present", "absent", "late"],
        default: "present",
    },
    notes: {
        type: String,
    }
}, {
    timestamps: true
});

// Compound index to ensure user's attendance can only be marked once per event
attendanceSchema.index({ user: 1, event: 1 }, { unique: true });

// Index for better query performance
attendanceSchema.index({ event: 1 });
attendanceSchema.index({ user: 1 });
attendanceSchema.index({ markedBy: 1 });
attendanceSchema.index({ status: 1 });

export const Attendance = mongoose.model("Attendance", attendanceSchema);
