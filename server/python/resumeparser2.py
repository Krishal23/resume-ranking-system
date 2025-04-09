import re
import json
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

# Download necessary NLTK resources
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

def parse_resume(text):
    # Extract sections from the resume
    sections = extract_sections(text)
    
    # Parse each section
    name = extract_name(text)
    contact_info = extract_contact_info(text)
    education = extract_education(sections.get('education', ''))
    skills = extract_skills(sections.get('skills', ''))
    projects = extract_projects(sections.get('projects', ''))
    achievements = extract_achievements(sections.get('responsibilities & achievements', ''))
    
    result = {
        "name": name,
        "email": contact_info.get('email', ''),
        "phone": contact_info.get('phone', ''),
        "github": contact_info.get('github', ''),
        "linkedin": contact_info.get('linkedin', ''),
        "education": education,
        "skills": skills,
        "projects": projects,
        "achievements": achievements
    }
    
    return result

def extract_sections(text):
    """Extract different sections from the resume text"""
    sections = {}
    
    # Common section headers in resumes
    section_patterns = [
        (r'education', 'education'),
        (r'skills\s*/?\s*relevant\s*coursework', 'skills'),
        (r'projects', 'projects'),
        (r'experience', 'experience'),
        (r'responsibilities\s*&?\s*achievements', 'responsibilities & achievements'),
        (r'certifications', 'certifications'),
        (r'awards', 'awards')
    ]
    
    # Split the text into lines
    lines = text.split('\n')
    current_section = None
    section_content = []
    
    for line in lines:
        # Check if this line is a section header
        is_header = False
        for pattern, section_name in section_patterns:
            if re.search(pattern, line.lower()):
                # If we were already in a section, save it
                if current_section:
                    sections[current_section] = '\n'.join(section_content)
                
                # Start a new section
                current_section = section_name
                section_content = []
                is_header = True
                break
        
        if not is_header and current_section:
            section_content.append(line)
    
    # Add the last section
    if current_section:
        sections[current_section] = '\n'.join(section_content)
    
    return sections

def extract_name(text):
    """Extract the name from the resume"""
    lines = text.split('\n')
    if lines and lines[0].strip():
        return lines[0].strip()
    return "Unknown"

def extract_contact_info(text):
    """Extract contact information (email, phone, GitHub, LinkedIn)"""
    contact_info = {}
    
    # Email pattern
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    email_match = re.search(email_pattern, text)
    if email_match:
        contact_info['email'] = email_match.group(0)
    
    # Phone pattern
    phone_pattern = r'(\+\d{1,3}[-.\s]?)?(\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{4}|\(\d{3,4}\)[-.\s]?\d{3,4}[-.\s]?\d{4})'
    phone_match = re.search(phone_pattern, text)
    if phone_match:
        contact_info['phone'] = phone_match.group(0)
    
    # GitHub pattern
    github_pattern = r'github\.com/([A-Za-z0-9_-]+)'
    github_match = re.search(github_pattern, text, re.IGNORECASE)
    if github_match:
        contact_info['github'] = f"github.com/{github_match.group(1)}"
    
    # LinkedIn pattern
    linkedin_pattern = r'linkedin\.com/in/([A-Za-z0-9_-]+)'
    linkedin_match = re.search(linkedin_pattern, text, re.IGNORECASE)
    if linkedin_match:
        contact_info['linkedin'] = f"linkedin.com/in/{linkedin_match.group(1)}"
    
    return contact_info

def extract_education(education_text):
    """Extract education details"""
    education = []
    
    # Split into different education entries
    entries = re.split(r'\n\s*•\s*', education_text)
    
    for entry in entries:
        if not entry.strip():
            continue
        
        edu_entry = {}
        
        # Extract institution
        institution_pattern = r'(.*?)\s*(?:Patna|Prayagraj|Bihar|Uttar Pradesh)'
        institution_match = re.search(institution_pattern, entry)
        if institution_match:
            edu_entry['institution'] = institution_match.group(1).strip()
        
        # Extract degree
        degree_pattern = r'B\.Tech in ([^,]+)'
        degree_match = re.search(degree_pattern, entry)
        if degree_match:
            edu_entry['degree'] = f"B.Tech in {degree_match.group(1).strip()}"
        
        # Extract CPI/GPA
        cpi_pattern = r'CPI\s*:\s*(\d+\.\d+)'
        cpi_match = re.search(cpi_pattern, entry)
        if cpi_match:
            edu_entry['cpi'] = float(cpi_match.group(1))
        
        # Extract percentage for school
        percentage_pattern = r'(\d+)th \((\d+)\): (\d+\.\d+)%'
        percentage_matches = re.findall(percentage_pattern, entry)
        if percentage_matches:
            percentages = {}
            for match in percentage_matches:
                percentages[f"{match[0]}th"] = float(match[2])
            edu_entry['percentages'] = percentages
        
        # Extract year
        year_pattern = r'(\d{4}(?:\s*–\s*Present)?)'
        year_match = re.search(year_pattern, entry)
        if year_match:
            edu_entry['year'] = year_match.group(1)
        
        if edu_entry:
            education.append(edu_entry)
    
    return education

def extract_skills(skills_text):
    """Extract skills and coursework"""
    skills = {}
    
    # Extract programming languages
    prog_lang_pattern = r'Programming Languages\s*:\s*([^•]+)'
    prog_lang_match = re.search(prog_lang_pattern, skills_text, re.IGNORECASE)
    if prog_lang_match:
        languages = [lang.strip() for lang in re.split(r'[,.]', prog_lang_match.group(1)) if lang.strip()]
        skills['programming_languages'] = languages
    
    # Extract frameworks
    frameworks_pattern = r'Frameworks\s*:\s*([^•]+)'
    frameworks_match = re.search(frameworks_pattern, skills_text, re.IGNORECASE)
    if frameworks_match:
        frameworks = [fw.strip() for fw in re.split(r'[,.]', frameworks_match.group(1)) if fw.strip()]
        skills['frameworks'] = frameworks
    
    # Extract tools
    tools_pattern = r'Tools\s*:\s*([^•]+)'
    tools_match = re.search(tools_pattern, skills_text, re.IGNORECASE)
    if tools_match:
        tools = [tool.strip() for tool in re.split(r'[,.]', tools_match.group(1)) if tool.strip()]
        skills['tools'] = tools
    
    # Extract core courses
    core_courses_pattern = r'Core Courses\s*:\s*([^•]+)'
    core_courses_match = re.search(core_courses_pattern, skills_text, re.IGNORECASE)
    if core_courses_match:
        courses = [course.strip() for course in re.split(r'[,.]', core_courses_match.group(1)) if course.strip()]
        skills['core_courses'] = courses
    
    # Extract mathematics
    math_pattern = r'Mathematics\s*:\s*([^•]+)'
    math_match = re.search(math_pattern, skills_text, re.IGNORECASE)
    if math_match:
        math_skills = [math.strip() for math in re.split(r'[,.]', math_match.group(1)) if math.strip()]
        skills['mathematics'] = math_skills
    
    # Extract libraries
    libraries_pattern = r'Libraries\s*:\s*([^•]+)'
    libraries_match = re.search(libraries_pattern, skills_text, re.IGNORECASE)
    if libraries_match:
        libraries = [lib.strip() for lib in re.split(r'[,.]', libraries_match.group(1)) if lib.strip()]
        skills['libraries'] = libraries
    
    # Extract soft skills
    soft_skills_pattern = r'Soft Skills\s*:\s*([^•]+)'
    soft_skills_match = re.search(soft_skills_pattern, skills_text, re.IGNORECASE)
    if soft_skills_match:
        soft_skills = [skill.strip() for skill in re.split(r'[,.]', soft_skills_match.group(1)) if skill.strip()]
        skills['soft_skills'] = soft_skills
    
    return skills

def extract_projects(projects_text):
    """Extract project details"""
    projects = []
    
    # Split into different project entries
    entries = re.split(r'\n\s*•\s*', projects_text)
    
    for entry in entries:
        if not entry.strip():
            continue
        
        project = {}
        
        # Extract project title and URL
        title_pattern = r'(.*?)(?:\s+–\s+|\s*-\s*)(.*?)(?:\s+|\n)'
        title_match = re.search(title_pattern, entry)
        if title_match:
            project['title'] = title_match.group(1).strip()
            project['subtitle'] = title_match.group(2).strip()
        
        # Extract URL if present
        url_pattern = r'([a-z0-9.-]+\.[a-z]{2,}(?:/[^\s]*)?)'
        url_match = re.search(url_pattern, entry)
        if url_match:
            project['url'] = url_match.group(1)
        
        # Extract organization and year
        org_year_pattern = r'(IIT Patna|EDU GRANTORS)\s*(\d{4})'
        org_year_match = re.search(org_year_pattern, entry)
        if org_year_match:
            project['organization'] = org_year_match.group(1)
            project['year'] = org_year_match.group(2)
        
        # Extract project details (bullet points)
        details_pattern = r'–\s*(.*?)(?=–|\n\n|$)'
        details_matches = re.findall(details_pattern, entry)
        if details_matches:
            project['details'] = [detail.strip() for detail in details_matches]
        
        # Extract technologies used
        tech_pattern = r'using\s+([^.]+)'
        tech_match = re.search(tech_pattern, entry, re.IGNORECASE)
        if tech_match:
            technologies = [tech.strip() for tech in re.split(r'[,\s]and\s', tech_match.group(1)) if tech.strip()]
            project['technologies'] = technologies
        
        if project:
            projects.append(project)
    
    return projects

def extract_achievements(achievements_text):
    """Extract achievements and responsibilities"""
    achievements = []
    
    # Split into different achievement entries
    entries = re.split(r'\n\s*•\s*', achievements_text)
    
    for entry in entries:
        if not entry.strip():
            continue
        
        achievement = {}
        
        # Extract title and description
        title_desc_pattern = r'(.*?):\s*(.*)'
        title_desc_match = re.search(title_desc_pattern, entry)
        if title_desc_match:
            achievement['title'] = title_desc_match.group(1).strip()
            achievement['description'] = title_desc_match.group(2).strip()
        else:
            achievement['description'] = entry.strip()
        
        # Extract metrics if present
        metrics_pattern = r'(\d+(?:,\d+)?(?:\.\d+)?(?:\+|\s*%)?)'
        metrics_matches = re.findall(metrics_pattern, entry)
        if metrics_matches:
            achievement['metrics'] = metrics_matches
        
        if achievement:
            achievements.append(achievement)
    
    return achievements

if __name__ == "__main__":
    # For testing with the provided resume text
    resume_text = """Kushal Kesharwani
Email: kushal_2301mc57@iitp.ac.inGitHub:github.com/Krishal23
Phone: +91-6306243407LinkedIn:linkedin.com/in/kushal-kesharwani-49000525b/
Education
•
Indian Institute of Technology (IIT) PatnaPatna, Bihar
B.Tech in Mathematics and Computing, Minor in Computer Science and EngineeringAugust 2023 – Present   
–CPI:8.06
•
St. Thomas School, Handia, PrayagrajPrayagraj, Uttar Pradesh
12th (2022): 94.4%, 10th (2020): 95%2022
SKILLS / RELEVANT COURSEWORK
•Programming Languages:C++,Python, JavaScript.
•Frameworks:React, Node.js, MongoDB, Express.js, Next.js.
•Tools:Git, Postman, MongoDB Compass, Tailwind CSS.
•Core Courses:Algorithms, Discrete Mathematics, Machine Learning, Data Science, Real Analysis, Database
Management Systems.
•Mathematics:Probability and Random Processes, Linear Algebra, Complex analysis.
•Libraries: scikit-learn, Keras, Pandas, NumPy.
•Soft Skills: Leadership, Event Management, Writing, Public Speaking.
Projects
•
LINK IITP – Course-Notes-Portallink.iitp.ac.in
IIT Patna2024
–Engineereda RESTful API using Express.js and MongoDB, reducing database query times by 40% .
– Developedsecure admin authorization protocols to efficiently manage course materials.
– IntegratedCloudinary for optimized storage, ensuring rapid access to digital resources.
– Collaboratedin both frontend and backend development, achieving a seamless user experience.
•
Official Website for Infinito 2024infinito.iitp.ac.in
IIT Patna2024
–Constructeda responsive and scalable website for IIT Patna's annual sports fest, attracting over5000visitors.
– Integratedreal-time event updates that improved user accessibility by35%.
– Optimizedwebsite performance by reducing load times by40%using React and Vanilla CSS.
•
EduGRANTORS – LMS Platformedugrantors.in
EDU GRANTORS2024
–Engineereda comprehensive Learning Management System using Next.js, MongoDB, Express, and Tailwind   
CSS, streamlining digital learning.
– Designedand implemented a robust role-based authentication system across three user levels: Student, Teacher,
and Admin.
– Integratedadvanced features for study material sharing, video lectures, and real-time notifications to enhance
user engagement.
– Optimizedsystem performance and fortified security to efficiently manage multiple users.
Responsibilities & Achievements
•JEE Advanced 2023:Secured an All India Rank of 6584 out of more than 1.7 million candidates.
•Inter-IIT Cult Meet 7.0:Part of the core organizing committee, ensuring smooth execution for 3500+ participants.
•Responsibilities:Led digital, technical, and financial operations as Sub-coordinator for MPR Committee, Web Dev
Committee, Finance Club, and NJACK Dev and OS at IIT Patna (2024)."""
    
    result = parse_resume(resume_text)
    print(json.dumps(result, indent=2))
