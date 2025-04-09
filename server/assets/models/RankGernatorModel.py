
import pandas as pd
import numpy as np
import random

def load_company_data(file_path):
    """Loads and processes company data from an Excel file."""
    df = pd.read_excel(file_path)
    df = df.rename(columns={
        'Company Name': 'Company_Name',
        'Minimum CPI/GPA': 'CPI',
        'Required Skills': 'Skill_Set',
        'No of Projects': 'Min_Projects',
        'Key words in project': 'Project_Keywords',
        'Branches Invited': 'Branch',
        'CORE COMPUTER SKILLS': 'Core_Skills'
    })

    # Handle missing values and non-numeric strings before conversion
    def clean_numeric_column(column):
        # Replace 'Not Available' and other non-numeric strings with '0'
        column = column.replace(['Not Available', 'NA', 'N/A'], '0')
        # Remove '+' symbol and convert to numeric
        column = pd.to_numeric(column.astype(str).str.replace('+', '', regex=False), errors='coerce')
        # Fill any remaining NaN values with 0
        return column.fillna(0.0)

    # Clean numeric columns
    df['CPI'] = clean_numeric_column(df['CPI'])
    df['Min_Projects'] = clean_numeric_column(df['Min_Projects'])

    # Convert comma-separated values into sets
    df['Skill_Set'] = df['Skill_Set'].fillna('').apply(lambda x: set(s.strip() for s in str(x).split(',')))
    df['Project_Keywords'] = df['Project_Keywords'].fillna('').apply(lambda x: set(s.strip() for s in str(x).split(',')))
    df['Core_Skills'] = df['Core_Skills'].fillna('').apply(lambda x: set(s.strip() for s in str(x).split(',')))
    df['Branch'] = df['Branch'].fillna('').apply(lambda x: set(s.strip() for s in str(x).split(',')))

    return df



def calculate_score(user_data, company_data):
    """Calculates resume score for a user against multiple companies."""
    scores = []
    for _, company in company_data.iterrows():
        # Initialize scores for each variable
        a = [0] * 10  # a[0] is not used, a[1] through a[9] correspond to variables 1-9
        reject = False

        # Variable 1: CPI / GPA (40%)
        if user_data['CPI'] >= company['CPI']:
            a[1] = (40 / (10 - company['CPI'])) * (user_data['CPI'] - company['CPI'])
        else:
            a[1] = -1e7
            reject = True

        # Variable 2: Skill Set Matching (Binary Decision Variable)
        # Check if user's skills are present in company's required skills
        if company['Skill_Set'].issubset(user_data['Skill_Set']):
            a[2] = 10
        else:
            a[2] = -1e7
            reject = True

        # Variable 3: Branch Matching (Binary Decision Variable)
        # if user_data['Branch'] in company['Branch']:
        #     a[3] = 10
        # else:
        #     a[3] = -1e7
        #     reject = True

        # Variable 4: Number of Projects (10%)
        if user_data['Projects'] >= company['Min_Projects']:
            extra_projects = min(user_data['Projects'] - company['Min_Projects'], 4)
            a[4] = (10 / 3) * extra_projects
        else:
            a[4] = -1e7
            reject = True

        # Variable 5: Project Keywords (20%)
        matched_keywords = len(user_data['Project_Keywords'].intersection(company['Project_Keywords']))
        total_keywords = len(company['Project_Keywords'])
        if total_keywords > 0:
            a[5] = (20 / total_keywords) * matched_keywords
        else:
            a[5] = 0

        # Variable 6: Mobile Number Validation (Binary Decision Variable)
        if len(str(user_data['Mobile'])) == 10:
            a[6] = 0
        else:
            a[6] = -1e7
            reject = True

        # Variable 7: Email ID Validation (Binary Decision Variable)
        if "@" in user_data['Email'] and "." in user_data['Email']:
            a[7] = 0
        else:
            a[7] = -1e7
            reject = True

        # Variable 8: Work Experience (20%)
        a[8] = user_data['Experience'] * 5

        # Variable 9: Core Computer Skills (10%)
        matched_skills = len(user_data['Core_Skills'].intersection(company['Core_Skills']))
        total_skills = len(company['Core_Skills'])
        if total_skills > 0:
            a[9] = (10 / total_skills) * matched_skills
        else:
            a[9] = 0

        # Calculate final score
        if reject:
            final_score = -1e7
        else:
            final_score = sum(a[1:10])

        scores.append((company['Company_Name'], final_score))

    return sorted(scores, key=lambda x: x[1], reverse=True)  # Sort by highest score

# Example usage
if __name__ == "__main__":
    try:
        file_path = "/content/BTech_Companies_NLP.xlsx"  # Path to company data
        company_data = load_company_data(file_path)

        user_data = generate_mock_user()  # Generate a mock user
        print("Mock User Data:", user_data)

        rankings = calculate_score(user_data, company_data)
        print("\nCompany Rankings:")
        for company, score in rankings:  # Display all ranked companies
            print(f"Company: {company}, Score: {score}")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()