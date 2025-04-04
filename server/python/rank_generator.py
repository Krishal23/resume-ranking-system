import sys
import json
import re

def calculate_score(resume_data, company_data):
    total_score = 0
    
    # Weight factors for different criteria
    weights = {
        'skills': 0.35,
        'education': 0.25,
        'projects': 0.25,
        'experience': 0.15
    }
    
    # Score skills match (35%)
    skills_score = score_skills(resume_data.get('skills', []), 
                               company_data.get('skillSet', []),
                               company_data.get('coreSkills', []))
    
    # Score education match (25%)
    education_score = score_education(resume_data.get('education', []), 
                                     company_data.get('cpi', 0),
                                     company_data.get('branch', []))
    
    # Score projects match (25%)
    projects_score = score_projects(resume_data.get('projects', []), 
                                   company_data.get('minProjects', 0),
                                   company_data.get('projectKeywords', []))
    
    # Score experience (15%)
    experience_score = score_experience(resume_data.get('experience', []))
    
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
    skill_score = (skill_matches / len(company_skills_lower)) * 70
    core_skill_score = 0
    if core_skills_lower:
        core_skill_score = (core_skill_matches / len(core_skills_lower)) * 30
    
    return skill_score + core_skill_score

def score_education(education, min_cpi, required_branches):
    if not education:
        return 0
    
    education_score = 0
    
    highest_gpa = 0
    for edu in education:
        if edu.get('gpa', 0) > highest_gpa:
            highest_gpa = edu.get('gpa', 0)
    
    if highest_gpa >= min_cpi:
        cpi_score = 70
    else:
        cpi_ratio = highest_gpa / min_cpi if min_cpi > 0 else 0
        cpi_score = cpi_ratio * 70
    
    branch_score = 0
    if required_branches:
        for edu in education:
            degree = edu.get('degree', '').lower()
            for branch in required_branches:
                if branch.lower() in degree:
                    branch_score = 30
                    break
    else:
        branch_score = 30
    
    return cpi_score + branch_score

def score_projects(projects, min_projects, project_keywords):
    if not projects:
        return 0
    
    project_count_score = 0
    if len(projects) >= min_projects:
        project_count_score = 50
    else:
        project_ratio = len(projects) / min_projects if min_projects > 0 else 0
        project_count_score = project_ratio * 50
    
    keyword_score = 0
    if project_keywords:
        keyword_matches = 0
        for project in projects:
            project_desc = project.get('description', '').lower()
            for keyword in project_keywords:
                if keyword.lower() in project_desc:
                    keyword_matches += 1
        
        keyword_score = min(50, (keyword_matches / len(project_keywords)) * 50)
    else:
        keyword_score = 50
    
    return project_count_score + keyword_score

def score_experience(experience):
    if not experience:
        return 0
    
    if len(experience) >= 3:
        return 100
    elif len(experience) == 2:
        return 80
    elif len(experience) == 1:
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
        
        score = calculate_score(resume_data, company_data)
        print(json.dumps({"score": score}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
