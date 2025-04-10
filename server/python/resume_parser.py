import os
import re
import json
import sys
from PyPDF2 import PdfReader
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import pandas as pd
import spacy
from torch import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Ensure all required NLTK resources are downloaded
try:
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')
    nltk.download('omw-1.4')  
except Exception as e:
    print(f"Warning: Failed to download NLTK resources: {e}")


try:
    nlp = spacy.load("en_core_web_sm")
except:
    print("Downloading spaCy model...")
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

class EnhancedResumeParser:
    def __init__(self):
        # Defining skill set list from provided data
        self.skill_set_list = [
            # Programming Languages
            'java', 'python', 'c++', 'c#', 'javascript', 'html', 'css', 'php', 'sql', 'r', 'apex',
            'swift', 'kotlin', 'rust', 'typescript', 'perl', 'scala', 'go', 'ruby', 'matlab',
            # Tools and Frameworks
            'aws', 'amazon web services', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins',
            'git', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring boot',
            'hibernate', 'asp.net', '.net', 'tensorflow', 'pytorch', 'keras', 'salesforce',
            'tableau', 'power bi', 'excel', 'microsoft excel',
            # Databases
            'mysql', 'postgresql', 'mongodb', 'oracle', 'cassandra', 'redis', 'sqlite',
            # Concepts
            'artificial intelligence', 'ai', 'machine learning', 'ml', 'data science',
            'deep learning', 'natural language processing', 'nlp', 'computer vision',
            'cloud computing', 'devops', 'development operations', 'automation', 'cybersecurity',
            'networking', 'data analysis', 'data structures', 'algorithms', 'oop', 'object-oriented programming',
            'database management', 'embedded systems', 'internet of things', 'iot', 'rest api',
            'web development', 'full-stack', 'front-end', 'back-end', 'agile', 'scrum',
            'user interface', 'ui', 'user experience', 'ux', 'testing', 'qa', 'quality assurance',
            'security', 'risk analysis', 'risk management', 'data analytics', 'big data',
            'business intelligence', 'seo', 'sem', 'digital marketing', 'consulting', 'audit',
            'finance', 'banking', 'automotive', 'electrical engineering', 'mechanical engineering',
            'civil engineering', 'chemical engineering', 'petroleum engineering',
            # Domain-specific
            'consulting', 'automobile engineering', 'banking', 'information technology',
            'chemical engineering', 'civil', 'mechanical', 'cloud computing', 'cybersecurity',
            'data analysis', 'structured query language', 'embedded systems', 'energy',
            'finance', 'risk analysis', 'trading', 'gas pipeline engineering', 'salesforce lightning',
            'salesforce visualforce', 'digital transformation', 'business analysis',
            'strategic planning', 'process improvement', 'technical consulting', 'troubleshooting',
            'system integration', 'design thinking', 'prototyping', 'engineering fundamentals',
            'process engineering', 'research', 'technical analysis', 'communication', 'curriculum design',
            'teaching', 'analytical skills', 'computer-aided design', 'teamwork', 'client management',
            'coordination', 'electrical engineering', 'product development', 'market research',
            'credit risk', 'financial modeling', 'advanced programming', 'digital solutions',
            'electronics design', 'circuit analysis', 'debugging', 'business development', 'sales',
            'engineering', 'metallurgy', 'technical problem solving', 'engineering skills',
            'technical design', 'project management', 'technical proficiency', 'automotive technology',
            'threat analysis', 'information technology infrastructure', 'system administration',
            'system programming', 'operating system', 'graphics processing unit', 'gpu',
            'search engine optimization', 'seo', 'search engine marketing', 'sem', 'revenue management',
            'research and development', 'innovation', 'android development', 'software/hardware integration',
            'object-oriented programming', 'process optimization', 'system design', 'information technology strategy',
            'digital transformation', 'enterprise architecture', 'power systems', 'html', 'cascading style sheets', 'css',
            'responsive design', 'industrial automation', 'rest application programming interfaces',
            'representational state transfer', 'marketing', 'networking', 'node.js', 'django',
            'oil and gas', 'power systems'
        ]

        # Organize skills into categories for better recognition
        self.skill_categories = {
            'programming_languages': ['java', 'python', 'c++', 'c#', 'javascript', 'typescript', 'php', 'ruby', 'perl',
                                     'scala', 'swift', 'kotlin', 'r', 'matlab', 'go', 'rust', 'cobol', 'fortran', 'bash',
                                     'powershell', 'assembly', 'lisp', 'prolog', 'dart', 'apex'],

            'web_development': ['html', 'css', 'javascript', 'react', 'angular', 'vue', 'django', 'flask', 'node.js',
                               'express', 'php', 'laravel', 'symfony', 'ruby on rails', 'bootstrap', 'jquery', 'asp.net',
                               'spring mvc', 'wordpress', 'gatsby', 'sass', 'less', 'webpack', 'babel'],

            'data_science': ['python', 'r', 'sql', 'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy',
                            'matplotlib', 'seaborn', 'tableau', 'power bi', 'excel', 'spss', 'sas', 'hadoop', 'spark',
                            'big data', 'data mining', 'data analytics', 'statistical analysis', 'machine learning', 'ai',
                            'deep learning', 'nlp', 'computer vision'],

            'databases': ['sql', 'mysql', 'postgresql', 'oracle', 'sql server', 'mongodb', 'cassandra', 'redis',
                         'dynamodb', 'firebase', 'neo4j', 'sqlite', 'mariadb', 'couchdb', 'dbms', 'database management'],

            'cloud_devops': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab',
                            'terraform', 'ansible', 'puppet', 'chef', 'bitbucket', 'jira', 'confluence', 'ci/cd',
                            'cloud computing', 'devops', 'microservices', 'serverless'],

            'mobile_development': ['android', 'ios', 'swift', 'kotlin', 'flutter', 'react native', 'xamarin',
                                  'mobile app development', 'objective-c', 'cordova', 'ionic'],

            'system_concepts': ['algorithms', 'data structures', 'oop', 'design patterns', 'architecture', 'system design',
                               'microservices', 'restful api', 'soap', 'graphql', 'mvc', 'mvvm', 'operating systems',
                               'networking', 'distributed systems', 'concurrency', 'multithreading', 'memory management'],

            'cybersecurity': ['security', 'encryption', 'cryptography', 'penetration testing', 'ethical hacking',
                             'firewall', 'vpn', 'intrusion detection', 'malware analysis', 'siem', 'forensics',
                             'cybersecurity', 'network security', 'authentication', 'authorization'],

            'business_finance': ['finance', 'accounting', 'banking', 'trading', 'investment', 'risk management',
                                'credit risk', 'financial modeling', 'fintech', 'blockchain', 'cryptocurrency',
                                'consulting', 'audit', 'compliance', 'business analysis', 'strategic planning']
        }

        # Add project keywords from the provided data
        self.project_keywords_list = [
            'ai', 'ml', 'rpa', 'python', 'automation', 'audit', 'financial analysis', 'risk assessment',
            'cad', 'solidworks', 'vehicle dynamics', 'dsa', 'java', 'aws', 'system design', 'data analysis',
            'finance', 'sql', 'risk analysis', 'tech', 'data security', 'chemical simulation', 'matlab',
            'oil & gas', 'structural design', 'autocad', 'construction', 'azure', '.net', 'javascript',
            'kubernetes', 'devops', 'docker', 'cloud', 'web dev', 'react', 'business analysis', 'excel',
            'power bi', 'networking', 'cybersecurity', 'firewalls', 'r', 'big data', 'oop', 'software development',
            'competitive programming', 'dbms', 'oracle', 'embedded c', 'hardware', 'iot', 'fpga', 'microcontrollers',
            'vlsi', 'renewable energy', 'scada', 'data visualization', 'tableau', 'fintech', 'quantitative analysis',
            'risk modeling', 'risk assessment', 'investment banking', 'power systems', 'electrical engineering',
            'salesforce', 'crm', 'apex programming', 'full stack', 'digital strategy', 'analytics', 'it consulting',
            'business strategy', 'process optimization', 'it systems', 'technical support', 'erp', 'energytech',
            'system design', 'research', 'visualization', 'debugging', 'git', 'software dev', 'prototyping',
            'design thinking', 'ux research', 'process engineering', 'industrial safety', 'technical research',
            'wireless networks', 'telecom', 'curriculum design', 'teaching', 'problem-solving', 'mechanical design',
            'engineering design', 'product development', 'client communication', 'market analysis', 'control systems',
            'market research', 'credit risk', 'agile development', 'full-stack', 'process safety', 'pcb design',
            'debugging', 'sdlc', 'sales strategies', 'metallurgical analysis', 'material science', 'material testing',
            'civil engineering', 'construction management', 'automotive engineering', 'automotive software',
            'business intelligence', 'political analytics', 'business operations', 'network security', 'ethical hacking',
            'siem', 'cloud computing', 'system administration', 'cuda', 'gpu computing', 'os', 'seo', 'sem',
            'google ads', 'marketing analytics', 'revenue optimization', 'teaching skills', 'curriculum development',
            'r&d', 'innovation', 'engineering design', 'android', 'kotlin', 'ui/ux', 'software-hardware integration',
            'financial modeling', 'algorithm', 'c++', 'data analysis', 'electrical', 'power systems', 'energy engineering',
            'project planning', 'customer service', 'territory management', 'html', 'css', 'responsive design',
            'industrial automation', 'robotics', 'embedded systems', 'ai/ml', 'software engineering', 'rest apis',
            'r&d', 'software development', 'data analysis', 'system design', 'web development', 'testing',
            'marketing', 'product design', 'it solutions', 'sql', 'chemical engineering', 'petroleum engineering',
            'energy', 'dsa', 'algorithms', 'system design', 'software development', 'software engineering',
            'risk management', 'banking', 'finance', 'sap', 'consulting', 'it services', 'qa', 'digital design',
            'javascript'
        ]

        # Branch mapping with standardized names and aliases
        self.branch_mapping = {
            'Computer Science': ['cse', 'computer science', 'computer science and engineering', 'cs', 'computer',
                                'computer engineering', 'software engineering', 'computation', 'computing'],
            'Information Technology': ['it', 'information technology', 'information systems', 'information science'],
            'Electronics and Communication': ['ece', 'electronics and communication', 'electronics', 'communication engineering',
                                             'electronics and communication engineering', 'electronic engineering'],
            'Electrical Engineering': ['ee', 'electrical', 'electrical engineering', 'electrical and electronics',
                                      'eee', 'electrical and electronics engineering', 'power systems'],
            'Mechanical Engineering': ['mech', 'mechanical', 'mechanical engineering', 'mechanics'],
            'Civil Engineering': ['civil', 'civil engineering', 'structural engineering'],
            'Chemical Engineering': ['chem', 'chemical', 'chemical engineering', 'chemistry engineering'],
            'Petroleum Engineering': ['petroleum', 'petro', 'petroleum engineering', 'oil and gas'],
            'Aerospace Engineering': ['aerospace', 'aeronautical', 'aeronautical engineering', 'aerospace engineering'],
            'Automobile Engineering': ['automobile', 'automotive engineering', 'automotive'],
            'Mathematics and Computing': ['maths & computing', 'mathematics and computing', 'mathematical computing',
                                         'math and cs', 'mathematics and computer science']
        }

        # Core computer skills mapping
        self.core_computer_skills = {
            'OS': ['operating system', 'os', 'windows', 'linux', 'unix', 'macos', 'android', 'ios', 'embedded os',
                  'real-time os', 'rtos', 'operating systems', 'system administration'],
            'Networks': ['networking', 'network', 'tcp/ip', 'dns', 'dhcp', 'router', 'switch', 'firewall', 'vpn',
                        'lan', 'wan', 'network security', 'network administration', 'cisco', 'network architecture'],
            'DBMS': ['database management system', 'dbms', 'sql', 'mysql', 'postgresql', 'oracle', 'mongodb',
                    'database design', 'er diagram', 'normalization', 'acid', 'transaction', 'sql server', 'nosql',
                    'database administration', 'data modeling'],
            'OOP': ['object oriented programming', 'oop', 'object-oriented', 'inheritance', 'polymorphism',
                   'encapsulation', 'abstraction', 'class', 'object', 'java', 'c++', 'c#', 'design patterns'],
            'Computer Architecture': ['computer architecture', 'processor design', 'memory hierarchy', 'cache',
                                    'pipelining', 'instruction sets', 'cpu', 'alu', 'von neumann', 'harvard architecture',
                                    'risc', 'cisc', 'assembly language', 'microprocessors']
        }

        # Improved CGPA/GPA patterns
        self.gpa_patterns = [
            r'(?:cgpa|cpi|gpa)\s*[:/]?\s*(\d+\.\d+)[/\s]*\d+',
            r'(?:cgpa|cpi|gpa)(?:\s*|\:)(\d+\.\d+)',
            r'(\d+\.\d+)\s*\/\s*10',
            r'(\d+\.\d+)(?:\s*/\s*|\s+out\s+of\s+)(?:10|4)',
            r'(\d+\.\d+)[/]?[10]?',
            r'cgpa\s*[-:/]?\s*(\d+\.\d+)',
            r'(\d+\.\d+)\s*/\s*10',
            r'(?<=cgpa).*?(\d+\.\d+)',
            r'(?<=cpi).*?(\d+\.\d+)',
            r'(?<=gpa).*?(\d+\.\d+)',
            r'\b(\d+\.\d+)\/10\b',
            r'upto\s+\d+\/10\s+sem\)?[\s:]*(\d+\.\d+)\/10',
            r'awarded\s+grade\s+(\d+)\/10'
        ]

        # Specific patterns for tables in academic sections
        self.table_gpa_patterns = [
            r'(?:cgpa|cpi|gpa)[^\d]*(\d+\.\d+)\/10',
            r'(\d+\.\d+)\/10',
            r'grade\s+(\d+)\/10'
        ]

        self.email_pattern = r'[\w\.-]+@[\w\.-]+\.\w+'

        self.phone_patterns = [
            r'(?:\+\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
            r'(?:\+\d{1,3}[-.\s]?)?\d{10,12}',
            r'(?:\+\d{1,3}[-.\s]?)?\d{3,4}[-.\s]?\d{3}[-.\s]?\d{4}'
        ]

        # Convert all lists to lowercase for case-insensitive matching
        self.skill_set_list = [skill.lower() for skill in self.skill_set_list]
        self.project_keywords_list = [keyword.lower() for keyword in self.project_keywords_list]

        for category in self.skill_categories:
            self.skill_categories[category] = [skill.lower() for skill in self.skill_categories[category]]

        for branch, aliases in self.branch_mapping.items():
            self.branch_mapping[branch] = [alias.lower() for alias in aliases]

        for skill, keywords in self.core_computer_skills.items():
            self.core_computer_skills[skill] = [keyword.lower() for keyword in keywords]

    def preprocess_text(self, text):
       if not text:
           return ""

       # Convert to lowercase
       text = text.lower()

       # Replace special characters with space (fix the regex)
       text = re.sub(r'[^\w\s]', ' ', text)  # Keep alphanumeric and whitespace

       # Replace multiple spaces with a single space
       text = re.sub(r'\s+', ' ', text)

       return text.strip()


    def extract_text_from_pdf(self, pdf_path):
        try:
            reader = PdfReader(pdf_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            print(f"Error extracting text from {pdf_path}: {e}")
            return ""


    # [All the other methods remain the same]

    def extract_gpa(self, text):
        text = text.lower()

        # First look for academic/education sections
        academic_section_patterns = [
            r'academic(?:\s+profile|\s+qualifications?)(?:\s*:|:?\s*\n)(.*?)(?:\n\s*\n|\n\s*[A-Z]|\Z)',
            r'education(?:\s*:|:?\s*\n)(.*?)(?:\n\s*\n|\n\s*[A-Z]|\Z)',
            r'(?:qualification|degree)(?:\s*:|:?\s*\n)(.*?)(?:\n\s*\n|\n\s*[A-Z]|\Z)'
        ]

        academic_sections = []
        for pattern in academic_section_patterns:
            sections = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)
            academic_sections.extend(sections)

        # Create a combined section text
        section_text = "\n".join(academic_sections) if academic_sections else text

        # Try table patterns first in academic sections
        for pattern in self.table_gpa_patterns:
            match = re.search(pattern, section_text, re.IGNORECASE)
            if match:
                try:
                    gpa = float(match.group(1))
                    return gpa
                except ValueError:
                    continue

        # Try all patterns in academic sections
        for pattern in self.gpa_patterns:
            match = re.search(pattern, section_text, re.IGNORECASE)
            if match:
                try:
                    gpa = float(match.group(1))
                    # Convert if it looks like a 4.0 scale
                    if gpa <= 4.0 and gpa > 0 and '/4' in section_text:
                        return gpa * 2.5
                    return gpa
                except ValueError:
                    continue

        # If not found in academic sections, try the full text
        for pattern in self.gpa_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    gpa = float(match.group(1))
                    # Convert if it looks like a 4.0 scale
                    if gpa <= 4.0 and gpa > 0 and '/4' in text:
                        return gpa * 2.5
                    return gpa
                except ValueError:
                    continue

        # Look for integers that might be CGPA as 10/10
        grade_match = re.search(r'grade\s+(\d+)\/10', text, re.IGNORECASE)
        if grade_match:
            try:
                return float(grade_match.group(1))
            except ValueError:
                pass

        return None

    # [Other extraction methods remain the same]
    def extract_skills(self, text):
        text = self.preprocess_text(text)
        found_skills = set()
        doc = nlp(text)

        # 1. Extract skills explicitly mentioned in skills sections
        skills_section_patterns = [
            r'(?:technical\s+)?skills\s*:(.+?)(?:\n\s*\n|\n\s*[A-Z]|\Z)',
            r'(?:technical\s+)?skills(?:\s+include)?(?:\s*:|:?\s*\n)(.*?)(?:\n\s*\n|\n\s*[A-Z]|\Z)',
            r'(?:technologies|programming\s+languages|languages|tools|frameworks|platforms)(?:\s*:|:?\s*\n)(.*?)(?:\n\s*\n|\n\s*[A-Z]|\Z)'
        ]

        skills_sections = []
        for pattern in skills_section_patterns:
            sections = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)
            skills_sections.extend(sections)

        # Create a combined section text
        section_text = " ".join(skills_sections) if skills_sections else text

        # 2. Direct pattern matching for skills in our list
        for skill in self.skill_set_list:
            # Create a word boundary pattern and search
            if re.search(r'\b' + re.escape(skill) + r'\b', section_text, re.IGNORECASE):
                found_skills.add(skill)

        # 3. Use entity recognition for unlisted skills
        for sent in doc.sents:
            for token in sent:
                # Check for programming languages, technologies, and tools
                if token.pos_ in ['NOUN', 'PROPN'] and token.text.lower() not in stopwords.words('english'):
                    if token.text.lower() in self.skill_set_list:
                        found_skills.add(token.text.lower())
                    # Special handling for multi-word technologies
                    elif token.i < len(doc) - 1 and (token.text + " " + doc[token.i + 1].text).lower() in self.skill_set_list:
                        found_skills.add((token.text + " " + doc[token.i + 1].text).lower())

        # 4. Check for skills by category for better organization
        for category, category_skills in self.skill_categories.items():
            for skill in category_skills:
                if re.search(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE):
                    found_skills.add(skill)

        return list(found_skills)

    def extract_branch(self, text):
      text = self.preprocess_text(text)

      # Extract education section
      education_section_patterns = [
          r'education(?:\s*:|:?\s*\n)(.*?)(?:\n\s*\n|\n\s*[A-Z]|\Z)',
          r'academic(?:\s+qualification|\s+background)?(?:\s*:|:?\s*\n)(.*?)(?:\n\s*\n|\n\s*[A-Z]|\Z)',
          r'qualification(?:\s*:|:?\s*\n)(.*?)(?:\n\s*\n|\n\s*[A-Z]|\Z)'
      ]

      education_sections = []
      for pattern in education_section_patterns:
          sections = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)
          education_sections.extend(sections)

      section_text = " ".join(education_sections) if education_sections else text

      # PRIORITY 1: Check for complete phrases in context of degree
      degree_context_patterns = [
          r'(?:bachelor|master|b\.tech|m\.tech|b\.e|m\.e|degree)[^\n]*(?:in|of)[^\n]*([\w\s&]+)',
          r'(?:major|specialization|branch|discipline)[^\n]*(?:in|of)[^\n]*([\w\s&]+)'
      ]

      for pattern in degree_context_patterns:
          matches = re.findall(pattern, section_text, re.IGNORECASE)
          for match in matches:
              match_text = match.strip().lower()
              # Check each branch with all its aliases
              for branch_name, aliases in self.branch_mapping.items():
                  for alias in aliases:
                      if alias in match_text:
                          # If multiple aliases match, pick the longest one to ensure specificity
                          if len(alias.split()) > 1:  # Multi-word match has priority
                              return branch_name

      # PRIORITY 2: Check for exact multi-word matches in branch aliases
      all_matched_branches = []
      for branch_name, aliases in self.branch_mapping.items():
          for alias in aliases:
              if len(alias.split()) > 1 and re.search(r'\b' + re.escape(alias) + r'\b', section_text, re.IGNORECASE):
                  all_matched_branches.append((branch_name, alias, len(alias)))

      # Sort matches by length of the alias (longer matches first)
      if all_matched_branches:
          all_matched_branches.sort(key=lambda x: x[2], reverse=True)
          return all_matched_branches[0][0]  # Return the branch with longest matching alias

      # PRIORITY 3: If still no match, then fall back to single-word matching
      all_single_matches = []
      for branch_name, aliases in self.branch_mapping.items():
          for alias in aliases:
              if len(alias.split()) == 1 and re.search(r'\b' + re.escape(alias) + r'\b', section_text, re.IGNORECASE):
                  all_single_matches.append((branch_name, alias))

      # If single matches found, prioritize Computer Science last (it's often a false positive)
      if all_single_matches:
          non_cs_matches = [match for match in all_single_matches if match[0] != 'Computer Science']
          if non_cs_matches:
              return non_cs_matches[0][0]
          return all_single_matches[0][0]

      # Default branch detection (if nothing else matched)
      return None

    def count_projects(self, text):
      # Normalize text
      text = re.sub(r'\s+', ' ', text)
      text = text.replace('\n', ' <NL> ').lower()

      # STAGE 1: Document Structure Analysis
      # Extract project sections with flexible boundary detection
      project_section_patterns = [
          r'(?:<NL>|\s+|^)(?:projects?|academic\s+projects?|technical\s+projects?|selected\s+work)(?:\s*:|<NL>)(.*?)(?:<NL>\s*(?:[a-z0-9]*\s*[a-z]*\s*(?:education|experience|skills|achievements|awards|publications|certifications|references|activities|additional|interests|languages))|$)',
          r'(?:<NL>|\s+|^)(?:projects?\s+experience|project\s+work|portfolio|initiatives?)(?:\s*:|<NL>)(.*?)(?:<NL>\s*(?:[a-z0-9]*\s*[a-z]*\s*(?:education|experience|skills|achievements|awards|publications|certifications|references|activities|additional|interests|languages))|$)'
      ]

      project_section = None
      for pattern in project_section_patterns:
          match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
          if match:
              project_section = match.group(1)
              break

      analysis_text = project_section if project_section else text

      # STAGE 2: Multi-Strategy Detection with Weighted Confidence
      confidence_scores = {}

      # Strategy 1: Section Header Pattern Analysis (30% weight)
      header_patterns = [
          r'(?:<NL>|\s+)(?:m\.?tech|b\.?tech|undergraduate|master\'?s|senior|final\s+year)\s+project',
          r'(?:<NL>|\s+)design\s+lab',
          r'(?:<NL>|\s+)(?:research|course|major|minor|team)\s+project',
          r'(?:<NL>|\s+)project\s+\d+',
          r'(?:<NL>|\s+)capstone(?:\s+project)?'
      ]

      header_count = 0
      for pattern in header_patterns:
          matches = re.findall(pattern, analysis_text)
          header_count += len(matches)

      if header_count > 0:
          confidence_scores['section_header'] = (header_count, 0.30)

      # Strategy 2: Title-Year Pattern Matching (25% weight)
      title_patterns = [
          r'(?:<NL>|\s+)title\s*:\s*([^<NL>]{10,})',
          r'(?:<NL>|\s+)project\s*(?:title|name)\s*:\s*([^<NL>]{10,})',
          r'(?:<NL>|\s+|^)(?:[•\*\-]\s*)?([A-Z][^<NL>]{10,})(?=<NL>|:\s*(?:20|19)\d{2}|,\s*(?:20|19)\d{2})'
      ]

      title_count = 0
      for pattern in title_patterns:
          matches = re.findall(pattern, analysis_text, re.IGNORECASE)
          title_count += len([t for t in matches if len(t.strip()) > 10 and not re.search(r'\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\b', t.lower())])

      if title_count > 0:
          confidence_scores['title_year'] = (title_count, 0.25)

      # Strategy 3: Bullet Structure Pattern (20% weight)
      bullet_pattern = r'(?:<NL>\s*)[•\*\-]\s+[^<NL>]+'
      bullet_matches = re.findall(bullet_pattern, analysis_text)

      # Group bullets into clusters by proximity
      bullet_clusters = []
      current_cluster = []
      last_pos = -1

      for bullet in bullet_matches:
          curr_pos = analysis_text.find(bullet)
          if last_pos == -1 or curr_pos - last_pos < 300:  # Close enough to be same project
              current_cluster.append(bullet)
          else:
              if len(current_cluster) >= 2:  # Need multiple bullets for a project
                  bullet_clusters.append(current_cluster)
              current_cluster = [bullet]
          last_pos = curr_pos + len(bullet)

      if current_cluster and len(current_cluster) >= 2:
          bullet_clusters.append(current_cluster)

      if bullet_clusters:
          bullet_count = len(bullet_clusters)
          confidence_scores['bullet_structure'] = (bullet_count, 0.20)

      # Strategy 4: Project Verb Analysis (15% weight)
      action_verbs = [
          r'\bdeveloped\b', r'\bimplemented\b', r'\bdesigned\b', r'\bcreated\b',
          r'\bbuilt\b', r'\bauthored\b', r'\bengineered\b', r'\bconducted\b',
          r'\barchitected\b', r'\bprogrammed\b', r'\bresearched\b', r'\banalyzed\b'
      ]

      verb_contexts = []
      for verb in action_verbs:
          contexts = re.findall(r'[^.!?<NL>]{5,100}' + verb + r'[^.!?<NL>]{5,100}', analysis_text)
          for context in contexts:
              if len(context) > 40:  # Substantial context
                  verb_contexts.append(context)

      # Deduplicate similar contexts
      unique_contexts = []
      for context in verb_contexts:
          if not any(self._text_similarity(context, existing) > 0.6 for existing in unique_contexts):
              unique_contexts.append(context)

      if unique_contexts:
          # Cap at reasonable number
          verb_count = min(len(unique_contexts), 8)
          confidence_scores['project_verbs'] = (verb_count, 0.15)

      # Strategy 5: Supervision/Guide Pattern (20% weight)
      guide_patterns = [
          r'(?:<NL>|\s+)(?:guide|supervisor|advisor)\s*:\s*(?:prof\.?|dr\.?)?',
          r'(?:<NL>|\s+)(?:mentor|professor|instructor)\s*:\s*'
      ]

      guide_count = 0
      for pattern in guide_patterns:
          guide_matches = re.findall(pattern, analysis_text)
          guide_count += len(guide_matches)

      if guide_count > 0:
          confidence_scores['guide_pattern'] = (guide_count, 0.20)

      # Strategy 6: Date Pattern Analysis (15% weight)
      date_patterns = [
          r'(?:<NL>|\s+)(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\'?(?:\d{2}|\d{4})\s*-\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present|current|now)',
          r'(?:<NL>|\s+)(?:20|19)\d{2}\s*-\s*(?:(?:20|19)\d{2}|present|current|now)',
          r'(?:<NL>|\s+)(?:duration|period)\s*:\s*.*?(?:months?|years?)'
      ]

      date_count = 0
      for pattern in date_patterns:
          date_matches = re.findall(pattern, analysis_text)
          date_count += len(date_matches)

      if date_count > 0:
          confidence_scores['date_pattern'] = (date_count, 0.15)

      # Strategy 7: Structural Format Detection (30% weight)
      # This handles project formats with visual boundaries but without explicit markers
      block_pattern = r'(?:<NL>\s*<NL>|\s{3,}|[-_=]{3,})([^<NL>]{100,})(?:<NL>\s*<NL>|\s{3,}|[-_=]{3,})'
      block_matches = re.findall(block_pattern, analysis_text)

      project_blocks = 0
      for block in block_matches:
          score = 0
          # Check for project characteristics
          if re.search(r'\b(?:project|application|system|platform|software|website|mobile|tool)\b', block):
              score += 2
          if re.search(r'\b(?:developed|implemented|created|designed|built)\b', block):
              score += 2
          if re.search(r'\b(?:20|19)\d{2}\b', block):
              score += 1
          if re.search(r'\b(?:technology|framework|language|library|stack|database)\b', block):
              score += 1

          if score >= 3:
              project_blocks += 1

      if project_blocks > 0:
          confidence_scores['structural_format'] = (project_blocks, 0.30)

      # STAGE 3: Make final decision with weighted confidence
      if confidence_scores:
          # Calculate weighted average
          weighted_sum = 0
          total_weight = 0

          for strategy, (count, weight) in confidence_scores.items():
              weighted_sum += count * weight
              total_weight += weight

          if total_weight > 0:
              weighted_avg = weighted_sum / total_weight
              # Round to nearest integer
              project_count = round(weighted_avg)

              # Apply general bounds for reasonableness
              project_count = max(1, min(project_count, 15))

              return project_count

      # If project section found but no clear count, return at least 1
      if project_section:
          return 1

      # No projects found
      return 0

    def _text_similarity(self, text1, text2):
        # Simple word overlap score
        words1 = set(re.findall(r'\b\w{4,}\b', text1.lower()))
        words2 = set(re.findall(r'\b\w{4,}\b', text2.lower()))

        if not words1 or not words2:
            return 0

        overlap = len(words1.intersection(words2))
        return overlap / min(len(words1), len(words2))

    def extract_project_keywords(self, text):
        text = self.preprocess_text(text)
        found_keywords = set()

        # Look for project sections
        project_section_patterns = [
            r'projects?(?:\s*:|:?\s*\n)(.*?)(?:\n\s*\n|\n\s*[A-Z]|\Z)',
            r'(?:academic|major|minor|technical)\s+projects?(?:\s*:|:?\s*\n)(.*?)(?:\n\s*\n|\n\s*[A-Z]|\Z)',
            r'b\.tech\s+project(?:\s*:|:?\s*\n)(.*?)(?:\n\s*\n|\n\s*[A-Z]|\Z)',
            r'm\.tech\s+project(?:\s*:|:?\s*\n)(.*?)(?:\n\s*\n|\n\s*[A-Z]|\Z)',
        ]

        project_sections = []
        for pattern in project_section_patterns:
            sections = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)
            project_sections.extend(sections)

        # Create a combined section text
        section_text = "\n".join(project_sections) if project_sections else text

        # Match keywords
        for keyword in self.project_keywords_list:
            if re.search(r'\b' + re.escape(keyword) + r'\b', section_text, re.IGNORECASE):
                found_keywords.add(keyword)

        # Use NLP to find additional relevant terms in project sections
        if project_sections:
            doc = nlp(section_text)
            for token in doc:
                if token.pos_ in ['NOUN', 'PROPN'] and token.text.lower() in self.project_keywords_list:
                    found_keywords.add(token.text.lower())
                # Check for bigrams and trigrams (e.g., "machine learning")
                if token.i < len(doc) - 1:
                    bigram = token.text + " " + doc[token.i + 1].text
                    if bigram.lower() in self.project_keywords_list:
                        found_keywords.add(bigram.lower())
                if token.i < len(doc) - 2:
                    trigram = token.text + " " + doc[token.i + 1].text + " " + doc[token.i + 2].text
                    if trigram.lower() in self.project_keywords_list:
                        found_keywords.add(trigram.lower())

        return list(found_keywords)

    def extract_mobile_number(self, text):
        text = text.lower()

        # Look for phone/mobile/contact sections first
        contact_section_patterns = [
            r'(?:phone|mobile|contact|ph|tel|contact details)(?:\s*:|:?\s*\n)(.*?)(?:\n\s*\n|\n\s*[A-Z]|\Z)',
            r'(?:^|\n).*?(?:phone|mobile|contact|ph|tel)(?:\s*:|:?\s*\n|\s*-\s*)(.*?)(?:\n|$)'
        ]

        contact_sections = []
        for pattern in contact_section_patterns:
            sections = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)
            contact_sections.extend(sections)

        # Search in contact sections first
        for section in contact_sections:
            for pattern in self.phone_patterns:
                phone_match = re.search(pattern, section)
                if phone_match:
                    # Clean the phone number
                    phone = re.sub(r'[^\d+]', '', phone_match.group(0))
                    return phone

        # If not found in sections, look in entire text
        for pattern in self.phone_patterns:
            phone_matches = re.findall(pattern, text)
            if phone_matches:
                # Clean the first phone number found
                phone = re.sub(r'[^\d+]', '', phone_matches[0])
                return phone

        return None

    def extract_email(self, text):
        text = text.lower()

        # Look for email/contact sections first
        contact_section_patterns = [
            r'(?:email|e-mail|mail|contact|contact details)(?:\s*:|:?\s*\n)(.*?)(?:\n\s*\n|\n\s*[A-Z]|\Z)',
            r'(?:^|\n).*?(?:email|e-mail|mail)(?:\s*:|:?\s*\n|\s*-\s*)(.*?)(?:\n|$)'
        ]

        contact_sections = []
        for pattern in contact_section_patterns:
            sections = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)
            contact_sections.extend(sections)

        # Search in contact sections first
        for section in contact_sections:
            email_match = re.search(self.email_pattern, section)
            if email_match:
                return email_match.group(0)

        # If not found in sections, look in entire text
        email_matches = re.findall(self.email_pattern, text)
        if email_matches:
            return email_matches[0]

        return None

    def has_experience(self, text):
        text = self.preprocess_text(text)

        # Look for experience sections
        experience_section_patterns = [
            r'(?:work\s+)?experience(?:\s*:|:?\s*\n)(.*?)(?:\n\s*\n|\n\s*[A-Z]|\Z)',
            r'(?:professional|industry|job)\s+experience(?:\s*:|:?\s*\n)(.*?)(?:\n\s*\n|\n\s*[A-Z]|\Z)',
            r'(?:employment|work\s+history)(?:\s*:|:?\s*\n)(.*?)(?:\n\s*\n|\n\s*[A-Z]|\Z)',
            r'(?:internship|intern)(?:\s*:|:?\s*\n)(.*?)(?:\n\s*\n|\n\s*[A-Z]|\Z)'
        ]

        experience_sections = []
        for pattern in experience_section_patterns:
            sections = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)
            experience_sections.extend(sections)

        # If we found experience sections with substantial content
        section_text = "\n".join(experience_sections)
        if section_text and len(section_text) > 50:  # Arbitrary threshold for meaningful content
            return 'Yes'

        # Look for job titles
        job_titles = [
            'engineer', 'developer', 'programmer', 'analyst', 'consultant', 'manager', 'associate',
            'intern', 'trainee', 'lead', 'architect', 'administrator', 'specialist', 'executive'
        ]

        for title in job_titles:
            # Exclude titles that are part of educational context
            pattern = r'\b' + re.escape(title) + r'\b(?!.*(?:student|pursuing|looking for|seeking))'
            if re.search(pattern, text, re.IGNORECASE):
                return 'Yes'

        # Look for company names followed by designations
        company_patterns = [
            r'(?:worked at|at|with|for)\s+([A-Z][A-Za-z]*(?:\s+[A-Z][A-Za-z]*)?)',
            r'(?:^|\n)([A-Z][A-Za-z]*(?:\s+[A-Z][A-Za-z]*)?)\s+(?:Inc\.|LLC|Ltd\.|Limited|Corp\.|Corporation)'
        ]

        for pattern in company_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return 'Yes'

        # Look for date ranges typical of work experience
        date_range_pattern = r'(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s\'\-](?:20\d{2}|19\d{2})[\s\-\–\—]+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present|current)'
        if re.search(date_range_pattern, text, re.IGNORECASE):
            return 'Yes'

        # Default to No if no experience indicators found
        return 'No'

    def extract_core_computer_skills(self, text):
        text = self.preprocess_text(text)
        found_skills = set()

        # Look for skills sections
        skills_section_patterns = [
            r'(?:technical|core|computer)\s+skills(?:\s*:|:?\s*\n)(.*?)(?:\n\s*\n|\n\s*[A-Z]|\Z)',
            r'(?:programming|software|technical)\s+knowledge(?:\s*:|:?\s*\n)(.*?)(?:\n\s*\n|\n\s*[A-Z]|\Z)',
            r'(?:technical|core)\s+competencies(?:\s*:|:?\s*\n)(.*?)(?:\n\s*\n|\n\s*[A-Z]|\Z)'
        ]

        skills_sections = []
        for pattern in skills_section_patterns:
            sections = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)
            skills_sections.extend(sections)

        # Create a combined section text
        section_text = "\n".join(skills_sections) if skills_sections else text

        # Check each core skill category
        for skill_category, keywords in self.core_computer_skills.items():
            for keyword in keywords:
                if re.search(r'\b' + re.escape(keyword) + r'\b', section_text, re.IGNORECASE):
                    found_skills.add(skill_category)
                    break  # One match in category is enough

        # Return comma-separated list or None
        if found_skills:
            return ", ".join(sorted(found_skills))
        return None

    def evaluate_text_similarity(self, text1, text2):
        if not text1 or not text2:
            return 0.0

        # Create a TF-IDF vectorizer
        vectorizer = TfidfVectorizer(stop_words='english')

        # Transform both texts
        try:
            tfidf_matrix = vectorizer.fit_transform([text1.lower(), text2.lower()])

            # Calculate cosine similarity
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return similarity
        except:
            return 0.0

    def parse_resume(self, pdf_path):
        text = self.extract_text_from_pdf(pdf_path)

        if not text:
            return {
                "file_name": os.path.basename(pdf_path),
                "error": "Failed to extract text from PDF"
            }

        # Extract only the required 9 columns
        gpa = self.extract_gpa(text)
        skills = self.extract_skills(text)
        branch = self.extract_branch(text)
        project_count = self.count_projects(text)
        project_keywords = self.extract_project_keywords(text)
        mobile_number = self.extract_mobile_number(text)
        email = self.extract_email(text)
        experience = self.has_experience(text)
        core_computer_skills = self.extract_core_computer_skills(text)

        return {
            "file_name": os.path.basename(pdf_path),
            "CPI/GPA": gpa,
            "Skills": skills,
            "Branch": branch,
            "No_of_Projects": project_count,
            "Project_Keywords": project_keywords,
            "Mobile_Number": mobile_number,
            "Email_ID": email,
            "Experience": experience,
            "Core_Computer_Skills": core_computer_skills
        }

    def parse_resumes_in_directory(self, directory_path, output_path=None):
        if not os.path.exists(directory_path):
            raise ValueError(f"Directory not found: {directory_path}")

        results = []
        pdf_files = [f for f in os.listdir(directory_path) if f.lower().endswith('.pdf')]

        if not pdf_files:
            print(f"No PDF files found in {directory_path}")
            return None

        for pdf_file in pdf_files:
            pdf_path = os.path.join(directory_path, pdf_file)
            try:
                result = self.parse_resume(pdf_path)
                results.append(result)
                print(f"Processed: {pdf_file}")
            except Exception as e:
                print(f"Error processing {pdf_file}: {e}")
                results.append({
                    "file_name": pdf_file,
                    "error": str(e)
                })

        # Convert results to DataFrame
        df = pd.DataFrame(results)

        # Clean up DataFrame
        if 'Skills' in df.columns:
            df['Skills'] = df['Skills'].apply(lambda x: ', '.join(x) if isinstance(x, list) else x)

        if 'Project_Keywords' in df.columns:
            df['Project_Keywords'] = df['Project_Keywords'].apply(lambda x: ', '.join(x) if isinstance(x, list) else x)

        # Save results if output path provided
        if output_path:
            if output_path.lower().endswith('.csv'):
                df.to_csv(output_path, index=False)
                print(f"Results saved to {output_path}")
            elif output_path.lower().endswith(('.xls', '.xlsx')):
                df.to_excel(output_path, index=False)
                print(f"Results saved to {output_path}")
            else:
                df.to_csv(output_path + '.csv', index=False)
                print(f"Results saved to {output_path}.csv")

        return df

    def parse_single_file(self, file_path):
           if not os.path.exists(file_path):
               error_msg = f"File not found: {file_path}"
               print(json.dumps({"error": error_msg}))
               return None
               
           if not file_path.lower().endswith('.pdf'):
               error_msg = f"Not a PDF file: {file_path}"
               print(json.dumps({"error": error_msg}))
               return None
               
           try:
               # Parse the single resume
               result = self.parse_resume(file_path)
               
               # Convert to DataFrame for consistent output format
               df = pd.DataFrame([result])
               
               # Clean up DataFrame
               if 'Skills' in df.columns:
                   df['Skills'] = df['Skills'].apply(lambda x: ', '.join(x) if isinstance(x, list) else x)

               if 'Project_Keywords' in df.columns:
                   df['Project_Keywords'] = df['Project_Keywords'].apply(lambda x: ', '.join(x) if isinstance(x, list) else x)
               
               # Hardcoded output path in the same directory as the input file
               output_dir = os.path.dirname(file_path)
               output_filename = "parsed_resume_" + os.path.basename(file_path).replace('.pdf', '.csv')
               output_path = os.path.join(output_dir, output_filename)
               
               # Save to CSV
               df.to_csv(output_path, index=False)
               print(f"Results saved to {output_path}")
               
               # Also print the result as JSON for direct consumption
               print(json.dumps(result))
               
               return result
               
           except Exception as e:
               error_msg = f"Error processing {file_path}: {str(e)}"
               print(json.dumps({"error": error_msg}))
               return None


if __name__ == "__main__":
    parser = EnhancedResumeParser()
    
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
        
        # Check if the path is a file
        if os.path.isfile(file_path) and file_path.lower().endswith('.pdf'):
            parser.parse_single_file(file_path)
        
        # Check if the path is a directory
        elif os.path.isdir(file_path):
            # Hardcoded output path in the same directory
            output_path = os.path.join(file_path, "parsed_resumes.csv")
            try:
                results_df = parser.parse_resumes_in_directory(file_path)
                if results_df is not None:
                    results_df.to_csv(output_path, index=False)
                    print(f"Processed {len(results_df)} resumes. Results saved to {output_path}")
            except Exception as e:
                print(json.dumps({"error": str(e)}))
        
        else:
            print(json.dumps({"error": f"Invalid path: {file_path} - not a PDF file or directory"}))
    else:
        print(json.dumps({"error": "No path provided"}))
