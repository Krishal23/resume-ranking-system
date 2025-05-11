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



// export const generateRankings = async (resumeData, companies) => {
//   try {
//     const newResumeScores = [];

//     for (const company of companies) {
//       const newScore = await generateRankingScore(resumeData, company);

//       newResumeScores.push({
//         companyId: company._id.toString(),
//         companyName: company.name,
//         score: newScore
//       });
//     }

//     const rankings = [];

//     for (const { companyId, companyName, score } of newResumeScores) {
//       // Get all resumes that have ranking for this company
//       const resumes = await Resume.find({ 'rankings.company': companyId });

//       console.log(resumes)
//       // Add the new resume (not saved yet)
//       const allRankings = resumes?.map(r => {
//         const ranking = r?.rankings?.find(rank => rank?.company?.toString() === companyId);
//         return {
//           resume: r,
//           score: ranking?.score || 0
//         };
//       });

//       // Include the current resume being uploaded
//       allRankings.push({
//         resume: null, // null means this is the new resume
//         score
//       });

//       // Sort by score descending
//       allRankings.sort((a, b) => b.score - a.score);

//       // Assign ranks
//       for (let i = 0; i < allRankings.length; i++) {
//         allRankings[i].rank = i + 1;
//       }

//       // Update rankings of existing resumes in DB
//       for (const item of allRankings) {
//         if (item.resume) {
//           const updatedRankings = item.resume.rankings.map(r =>
//             r.company.toString() === companyId
//               ? { ...r.toObject(), score: item.score, rank: item.rank }
//               : r
//           );

//           item.resume.rankings = updatedRankings;
//           await item.resume.save();
//         } else {
//           // This is the new resume
//           rankings.push({
//             company: companyId,
//             companyName,
//             score,
//             rank: item.rank
//           });
//         }
//       }
//     }

//     return rankings;
//   } catch (error) {
//     console.error('❌ Error generating rankings:', error);
//     throw new Error(`Failed to generate rankings: ${error.message}`);
//   }
// };

export const generateRankings = async (resumeData, companies) => {
  try {
    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      throw new Error('No companies provided for ranking');
    }

    const rankings = [];
    const startTime = Date.now();

    // First, calculate scores for the new resume against all companies
    const newResumeScores = [];
    for (const company of companies) {
      if (!company || !company._id) {
        console.warn(`Skipping company with missing ID: ${company?.name || 'Unknown'}`);
        continue;
      }
      
      try {
        console.log(`Calculating score for ${company.name}...`);
        const score = await generateRankingScore(resumeData, company);
        newResumeScores.push({
          company: company,
          score: score
        });
        console.log(`Score for ${company.name}: ${score}`);
      } catch (error) {
        console.error(`Error calculating score for company ${company.name}:`, error);
        continue;
      }
    }

    if (newResumeScores.length === 0) {
      throw new Error('Failed to calculate scores for any company');
    }

    // Get all existing resumes with their rankings in one query
    const companyIds = companies
      .filter(c => c && c._id)
      .map(c => c._id);

    if (companyIds.length === 0) {
      throw new Error('No valid company IDs found');
    }

    const existingResumes = await Resume.find({
      'rankings.company': { $in: companyIds }
    }).select('rankings');

    console.log(`Found ${existingResumes.length} existing resumes with rankings`);

    // Process each company's rankings
    for (const { company, score: newScore } of newResumeScores) {
      if (!company || !company._id) {
        console.warn(`Skipping invalid company data`);
        continue;
      }

      console.log(`\nProcessing rankings for ${company.name}`);
      
      // Get existing scores for this company with proper null checks
      const companyScores = existingResumes
        .map(resume => {
          try {
            if (!resume || !resume.rankings || !Array.isArray(resume.rankings)) {
              return null;
            }

            const ranking = resume.rankings.find(r => {
              if (!r || !r.company) return false;
              if (!company || !company._id) return false;
              
              try {
                // Safely get company ID strings
                let rankingCompanyId = null;
                let currentCompanyId = null;
                
                // Handle different company ID formats
                if (r.company._id) {
                  // It's a populated company object
                  rankingCompanyId = r.company._id.toString();
                } else if (typeof r.company === 'string') {
                  // It's a string ID
                  rankingCompanyId = r.company;
                } else if (r.company.toString) {
                  // It's an ObjectId
                  rankingCompanyId = r.company.toString();
                }
                
                // Get current company ID
                if (company._id.toString) {
                  currentCompanyId = company._id.toString();
                }
                
                if (!rankingCompanyId || !currentCompanyId) {
                  return false;
                }
                
                return rankingCompanyId === currentCompanyId;
              } catch (error) {
                console.warn(`Error comparing company IDs for resume ${resume._id}:`, error);
                return false;
              }
            });

            if (!ranking) return null;

            return {
              resume: resume,
              score: ranking.score || 0
            };
          } catch (error) {
            console.warn(`Error processing resume ${resume._id}:`, error);
            return null;
          }
        })
        .filter(Boolean);

      // Add new resume score
      const allScores = [
        { resume: null, score: newScore },
        ...companyScores
      ];

      if (allScores.length === 0) {
        console.warn(`No valid scores found for ${company.name}`);
        continue;
      }

      // Sort and rank
      allScores.sort((a, b) => b.score - a.score);
      
      let currentRank = 1;
      let currentScore = allScores[0]?.score || 0;
      let skipCount = 0;
      
      for (let i = 0; i < allScores.length; i++) {
        if (allScores[i].score < currentScore) {
          currentRank += skipCount + 1;
          currentScore = allScores[i].score;
          skipCount = 0;
        } else {
          skipCount++;
        }
        allScores[i].rank = currentRank;
      }

      // Store new resume's ranking
      const newResumeRanking = allScores.find(score => score.resume === null);
      if (!newResumeRanking) {
        console.warn(`Could not find new resume ranking for ${company.name}`);
        continue;
      }

      rankings.push({
        company: company._id,
        companyName: company.name,
        score: newResumeRanking.score,
        rank: newResumeRanking.rank,
        totalResumes: allScores.length
      });

      // Update existing resumes' rankings in bulk
      const updates = allScores
        .filter(score => score.resume && score.resume._id)
        .map(score => ({
          updateOne: {
            filter: { _id: score.resume._id },
            update: {
              $set: {
                'rankings.$[elem].score': score.score,
                'rankings.$[elem].rank': score.rank,
                'rankings.$[elem].totalResumes': allScores.length
              }
            },
            arrayFilters: [{ 'elem.company': company._id }]
          }
        }));

      // if (updates.length > 0) {
      //   try {
      //     await Resume.bulkWrite(updates);
      //   } catch (error) {
      //     console.error(`Error updating rankings for ${company.name}:`, error);
      //   }
      // }

      console.log(`Completed ${company.name}: Rank ${newResumeRanking.rank}/${allScores.length} (${Math.round((newResumeRanking.rank / allScores.length) * 100)}%)`);
    }

    const endTime = Date.now();
    console.log(`\nTotal ranking generation time: ${(endTime - startTime) / 1000} seconds`);

    return rankings;
  } catch (error) {
    console.error('❌ Error generating rankings:', error);
    throw new Error(`Failed to generate rankings: ${error.message}`);
  }
};
