import mongoose from "mongoose";
const contestSchema=new mongoose.Schema({
    name: String,
  problems: [{ 
    statement: String, 
    testCases: [{ input: String, output: String }],
    points: Number 
  }],
  duration: Number,  // in minutes
  createdBy: String,
  active: { type: Boolean, default: true }
},{ timestamps: true });
