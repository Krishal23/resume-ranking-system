import { spawn } from 'child_process';
import { join } from 'path';

const runPythonScript = (scriptName, args = []) => {
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
        const parsedResult = JSON.parse(result);
        resolve(parsedResult);
      } catch (error) {
        console.error('Failed to parse Python script output:', error);
        reject(new Error(`Failed to parse Python script output: ${result}`));
      }
    });
  });
};

export default {
  runPythonScript
};
