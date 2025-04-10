import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';


const skillsSchema = new mongoose.Schema({
  programming_languages: [String],
  frameworks: [String],
  tools: [String],
  core_courses: [String],
  mathematics: [String],
  libraries: [String],
  soft_skills: [String]
}, { _id: false });

const ResumeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
  },
  education: [{
    degree: String,
    institution: String,
    year: String,
    gpa: Number
  }],
  skills: [String],
  experience: [{
    company: String,
    position: String,
    duration: String,
    description: String
  }],
  projects: [{
    title: String,
    description: String,
    technologies: [String]
  }],
  rankings: [{
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company'
    },
    score: Number,
    rank: Number
  }],
  resumeText: {
    type: String,
    required: true
  },
  filePath: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Resume = model('Resume', ResumeSchema);
export default Resume;