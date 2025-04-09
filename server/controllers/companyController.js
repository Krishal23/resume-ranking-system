import Company from '../models/Company.js';
import Resume from '../models/Resume.js';

import { generateRankings } from '../services/rankGenerator.js';


export async function createCompany(req, res) {
  try {
    const {
      name,
      cpi,
      skillSet,
      internshipRole,
      visitsIITPatna,
      minProjects,
      projectKeywords,
      branch,
      dsaRequired,
      coreSkills,
      description
    } = req.body;
    
    // Check if company already exists
    let company = await Company.findOne({ name });
    
    if (company) {
      return res.status(400).json({ msg: 'Company already exists' });
    }
    
    // Create a new company
    company = new Company({
      name,
      cpi: cpi || 0,
      skillSet: Array.isArray(skillSet) ? skillSet : skillSet.split(',').map(s => s.trim()),
      internshipRole,
      visitsIITPatna: visitsIITPatna === 'YES' || visitsIITPatna === true,
      minProjects: minProjects || 0,
      projectKeywords: Array.isArray(projectKeywords) ? projectKeywords : projectKeywords.split(',').map(k => k.trim()),
      branch: Array.isArray(branch) ? branch : branch.split(',').map(b => b.trim()),
      dsaRequired: dsaRequired === 'YES' || dsaRequired === true,
      coreSkills: Array.isArray(coreSkills) ? coreSkills : (coreSkills && coreSkills !== 'None' ? coreSkills.split(',').map(s => s.trim()) : []),
      description
    });
    
    await company.save();
    
    // Update rankings for all existing resumes
    const resumes = await Resume.find();
    
    for (const resume of resumes) {
      const resumeData = {
        name: resume.name,
        email: resume.email,
        phone: resume.phone,
        education: resume.education,
        skills: resume.skills,
        experience: resume.experience,
        projects: resume.projects,
        resumeText: resume.resumeText
      };
      
      const rankings = await generateRankings(resumeData, [company]);
      
      if (rankings.length > 0) {
        // Add the new ranking to the resume
        resume.rankings.push({
          company: company._id,
          score: rankings[0].score,
          rank: resume.rankings.length + 1
        });
        
        // Sort rankings by score
        resume.rankings.sort((a, b) => b.score - a.score);
        
        // Update ranks
        resume.rankings.forEach((ranking, index) => {
          ranking.rank = index + 1;
        });
        
        await resume.save();
      }
    }
    
    res.status(201).json(company);
  } catch (error) {
    console.error('Error in createCompany:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}



export async function getCompanies(req, res) {
  try {
    const companies = await Company.find().sort({ name: 1 });
    res.json(companies);
  } catch (error) {
    console.error('Error in getCompanies:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}

export async function getCompanyById(req, res) {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ msg: 'Company not found' });
    }
    
    res.json(company);
  } catch (error) {
    console.error('Error in getCompanyById:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Company not found' });
    }
    
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}


export async function updateCompany(req, res) {
  try {
    const {
      name,
      cpi,
      skillSet,
      internshipRole,
      visitsIITPatna,
      minProjects,
      projectKeywords,
      branch,
      dsaRequired,
      coreSkills,
      description
    } = req.body;
    
    // company object
    const companyFields = {};
    if (name) companyFields.name = name;
    if (cpi !== undefined) companyFields.cpi = cpi;
    if (skillSet) {
      companyFields.skillSet = Array.isArray(skillSet) ? skillSet : skillSet.split(',').map(s => s.trim());
    }
    if (internshipRole !== undefined) companyFields.internshipRole = internshipRole;
    if (visitsIITPatna !== undefined) companyFields.visitsIITPatna = visitsIITPatna === 'YES' || visitsIITPatna === true;
    if (minProjects !== undefined) companyFields.minProjects = minProjects;
    if (projectKeywords) {
      companyFields.projectKeywords = Array.isArray(projectKeywords) ? projectKeywords : projectKeywords.split(',').map(k => k.trim());
    }
    if (branch) {
      companyFields.branch = Array.isArray(branch) ? branch : branch.split(',').map(b => b.trim());
    }
    if (dsaRequired !== undefined) companyFields.dsaRequired = dsaRequired === 'YES' || dsaRequired === true;
    if (coreSkills) {
      companyFields.coreSkills = Array.isArray(coreSkills) ? coreSkills : (coreSkills && coreSkills !== 'None' ? coreSkills.split(',').map(s => s.trim()) : []);
    }
    if (description !== undefined) companyFields.description = description;
    
    // Update the company
    let company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ msg: 'Company not found' });
    }
    
    company = await Company.findByIdAndUpdate(
      req.params.id,
      { $set: companyFields },
      { new: true }
    );
    
    
    // Update rankings for all existing resumes
    const resumes = await Resume.find();
    
    for (const resume of resumes) {
      const resumeData = {
        name: resume.name,
        email: resume.email,
        phone: resume.phone,
        education: resume.education,
        skills: resume.skills,
        experience: resume.experience,
        projects: resume.projects,
        resumeText: resume.resumeText
      };
      
      const rankingIndex = resume.rankings.findIndex(r => r.company.toString() === company._id.toString());
      
      if (rankingIndex !== -1) {
        // Generate new ranking
        const rankings = await generateRankings(resumeData, [company]);
        
        if (rankings.length > 0) {
          resume.rankings[rankingIndex].score = rankings[0].score;
          resume.rankings.sort((a, b) => b.score - a.score);
          
          // Update ranks
          resume.rankings.forEach((ranking, index) => {
            ranking.rank = index + 1;
          });
          
          await resume.save();
        }
      }
    }
    
    res.json(company);
  } catch (error) {
    console.error('Error in updateCompany:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Company not found' });
    }
    
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}


export async function deleteCompany(req, res) {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ msg: 'Company not found' });
    }
    
    await Company.findByIdAndDelete(req.params.id);
    
    await Resume.updateMany(
      { 'rankings.company': req.params.id },
      { $pull: { rankings: { company: req.params.id } } }
    );
    
    const resumes = await Resume.find({ 'rankings.0': { $exists: true } });
    
    for (const resume of resumes) {
      resume.rankings.sort((a, b) => b.score - a.score);
      // Update ranks
      resume.rankings.forEach((ranking, index) => {
        ranking.rank = index + 1;
      });
      
      await resume.save();
    }
    
    res.json({ msg: 'Company removed' });
  } catch (error) {
    console.error('Error in deleteCompany:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Company not found' });
    }
    
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}


export async function getTopResumes(req, res) {
    try {
      const company = await Company.findById(req.params.id);
      
      if (!company) {
        return res.status(404).json({ msg: 'Company not found' });
      }
      
      const resumes = await Resume.find({
        'rankings.company': req.params.id
      })
      .select('name email skills education rankings')
      .sort({ 'rankings.score': -1 });
      
      // Filter and format the results
      const topResumes = resumes.map(resume => {
        const ranking = resume.rankings.find(r => 
          r.company.toString() === req.params.id
        );
        
        return {
          id: resume._id,
          name: resume.name,
          email: resume.email,
          skills: resume.skills,
          education: resume.education,
          score: ranking ? ranking.score : 0,
          rank: ranking ? ranking.rank : null
        };
      });
      
      // Sort by score
      topResumes.sort((a, b) => b.score - a.score);
      
      res.json(topResumes);
    } catch (error) {
      console.error('Error in getTopResumes:', error);
      
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Company not found' });
      }
      
      res.status(500).json({ msg: 'Server error', error: error.message });
    }
  }
  