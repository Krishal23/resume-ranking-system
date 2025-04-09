import { runPythonScript } from '../utils/pythonRunner.js';

export const generateRankingScore = async (resumeData, companyData) => {
  // console.log(resumeData)
  try {
    const transformedCompanyData = {
      Company_Name: companyData.name,
      CPI: companyData.cpi,
      Skill_Set: companyData.skillSet,
      Min_Projects: companyData.minProjects,
      Project_Keywords: companyData.projectKeywords,
      Branch: companyData.branch,
      Core_Skills: companyData.coreSkills
    };
    
    const transformedResumeData = {
      CPI: resumeData.education && resumeData.education.length > 0 ? 
           Math.max(...resumeData.education.map(edu => edu.gpa || 0)) : 0,
      Skill_Set: new Set(resumeData.skills || []),
      Projects: resumeData.projects ? resumeData.projects.length : 0,
      Project_Keywords: new Set(resumeData.projects ? 
                            resumeData.projects.flatMap(p => p.technologies || []) : []),
      Mobile: resumeData.phone || "",
      Email: resumeData.email || "",
      Experience: resumeData.experience ? resumeData.experience.length : 0,
      Core_Skills: new Set(resumeData.skills || []),
      Branch: resumeData.education && resumeData.education.length > 0 ? 
              resumeData.education[0].degree : ""
    };

    // console.log("Resume DAta=>>>>",transformedResumeData)
    // console.log("Company Data=>>>",transformedCompanyData)
    
    const resumeJson = JSON.stringify(transformedResumeData);
    const companyJson = JSON.stringify(transformedCompanyData);
    
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


