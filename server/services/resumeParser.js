import { runPythonScript } from '../utils/pythonRunner';
import { extractTextFromFile } from '../utils/fileExtractor';


const parseResumeText = async (resumeText) => {
  try {
    const result = await runPythonScript('resume_parser.py', [resumeText]);
    return result;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error('Failed to parse resume');
  }
};


const parseResumeFile = async (filePath) => {
  try {
    // Extract text from file
    const resumeText = await extractTextFromFile(filePath);
    
    // Parse the extracted text
    const parsedResume = await parseResumeText(resumeText);
    
    // Add the original text to the parsed data
    return {
      ...parsedResume,
      resumeText
    };
  } catch (error) {
    console.error('Error parsing resume file:', error);
    throw new Error(`Failed to parse resume file: ${error.message}`);
  }
};

export default {
  parseResumeText,
  parseResumeFile
};
