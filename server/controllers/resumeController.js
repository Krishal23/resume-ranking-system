import Resume from '../models/Resume.js';
import Company from '../models/Company.js';
import { parseResumeFile } from '../services/resumeParser.js';
import { generateRankings } from '../services/rankGenerator.js';
import fs, { existsSync, unlinkSync } from 'fs';
import path from 'path';


const log = {
  info: (message, details) => console.info(JSON.stringify({ level: 'INFO', timestamp: new Date().toISOString(), message, ...details })),
  error: (message, error, details) => console.error(JSON.stringify({ level: 'ERROR', timestamp: new Date().toISOString(), message, error: error?.message, stack: error?.stack, ...details })),
  warn: (message, details) => console.warn(JSON.stringify({ level: 'WARN', timestamp: new Date().toISOString(), message, ...details })),
  debug: (message, details) => console.debug(JSON.stringify({ level: 'DEBUG', timestamp: new Date().toISOString(), message, ...details })), // Typically for development
};



export async function uploadResume(req, res) {
  // Generate a unique ID for this specific operation/request for easier log tracing
  const operationId = `uploadResume-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  log.info('Upload resume request received', { 
    operationId, 
    originalFilename: req.file?.originalname, 
    ip: req.ip 
  });

  try {
    if (!req.file) {
      log.warn('No file uploaded.', { operationId });
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const originalFilename = req.file.originalname;
    const uploadsDir = path.dirname(filePath);
    
    log.info('File details', { 
      operationId, 
      filePath, 
      originalFilename, 
      mimetype: req.file.mimetype, 
      sizeInBytes: req.file.size 
    });

    // Parsing the resume
    log.info('Attempting to parse resume file.', { operationId, filePath });
    const parsedResume = await parseResumeFile(filePath); // This function should have its own robust logging
    log.info('Resume file parsed.', { 
      operationId, 
      emailFound: !!parsedResume.Email_ID, 
      skillsCount: parsedResume.Skills?.length ?? 0,
      projectsCount: parsedResume.No_of_Projects ?? 0
    });

    // Check for email
    if (!parsedResume.Email_ID) {
      log.warn('Failed to extract email from parsed resume.', { operationId, filePath });
      // Clean up the uploaded file as it's not useful
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ msg: 'Failed to extract email from resume' });
    }
    log.info('Email extracted successfully.', { operationId, email: parsedResume.Email_ID });

    // Get all companies
    log.info('Fetching companies from database.', { operationId });
    const companies = await Company.find();
    if (companies.length === 0) {
      log.warn('No companies found in the database.', { operationId });
      return res.status(404).json({ msg: 'No companies found in the database' });
    }
    log.info(`Successfully fetched ${companies.length} companies.`, { operationId });

    // Generate rankings
    log.info('Attempting to generate rankings.', { operationId, email: parsedResume.Email_ID });
    const rankings = await generateRankings(parsedResume, companies); // This function should have its own robust logging
    log.info(`Rankings generated. Count: ${rankings.length}.`, { operationId });

    const nameFromFile = originalFilename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");

    // Mapping resume
    const mappedResume = {
      name: nameFromFile,
      email: parsedResume.Email_ID,
      phone: parsedResume.Mobile_Number || '',
      education: formatEducation(parsedResume, operationId), // Pass operationId for traceability
      skills: Array.isArray(parsedResume.Skills) ? parsedResume.Skills : [],
      experience: parsedResume.Experience === 'Yes' ? [{
        title: 'Experience', // This is placeholder data
        company: 'Unknown',
        description: 'Experience mentioned in resume',
        startDate: new Date(),
        endDate: new Date()
      }] : [],
      projects: formatProjects(parsedResume, operationId), // Pass operationId for traceability
      resumeText: parsedResume.resumeText // Be cautious logging large texts directly
    };
    log.debug('Resume data mapped for database.', { 
      operationId, 
      email: mappedResume.email, 
      name: mappedResume.name, 
      resumeTextLength: mappedResume.resumeText?.length 
    });

    // If a resume with this email already exists
    log.info('Checking for existing resume by email.', { operationId, email: mappedResume.email });
    let resume = await Resume.findOne({ email: mappedResume.email });
    let isUpdate = false;

    if (resume) {
      isUpdate = true;
      log.info('Existing resume found. Preparing for update.', { operationId, resumeId: resume._id });
      
      // Update resume fields
      resume.name = mappedResume.name || resume.name;
      resume.phone = mappedResume.phone || resume.phone;
      resume.education = mappedResume.education || resume.education;
      resume.skills = mappedResume.skills || resume.skills;
      resume.experience = mappedResume.experience || resume.experience;
      resume.projects = mappedResume.projects || resume.projects;
      resume.rankings = rankings;
      resume.resumeText = mappedResume.resumeText;

      // Deleting previous file path if it exists and is different
      if (resume.filePath && resume.filePath !== filePath) {
        log.info('Previous resume file path differs. Attempting deletion.', { 
          operationId, 
          oldFilePath: resume.filePath, 
          newFilePath: filePath 
        });
        try {
          if (fs.existsSync(resume.filePath)) {
            fs.unlinkSync(resume.filePath);
            log.info('Successfully deleted previous resume file.', { operationId, deletedPath: resume.filePath });
          } else {
            log.warn('Previous resume file not found at path for deletion.', { operationId, pathNotFount: resume.filePath });
          }
        } catch (err) {
          log.error('Error deleting previous resume file.', err, { operationId, path: resume.filePath });
          // This is a non-critical error, so we continue.
        }
      }
      resume.filePath = filePath;
      log.info('Resume model updated in memory.', { operationId, resumeId: resume._id });
    } else {
      log.info('No existing resume found. Creating new resume record.', { operationId, email: mappedResume.email });
      resume = new Resume({
        ...mappedResume, // Spread the mapped resume data
        rankings: rankings, // Ensure rankings is part of the new object
        filePath: filePath 
      });
      log.info('New resume model created in memory.', { operationId });
    }

    // Save resume
    log.info(`Attempting to save resume. Action: ${isUpdate ? 'update' : 'create'}.`, { operationId, resumeId: resume._id });
    await resume.save();
    log.info('Resume saved successfully to database.', { operationId, resumeId: resume._id });

    // Prepare response
    const responsePayload = {
      msg: isUpdate ? 'Resume updated successfully' : 'Resume uploaded and processed successfully',
      resume: {
        id: resume._id,
        name: resume.name,
        email: resume.email,
        rankings: rankings.map(r => ({
          companyName: r.companyName || r.company?.name, // Handle if companyName is not directly on r
          score: r.score,
          rank: r.rank
        }))
      }
    };
    log.info('Resume processing complete. Sending success response.', { operationId, resumeId: resume._id });
    res.json(responsePayload);

    // Original code deletes all files in the directory.
    // This might be risky if multiple uploads are processed concurrently to the same directory.
    // A safer approach is to delete only the processed file: `fs.unlinkSync(filePath);`
    // However, to match the original file's behavior:
    log.info(`Attempting to clean up uploads directory: ${uploadsDir}`, { operationId });
    deleteAllFilesInDirectory(uploadsDir, operationId); // Pass operationId

  } catch (error) {
    log.error('Unhandled error in uploadResume controller.', error, { operationId, originalFilename: req.file?.originalname });
    // Attempt to clean up the uploaded file if an error occurred
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        log.info('Uploaded file deleted due to error during processing.', { operationId, filePath: req.file.path });
      } catch (deleteError) {
        log.error('Failed to delete uploaded file after an error.', deleteError, { operationId, filePath: req.file.path });
      }
    }
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}

// Modified to include operationId for logging traceability
function deleteAllFilesInDirectory(directory, operationId) {
  log.info(`Initiating deletion of all files in directory: ${directory}.`, { operationId, function: 'deleteAllFilesInDirectory' });
  try {
    fs.readdir(directory, (err, files) => { // Asynchronous
      if (err) {
        log.error(`Error reading directory ${directory} for deletion.`, err, { operationId });
        return;
      }

      if (files.length === 0) {
        log.info(`No files found in directory ${directory} to delete.`, { operationId });
        return;
      }

      log.info(`Found ${files.length} file(s) to delete in ${directory}.`, { operationId, filesList: files });
      files.forEach(file => {
        const filePathToDelete = path.join(directory, file);
        fs.stat(filePathToDelete, (statErr, stats) => { // Asynchronous
          if (statErr) {
            log.error(`Error getting file stats for ${filePathToDelete}.`, statErr, { operationId });
            return;
          }

          if (stats.isFile()) {
            fs.unlink(filePathToDelete, unlinkErr => { // Asynchronous
              if (unlinkErr) {
                log.error(`Error deleting file ${filePathToDelete}.`, unlinkErr, { operationId });
              } else {
                log.info(`Successfully deleted file: ${filePathToDelete}.`, { operationId });
              }
            });
          } else {
            log.info(`Skipping non-file item during deletion: ${filePathToDelete}.`, { operationId });
          }
        });
      });
    });
  } catch (outerError) { 
    // This catch block will likely not catch errors from async fs operations' callbacks.
    log.error(`Outer error in deleteAllFilesInDirectory for ${directory}. This may not catch async errors.`, outerError, { operationId });
  }
}

// Helper functions: formatEducation and formatProjects
// These should ideally also log using the passed operationId if they perform complex logic or can fail.
function formatEducation(parsedResume, operationId) {
  // log.debug('Formatting education data.', { operationId, parsedBranch: parsedResume.Branch });
  if (!parsedResume.Branch) {
    // log.warn('No branch information for formatting education.', { operationId });
    return [];
  }
  return [{
    degree: 'B.Tech', // Placeholder, ideally extracted
    field: parsedResume.Branch,
    institution: 'Institution', // Placeholder
    gpa: parsedResume['CPI/GPA'] || null,
    year: new Date().getFullYear() // Placeholder, year should be extracted
  }];
}

function formatProjects(parsedResume, operationId) {
  // log.debug('Formatting project data.', { operationId, projectCount: parsedResume.No_of_Projects });
  const projectCount = parsedResume.No_of_Projects || 0;
  const projectKeywords = parsedResume.Project_Keywords || [];
  if (projectCount === 0) {
    return [];
  }
  const projects = [];
  let keywords = Array.isArray(projectKeywords) ? projectKeywords : [];
  for (let i = 0; i < projectCount; i++) {
    const projectKeywordSubset = keywords.slice(
      Math.floor(i * keywords.length / projectCount),
      Math.floor((i + 1) * keywords.length / projectCount)
    );
    projects.push({
      title: `Project ${i + 1}`, // Placeholder
      description: projectKeywordSubset.join(', '),
      technologies: projectKeywordSubset
    });
  }
  return projects;
}


// export async function uploadResume(req, res) {
//   try {

//     console.log("hello from uploadResume");

//     if (!req.file) {
//       return res.status(400).json({ msg: 'No file uploaded' });
//     }

//     const filePath = req.file.path;
//     const uploadsDir = path.dirname(filePath);
    
//     // parsing the resume
//     const parsedResume = await parseResumeFile(filePath);

//     // check for email
//     if (!parsedResume.Email_ID) {
//       return res.status(400).json({ msg: 'Failed to extract email from resume' });
//     }

//     //get all companies
//     const companies = await Company.find();

//     if (companies.length === 0) {
//       return res.status(404).json({ msg: 'No companies found in the database' });
//     }

//     // generate rankings
//     const rankings = await generateRankings(parsedResume, companies);

//     const fileName = req.file.originalname;
//     const nameFromFile = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");

//     // mapping resume
//     const mappedResume = {
//       name: nameFromFile,
//       email: parsedResume.Email_ID,
//       phone: parsedResume.Mobile_Number || '',
//       education: formatEducation(parsedResume),
//       skills: Array.isArray(parsedResume.Skills) ? parsedResume.Skills : [],
//       experience: parsedResume.Experience === 'Yes' ? [{
//         title: 'Experience',
//         company: 'Unknown',
//         description: 'Experience mentioned in resume',
//         startDate: new Date(),
//         endDate: new Date()
//       }] : [],
//       projects: formatProjects(parsedResume),
//       resumeText: parsedResume.resumeText
//     };

//     // if a resume with this email already exists
//     let resume = await Resume.findOne({ email: mappedResume.email });
//     let isUpdate = false;

//     if (resume) {
//       // Update existing resume
//       isUpdate = true;

//       // Update resume fields
//       resume.name = mappedResume.name || resume.name;
//       resume.phone = mappedResume.phone || resume.phone;
//       resume.education = mappedResume.education || resume.education;
//       resume.skills = mappedResume.skills || resume.skills;
//       resume.experience = mappedResume.experience || resume.experience;
//       resume.projects = mappedResume.projects || resume.projects;
//       resume.rankings = rankings;
//       resume.resumeText = mappedResume.resumeText;

//       //deleting file path
//       if (resume.filePath && resume.filePath !== filePath) {
//         try {
//           if (fs.existsSync(resume.filePath)) {
//             fs.unlinkSync(resume.filePath);
//             console.log(`Previous file deleted: ${resume.filePath}`);
//           } else {
//             console.log(`Previous file not found: ${resume.filePath}`);
//           }
//         } catch (err) {
//           console.error('Error deleting previous resume file:', err);
//         }
//       }
      
//       // Store the file path in the database
//       resume.filePath = filePath;
//     } else {
//       resume = new Resume({
//         name: mappedResume.name,
//         email: mappedResume.email,
//         phone: mappedResume.phone,
//         education: mappedResume.education,
//         skills: mappedResume.skills,
//         experience: mappedResume.experience,
//         projects: mappedResume.projects,
//         rankings: rankings,
//         resumeText: mappedResume.resumeText,
//         filePath: filePath 
//       });
//     }

//     // Save 
//     await resume.save();

//     // prepare response
//     const response = {
//       msg: isUpdate ? 'Resume updated successfully' : 'Resume uploaded and processed successfully',
//       resume: {
//         id: resume._id,
//         name: resume.name,
//         email: resume.email,
//         rankings: rankings.map(r => ({
//           companyName: r.companyName,
//           score: r.score,
//           rank: r.rank
//         }))
//       }
//     };

//     res.json(response);
//     deleteAllFilesInDirectory(uploadsDir);

//   } catch (error) {
//     console.error('Error in uploadResume:', error);
//     res.status(500).json({ msg: 'Server error', error: error.message });
//   }
// }


// function deleteAllFilesInDirectory(directory) {
//   try {
//     fs.readdir(directory, (err, files) => {
//       if (err) {
//         console.error(`Error reading directory ${directory}:`, err);
//         return;
//       }

//       files.forEach(file => {
//         const filePath = path.join(directory, file);

//         fs.stat(filePath, (statErr, stats) => {
//           if (statErr) {
//             console.error(`Error getting file stats for ${filePath}:`, statErr);
//             return;
//           }
          
//           if (stats.isFile()) {
//             // Delete the file
//             fs.unlink(filePath, unlinkErr => {
//               if (unlinkErr) {
//                 console.error(`Error deleting file ${filePath}:`, unlinkErr);
//               } else {
//                 console.log(`Deleted file: ${filePath}`);
//               }
//             });
//           }
//         });
//       });
//     });
//   } catch (error) {
//     console.error(`Error cleaning directory ${directory}:`, error);
//   }
// }


// //format education data
// function formatEducation(parsedResume) {
//   if (!parsedResume.Branch) {
//     return [];
//   }

//   return [{
//     degree: 'B.Tech', // Assuming degree type based on common pattern
//     field: parsedResume.Branch,
//     institution: 'Institution',
//     gpa: parsedResume['CPI/GPA'] || null,
//     year: new Date().getFullYear() 
//   }];
// }

// // format projects data
// function formatProjects(parsedResume) {
//   const projectCount = parsedResume.No_of_Projects || 0;
//   const projectKeywords = parsedResume.Project_Keywords || [];

//   if (projectCount === 0) {
//     return [];
//   }

//   // placeholder projects based on count
//   const projects = [];

//   // If we have keywords, distribute them among projects
//   let keywords = Array.isArray(projectKeywords) ? projectKeywords : [];

//   for (let i = 0; i < projectCount; i++) {
//     // Get a subset of keywords for this project
//     const projectKeywordSubset = keywords.slice(
//       Math.floor(i * keywords.length / projectCount),
//       Math.floor((i + 1) * keywords.length / projectCount)
//     );

//     projects.push({
//       title: `Project ${i + 1}`,
//       description: projectKeywordSubset.join(', '),
//       technologies: projectKeywordSubset
//     });
//   }

//   return projects;
// }

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
