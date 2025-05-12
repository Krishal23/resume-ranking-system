import Resume from '../models/Resume.js';
import Company from '../models/Company.js';
import { parseResumeFile } from '../services/resumeParser.js';
import { generateRankings } from '../services/rankGenerator.js';
import fs, { existsSync, unlinkSync } from 'fs';
import path from 'path';



export async function uploadResume(req, res) {
  try {

    console.log("hello from uploadResume");

    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const uploadsDir = path.dirname(filePath);
    
    // parsing the resume
    const parsedResume = await parseResumeFile(filePath);

    // check for email
    if (!parsedResume.Email_ID) {
      return res.status(400).json({ msg: 'Failed to extract email from resume' });
    }

    //get all companies
    const companies = await Company.find();

    if (companies.length === 0) {
      return res.status(404).json({ msg: 'No companies found in the database' });
    }

    // generate rankings
    const rankings = await generateRankings(parsedResume, companies);

    const fileName = req.file.originalname;
    const nameFromFile = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");

    // mapping resume
    const mappedResume = {
      name: nameFromFile,
      email: parsedResume.Email_ID,
      phone: parsedResume.Mobile_Number || '',
      education: formatEducation(parsedResume),
      skills: Array.isArray(parsedResume.Skills) ? parsedResume.Skills : [],
      experience: parsedResume.Experience === 'Yes' ? [{
        title: 'Experience',
        company: 'Unknown',
        description: 'Experience mentioned in resume',
        startDate: new Date(),
        endDate: new Date()
      }] : [],
      projects: formatProjects(parsedResume),
      resumeText: parsedResume.resumeText
    };

    // if a resume with this email already exists
    let resume = await Resume.findOne({ email: mappedResume.email });
    let isUpdate = false;

    if (resume) {
      // Update existing resume
      isUpdate = true;

      // Update resume fields
      resume.name = mappedResume.name || resume.name;
      resume.phone = mappedResume.phone || resume.phone;
      resume.education = mappedResume.education || resume.education;
      resume.skills = mappedResume.skills || resume.skills;
      resume.experience = mappedResume.experience || resume.experience;
      resume.projects = mappedResume.projects || resume.projects;
      resume.rankings = rankings;
      resume.resumeText = mappedResume.resumeText;

      //deleting file path
      if (resume.filePath && resume.filePath !== filePath) {
        try {
          if (fs.existsSync(resume.filePath)) {
            fs.unlinkSync(resume.filePath);
            console.log(`Previous file deleted: ${resume.filePath}`);
          } else {
            console.log(`Previous file not found: ${resume.filePath}`);
          }
        } catch (err) {
          console.error('Error deleting previous resume file:', err);
        }
      }
      
      // Store the file path in the database
      resume.filePath = filePath;
    } else {
      resume = new Resume({
        name: mappedResume.name,
        email: mappedResume.email,
        phone: mappedResume.phone,
        education: mappedResume.education,
        skills: mappedResume.skills,
        experience: mappedResume.experience,
        projects: mappedResume.projects,
        rankings: rankings,
        resumeText: mappedResume.resumeText,
        filePath: filePath 
      });
    }

    // Save 
    await resume.save();

    // prepare response
    const response = {
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
    };

    res.json(response);
    deleteAllFilesInDirectory(uploadsDir);

  } catch (error) {
    console.error('Error in uploadResume:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}


function deleteAllFilesInDirectory(directory) {
  try {
    fs.readdir(directory, (err, files) => {
      if (err) {
        console.error(`Error reading directory ${directory}:`, err);
        return;
      }

      files.forEach(file => {
        const filePath = path.join(directory, file);

        fs.stat(filePath, (statErr, stats) => {
          if (statErr) {
            console.error(`Error getting file stats for ${filePath}:`, statErr);
            return;
          }
          
          if (stats.isFile()) {
            // Delete the file
            fs.unlink(filePath, unlinkErr => {
              if (unlinkErr) {
                console.error(`Error deleting file ${filePath}:`, unlinkErr);
              } else {
                console.log(`Deleted file: ${filePath}`);
              }
            });
          }
        });
      });
    });
  } catch (error) {
    console.error(`Error cleaning directory ${directory}:`, error);
  }
}


//format education data
function formatEducation(parsedResume) {
  if (!parsedResume.Branch) {
    return [];
  }

  return [{
    degree: 'B.Tech', // Assuming degree type based on common pattern
    field: parsedResume.Branch,
    institution: 'Institution',
    gpa: parsedResume['CPI/GPA'] || null,
    year: new Date().getFullYear() 
  }];
}

// format projects data
function formatProjects(parsedResume) {
  const projectCount = parsedResume.No_of_Projects || 0;
  const projectKeywords = parsedResume.Project_Keywords || [];

  if (projectCount === 0) {
    return [];
  }

  // placeholder projects based on count
  const projects = [];

  // If we have keywords, distribute them among projects
  let keywords = Array.isArray(projectKeywords) ? projectKeywords : [];

  for (let i = 0; i < projectCount; i++) {
    // Get a subset of keywords for this project
    const projectKeywordSubset = keywords.slice(
      Math.floor(i * keywords.length / projectCount),
      Math.floor((i + 1) * keywords.length / projectCount)
    );

    projects.push({
      title: `Project ${i + 1}`,
      description: projectKeywordSubset.join(', '),
      technologies: projectKeywordSubset
    });
  }

  return projects;
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
