import { runPythonScript } from '../utils/pythonRunner.js';

export const generateRankingScore = async (resumeData, companyData) => {
  try {
    const resumeJson = JSON.stringify(resumeData);
    const companyJson = JSON.stringify(companyData);
    
    const result = await runPythonScript('rank_generator.py', [resumeJson, companyJson]);
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result.score;
  } catch (error) {
    console.error('Error generating ranking score:', error);
    throw new Error(`Failed to generate ranking score: ${error.message}`);
  }
};

export const generateRankings = async (resumeData, companies) => {
  try {
    const rankings = [];
    
    for (const company of companies) {
      const score = await generateRankingScore(resumeData, company);
      
      rankings.push({
        company: company._id,
        companyName: company.name,
        score
      });
    }
    
    // Sort rankings by score 
    rankings.sort((a, b) => b.score - a.score);
    
    // Add rank property
    rankings.forEach((ranking, index) => {
      ranking.rank = index + 1;
    });
    
    return rankings;
  } catch (error) {
    console.error('Error generating rankings:', error);
    throw new Error(`Failed to generate rankings: ${error.message}`);
  }
};


