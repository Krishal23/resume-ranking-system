import {  spawn } from 'child_process';
import { join,dirname } from 'path';
import { fileURLToPath } from 'url'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const runPythonScript = (scriptName, args = []) => {
  return new Promise((resolve, reject) => {
    const scriptPath = join(__dirname, '..', 'python', scriptName);
    const pythonProcess = spawn('python', [scriptPath, ...args]);
    
    let result = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        console.error(`Error output: ${errorOutput}`);
        reject(new Error(`Python script exited with code ${code}: ${errorOutput}`));
        return;
      }
      
      try {
        // Find the JSON part of the output (starts with "{")
        const jsonStart = result.indexOf('{');
        if (jsonStart === -1) {
          throw new Error('No JSON found in output');
        }
        
        // Extract only the JSON part
        const jsonString = result.substring(jsonStart);
        
        // For debugging
        console.log("Attempting to parse JSON:", jsonString.substring(0, 100) + "...");
        
        const parsedResult = JSON.parse(jsonString);
        resolve(parsedResult);
      } catch (error) {
        console.error('Failed to parse Python script output:', error);
        console.error('Raw output first 200 chars:', result.substring(0, 200));
        reject(new Error(`Failed to parse Python script output: ${error.message}`));
      }
    });
  });
};
