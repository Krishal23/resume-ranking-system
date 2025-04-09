import sys
import json
import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

def parse_resume(text):

    # Basic preprocessing
    text = text.lower()
    tokens = word_tokenize(text)
    stop_words = set(stopwords.words('english'))
    filtered_tokens = [w for w in tokens if w not in stop_words]
    

    name = extract_name(text)
    email = extract_email(text)
    phone = extract_phone(text)
    education = extract_education(text)
    skills = extract_skills(text)
    experience = extract_experience(text)
    projects = extract_projects(text)
    
    result = {
        "name": name,
        "email": email,
        "phone": phone,
        "education": education,
        "skills": skills,
        "experience": experience,
        "projects": projects
    }
    
    return result

def extract_name(text):
    lines = text.split('\n')
    if lines and len(lines[0].strip()) > 0:
        return lines[0].strip().title()
    return "Unknown"

def extract_email(text):
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    match = re.search(email_pattern, text)
    if match:
        return match.group(0)
    return ""

def extract_phone(text):
    phone_pattern = r'(\+\d{1,3}[-.\s]?)?(\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\(\d{3}\)[-.\s]?\d{3}[-.\s]?\d{4})'
    match = re.search(phone_pattern, text)
    if match:
        return match.group(0)
    return ""

def extract_education(text):
    education = []
    education_keywords = ['bachelor', 'master', 'phd', 'b.tech', 'm.tech', 'btech', 'mtech', 'b.e', 'b.s', 'm.s']

    # In a further implementation, we would use NER or more sophisticated techniques
    for keyword in education_keywords:
        if keyword in text:
            # Find the sentence containing the keyword
            sentences = re.split(r'[.!?]', text)
            for sentence in sentences:
                if keyword in sentence:
                    # Extract degree, institution, and year
                    degree = keyword.title()
                    institution = "Unknown"
                    year = "Unknown"
                    gpa = 0.0
                    
                    gpa_match = re.search(r'(?:gpa|cgpa)[:\s]*(\d+\.\d+)', sentence, re.IGNORECASE)
                    if gpa_match:
                        gpa = float(gpa_match.group(1))
                    
                    education.append({
                        "degree": degree,
                        "institution": institution,
                        "year": year,
                        "gpa": gpa
                    })
    
    return education

def extract_skills(text):
    common_skills = [
        'python', 'java', 'javascript', 'c++', 'c#', 'react', 'node.js', 'angular',
        'vue', 'html', 'css', 'sql', 'nosql', 'mongodb', 'mysql', 'postgresql',
        'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'machine learning',
        'deep learning', 'data science', 'tensorflow', 'pytorch', 'nlp', 'ai',
        'devops', 'ci/cd', 'jenkins', 'linux', 'unix', 'bash', 'agile', 'scrum'
    ]
    
    skills = []
    for skill in common_skills:
        if re.search(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE):
            skills.append(skill)
    
    return skills

def extract_experience(text):
    # experience extraction
    experience = []
    
    experience_keywords = ['experience', 'work', 'employment', 'job']
    for keyword in experience_keywords:
        if keyword in text:
            # section containing experience
            sections = text.split('\n\n')
            for section in sections:
                if keyword in section.lower():
                    # Extract company, position, and duration
                    lines = section.split('\n')
                    if len(lines) >= 2:
                        company = lines[0].strip()
                        position = lines[1].strip()
                        duration = "Unknown"
                        description = " ".join(lines[2:]) if len(lines) > 2 else ""
                        
                        experience.append({
                            "company": company,
                            "position": position,
                            "duration": duration,
                            "description": description
                        })
    
    return experience

def extract_projects(text):
    projects = []
    
    project_keywords = ['project', 'projects']
    for keyword in project_keywords:
        if keyword in text:
            # Find the section containing projects
            sections = text.split('\n\n')
            for section in sections:
                if keyword in section.lower():
                    # Extract project details
                    lines = section.split('\n')
                    if len(lines) >= 2:
                        title = lines[0].strip()
                        description = " ".join(lines[1:])
                        
                        technologies = []
                        tech_keywords = ['using', 'with', 'technologies', 'tech stack']
                        for tech_keyword in tech_keywords:
                            if tech_keyword in description.lower():
                                tech_part = description.lower().split(tech_keyword)[1].strip()
                                tech_list = re.split(r'[,;]', tech_part)
                                technologies = [tech.strip() for tech in tech_list if tech.strip()]
                                break
                        
                        projects.append({
                            "title": title,
                            "description": description,
                            "technologies": technologies
                        })
    
    return projects

if __name__ == "__main__":
    # Get resume text 
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No resume text provided"}))
        sys.exit(1)
    
    resume_text = sys.argv[1]
    result = parse_resume(resume_text)
    # print(result)

    print(json.dumps(result))
