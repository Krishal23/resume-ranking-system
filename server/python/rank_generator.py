import sys
import json
import re

def calculate_score(resume_data, company_data):
    # print(resume_data)
    # Weight factors for different criteria
    weights = {
        'skills': 0.35,
        'education': 0.25,
        'projects': 0.25,
        'experience': 0.15
    }
    
    # Calculate individual component scores
    skills_score = score_skills(
        resume_data.get('Skill_Set', []), 
        company_data.get('Skill_Set', []),
        company_data.get('Core_Skills', [])
    )
    
    education_score = score_education(
        resume_data.get('CPI', 0), 
        company_data.get('CPI', 0),
        company_data.get('Branch', []),
        resume_data.get('Branch', '')
    )
    
    projects_score = score_projects(
        resume_data.get('Projects', 0), 
        company_data.get('Min_Projects', 0),
        company_data.get('Project_Keywords', []),
        resume_data.get('Project_Keywords', [])
    )
    
    experience_score = score_experience(resume_data.get('Experience', 0))
    
    # Calculate weighted total score
    total_score = (
        weights['skills'] * skills_score +
        weights['education'] * education_score +
        weights['projects'] * projects_score +
        weights['experience'] * experience_score
    )
    
    return round(total_score, 2)

def score_skills(resume_skills, company_skills, core_skills):
    if not resume_skills or not company_skills:
        return 0
    
    # Convert to lowercase for case-insensitive matching
    resume_skills_lower = [skill.lower() for skill in resume_skills]
    company_skills_lower = [skill.lower() for skill in company_skills]
    core_skills_lower = [skill.lower() for skill in core_skills] if core_skills else []
    
    # Count matches
    skill_matches = sum(1 for skill in company_skills_lower if skill in resume_skills_lower)
    core_skill_matches = sum(1 for skill in core_skills_lower if skill in resume_skills_lower)
    
    # Calculate score
    skill_score = (skill_matches / len(company_skills_lower)) * 70 if company_skills_lower else 0
    core_skill_score = 0
    if core_skills_lower:
        core_skill_score = (core_skill_matches / len(core_skills_lower)) * 30
    
    return skill_score + core_skill_score

def score_education(cpi, min_cpi, required_branches, resume_branch):
    if not cpi:
        return 0
    
    # CPI score (70%)
    if cpi >= min_cpi:
        cpi_score = 70
    else:
        cpi_ratio = cpi / min_cpi if min_cpi > 0 else 0
        cpi_score = cpi_ratio * 70
    
    # Branch score (30%)
    branch_score = 0
    if required_branches:
        resume_branch_lower = resume_branch.lower() if resume_branch else ""
        for branch in required_branches:
            if isinstance(branch, str) and (branch.lower() in resume_branch_lower or resume_branch_lower in branch.lower()):
                branch_score = 30
                break
    else:
        branch_score = 30
    
    return cpi_score + branch_score

def score_projects(project_count, min_projects, company_keywords, resume_keywords):
    if project_count == 0:
        return 0
    
    # Project count score (50%)
    if project_count >= min_projects:
        project_count_score = 50
    else:
        project_ratio = project_count / min_projects if min_projects > 0 else 0
        project_count_score = project_ratio * 50
    
    # Project keywords score (50%)
    keyword_score = 0
    if company_keywords:
        company_keywords_lower = [kw.lower() for kw in company_keywords]
        resume_keywords_lower = [kw.lower() for kw in resume_keywords]
        
        keyword_matches = sum(1 for kw in company_keywords_lower if any(kw in rk for rk in resume_keywords_lower))
        keyword_score = min(50, (keyword_matches / len(company_keywords)) * 50) if len(company_keywords) > 0 else 50
    else:
        keyword_score = 50
    
    return project_count_score + keyword_score

def score_experience(experience_count):
    if experience_count >= 3:
        return 100
    elif experience_count == 2:
        return 80
    elif experience_count == 1:
        return 60
    else:
        return 0

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments. Usage: python rank_generator.py <resume_json> <company_json>"}))
        sys.exit(1)
    
    try:
        resume_data = json.loads(sys.argv[1])
        company_data = json.loads(sys.argv[2])
        # print(resume_data)
        
        score = calculate_score(resume_data, company_data)
        print(json.dumps({"score": score}))
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON: {str(e)}"}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
