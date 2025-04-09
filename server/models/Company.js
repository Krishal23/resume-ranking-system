// server/models/Company.js
import { Schema, model } from 'mongoose';

export const CompanySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  cpi: {
    type: Number,
    default: 0
  },
  skillSet: {
    type: [String],
    default: []
  },
  internshipRole: {
    type: String
  },
  visitsIITPatna: {
    type: Boolean,
    default: false
  },
  minProjects: {
    type: Number,
    default: 0
  },
  projectKeywords: {
    type: [String],
    default: []
  },
  branch: {
    type: [String],
    default: []
  },
  dsaRequired: {
    type: Boolean,
    default: false
  },
  coreSkills: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    default:""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Company = model('Company', CompanySchema);
export default Company;
