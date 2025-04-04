import { Schema, model } from 'mongoose';

export const CompanySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  cpi: {
    type: Number,
    required: true
  },
  skillSet: {
    type: [String],
    required: true
  },
  minProjects: {
    type: Number,
    default: 0
  },
  projectKeywords: {
    type: [String]
  },
  branch: {
    type: [String]
  },
  coreSkills: {
    type: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


const Company = model('Company', CompanySchema);
export default Company;