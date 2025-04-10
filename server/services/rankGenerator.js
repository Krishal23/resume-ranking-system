import { runPythonScript } from '../utils/pythonRunner.js';
import Resume from '../models/Resume.js';



export const generateRankingScore = async (resumeData, companyData) => {
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

    // console.log(resumeData)
  
    const transformedResumeData = {
      CPI: resumeData['CPI/GPA'] || 0,
      Skill_Set: new Set(resumeData.Skills || []),
      Projects: resumeData.No_of_Projects || 0,
      Project_Keywords: new Set(resumeData.Project_Keywords || []),
      Mobile: resumeData.Mobile_Number || "",
      Email: resumeData.Email_ID || "",
      Experience: resumeData.Experience === 'Yes' ? 1 : 0,
      Core_Skills: new Set(resumeData.Core_Computer_Skills ? 
        resumeData.Core_Computer_Skills.split(',').map(skill => skill.trim()) : []),
      Branch: resumeData.Branch || ''
    };
    

    // console.log(transformedResumeData)

    //preparing json
    const prepareForJSON = (obj) => {
      const result = {};

      for (const [key, value] of Object.entries(obj)) {
        if (value instanceof Set) {
          result[key] = Array.from(value);
        } else {
          result[key] = value;
        }
      }

      return result;
    };

    const jsonReadyResumeData = prepareForJSON(transformedResumeData);
    const jsonReadyCompanyData = prepareForJSON(transformedCompanyData);

    // stringify
    const resumeJson = JSON.stringify(jsonReadyResumeData);
    const companyJson = JSON.stringify(jsonReadyCompanyData);

    const result = await runPythonScript('rank_generator.py', [resumeJson, companyJson]);
    console.log(result)
    
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
    const newResumeScores = [];

    for (const company of companies) {
      const newScore = await generateRankingScore(resumeData, company);

      newResumeScores.push({
        companyId: company._id.toString(),
        companyName: company.name,
        score: newScore
      });
    }

    const rankings = [];

    for (const { companyId, companyName, score } of newResumeScores) {
      // Get all resumes that have ranking for this company
      const resumes = await Resume.find({ 'rankings.company': companyId });

      // Add the new resume (not saved yet)
      const allRankings = resumes.map(r => {
        const ranking = r.rankings.find(rank => rank.company.toString() === companyId);
        return {
          resume: r,
          score: ranking?.score || 0
        };
      });

      // Include the current resume being uploaded
      allRankings.push({
        resume: null, // null means this is the new resume
        score
      });

      // Sort by score descending
      allRankings.sort((a, b) => b.score - a.score);

      // Assign ranks
      for (let i = 0; i < allRankings.length; i++) {
        allRankings[i].rank = i + 1;
      }

      // Update rankings of existing resumes in DB
      for (const item of allRankings) {
        if (item.resume) {
          const updatedRankings = item.resume.rankings.map(r =>
            r.company.toString() === companyId
              ? { ...r.toObject(), score: item.score, rank: item.rank }
              : r
          );

          item.resume.rankings = updatedRankings;
          await item.resume.save();
        } else {
          // This is the new resume
          rankings.push({
            company: companyId,
            companyName,
            score,
            rank: item.rank
          });
        }
      }
    }

    return rankings;
  } catch (error) {
    console.error('❌ Error generating rankings:', error);
    throw new Error(`Failed to generate rankings: ${error.message}`);
  }
};

