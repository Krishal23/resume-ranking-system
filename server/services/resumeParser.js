import { runPythonScript } from '../utils/pythonRunner.js';
import { extractTextFromFile } from '../utils/fileExtractor.js';


export const parseResumeText = async (resumeText) => {
  try {
    const result = await runPythonScript('resume_parser.py', [resumeText]);
    return result;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error('Failed to parse resume');
  }
};


export const parseResumeFile = async (filePath) => {
  try {
    // Extract text from file
    const resumeText = await extractTextFromFile(filePath);

    // console.log("parsedddd=resume=>>>>",resumeText)
    const parsedResume = await parseResumeText(resumeText);

    
    return {
      ...parsedResume,
      resumeText
    };
  } catch (error) {
    console.error('Error parsing resume file:', error);
    throw new Error(`Failed to parse resume file: ${error.message}`);
  }
};

