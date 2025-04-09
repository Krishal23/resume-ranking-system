import json
import sys

def calculate_score(resume_data, company_data):
    weights = {
        'skills': 0.35,
        'education': 0.25,
        'projects': 0.25,
        'experience': 0.15
    }
    
    skills_score = score_skills(resume_data.get('Skill_Set', []), 
                                 company_data.get('Skill_Set', []),
                                 company_data.get('Core_Skills', []))

    education_score = score_education([
        {
            "degree": resume_data.get("Branch", ""),
            "gpa": resume_data.get("CPI", 0)
        }
    ],
    company_data.get('CPI', 0),
    company_data.get('Branch', []))

    projects_score = score_projects([
        {
            "description": " ".join(resume_data.get("Project_Keywords", []))
        }
    ] * resume_data.get("Projects", 0),
    company_data.get('Min_Projects', 0),
    company_data.get('Project_Keywords', []))

    experience_score = score_experience([
        {}  # dummy objects just to count experience
    ] * resume_data.get("Experience", 0))

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
    
    resume_skills_lower = [s.lower() for s in resume_skills]
    company_skills_lower = [s.lower() for s in company_skills]
    core_skills_lower = [s.lower() for s in core_skills] if core_skills else []

    skill_matches = sum(1 for s in company_skills_lower if s in resume_skills_lower)
    core_skill_matches = sum(1 for s in core_skills_lower if s in resume_skills_lower)

    skill_score = (skill_matches / len(company_skills_lower)) * 70 if company_skills_lower else 0
    core_score = (core_skill_matches / len(core_skills_lower)) * 30 if core_skills_lower else 0

    return skill_score + core_score

def score_education(education, min_cpi, required_branches):
    if not education:
        return 0

    highest_gpa = max([e.get('gpa', 0) for e in education])
    cpi_score = 70 if highest_gpa >= min_cpi else (highest_gpa / min_cpi) * 70 if min_cpi else 0

    branch_score = 0
    for edu in education:
        degree = edu.get('degree', '').lower()
        for branch in required_branches:
            if branch.lower() in degree:
                branch_score = 30
                break

    return cpi_score + branch_score

def score_projects(projects, min_projects, keywords):
    if not projects:
        return 0

    count_score = 50 if len(projects) >= min_projects else (len(projects) / min_projects) * 50 if min_projects else 0

    keyword_matches = 0
    for proj in projects:
        desc = proj.get('description', '').lower()
        for kw in keywords:
            if kw.lower() in desc:
                keyword_matches += 1

    keyword_score = min(50, (keyword_matches / len(keywords)) * 50) if keywords else 50

    return count_score + keyword_score

def score_experience(experience):
    if not experience:
        return 0
    if len(experience) >= 3:
        return 100
    elif len(experience) == 2:
        return 80
    elif len(experience) == 1:
        return 60
    return 0

# =====================
# MAIN
# =====================

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python rank_generator.py <resume.json> <company.json>"}))
        sys.exit(1)

    try:
        with open(sys.argv[1], 'r') as f:
            resume_data = json.load(f)
        with open(sys.argv[2], 'r') as f:
            company_data = json.load(f)

        score = calculate_score(resume_data, company_data)
        print(json.dumps({"score": score}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
