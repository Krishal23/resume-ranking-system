import Resume from '../models/Resume.js';
import Company from '../models/Company.js';
import { parseResumeFile } from '../services/resumeParser.js';
import { generateRankings } from '../services/rankGenerator.js';
import { existsSync, unlinkSync } from 'fs';


export async function uploadResume(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const filePath = req.file.path;
    
    // Parse the resume
    const parsedResume = await parseResumeFile(filePath);
    
    // Get all companies from the database
    const companies = await Company.find();
    
    if (companies.length === 0) {
      return res.status(404).json({ msg: 'No companies found in the database' });
    }
    
    // Generate rankings for all companies
    // console.log("parsedddd=resume=>>>>",parsedResume)
    const rankings = await generateRankings(parsedResume, companies);
    
    // Check if a resume with this email already exists
    let resume = await Resume.findOne({ email: parsedResume.email });
    let isUpdate = false;
    
    if (resume) {
      // Update existing resume
      isUpdate = true;
      
      // Update resume fields
      resume.name = parsedResume.name || resume.name;
      resume.phone = parsedResume.phone || resume.phone;
      resume.education = parsedResume.education || resume.education;
      resume.skills = parsedResume.skills || resume.skills;
      resume.experience = parsedResume.experience || resume.experience;
      resume.projects = parsedResume.projects || resume.projects;
      resume.rankings = rankings;
      resume.resumeText = parsedResume.resumeText;
      
      // If there was a previous file, delete it
      if (resume.filePath && resume.filePath !== filePath) {
        try {
          fs.unlinkSync(resume.filePath);
        } catch (err) {
          console.error('Error deleting previous resume file:', err);
        }
      }
      
      resume.filePath = filePath;
    } else {
      // Create a new resume
      resume = new Resume({
        name: parsedResume.name || 'Unknown',
        email: parsedResume.email || 'unknown@example.com',
        phone: parsedResume.phone || '',
        education: parsedResume.education || [],
        skills: parsedResume.skills || [],
        experience: parsedResume.experience || [],
        projects: parsedResume.projects || [],
        rankings: rankings,
        resumeText: parsedResume.resumeText,
        filePath: filePath
      });
    }
    
    // Save the resume
    await resume.save();
    
    res.json({
      msg: isUpdate ? 'Resume updated successfully' : 'Resume uploaded and processed successfully',
      resume: {
        id: resume._id,
        name: resume.name,
        email: resume.email,
        rankings: rankings.map(r => ({
          companyName: r.companyName,
          score: r.score,
          rank: r.rank
        }))
      }
    });
  } catch (error) {
    console.error('Error in uploadResume:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}


export async function getResumes(req, res) {
  try {
    const resumes = await Resume.find()
      .select('name email skills rankings createdAt')
      .sort({ createdAt: -1 });
    
    res.json(resumes);
  } catch (error) {
    console.error('Error in getResumes:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}

export async function getResumeById(req, res) {
  try {
    const resume = await Resume.findById(req.params.id)
      .populate('rankings.company', 'name');
    
    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    
    res.json(resume);
  } catch (error) {
    console.error('Error in getResumeById:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}

export async function deleteResume(req, res) {
  try {
    const resume = await Resume.findById(req.params.id);
    
    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    
    // Delete the file if exists
    if (resume.filePath && existsSync(resume.filePath)) {
      unlinkSync(resume.filePath);
    }
    
    await resume.deleteOne(); 
    
    res.json({ msg: 'Resume deleted' });
  } catch (error) {
    console.error('Error in deleteResume:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}
