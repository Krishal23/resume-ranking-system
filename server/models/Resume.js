import { Schema, model } from 'mongoose';

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

export default Resume = model('Resume', ResumeSchema);
