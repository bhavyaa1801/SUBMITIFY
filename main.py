from jinja2 import Environment, FileSystemLoader
import pdfkit
from experiment_generator import generate_experiments

# COLLECT PROJECT INFORMATION

project = {
    "university": input("Enter University Name: "),
    "year": input("Enter Academic Year: "),
    "department": input("Enter Department: "),
    "subject": input("Enter Subject Name: "),
    "code": input("Enter Subject Code: "),
    "student": input("Enter Student Name: "),
    "roll": input("Enter Enrollment Number: "),
    "course": input("Enter Course: "),
    "semester": input("Enter Semester: "),
    "submitted_to": input("Enter Submitted To: "),
    "designation": input("Enter Designation: "),
}
# TAKE LANGUAGE INPUT FROM USER

language = input("\nEnter Programming Language (C / C++ / Python / Java): ").strip().title()

# TAKE EXPERIMENT QUESTIONS

print("\nPaste all experiment questions (press ENTER twice to finish):\n")

questions = []

while True:

    line = input().strip()

    if line == "":
        break

    questions.append(line)


# GENERATE EXPERIMENTS


print("\nGenerating all experiments...\n")

experiments = generate_experiments(questions, language, project["subject"])


# LOAD HTML TEMPLATES

env = Environment(loader=FileSystemLoader("templates"))

cover_template = env.get_template("cover.html")
index_template = env.get_template("index.html")
experiment_template = env.get_template("experiments.html")


cover_html = cover_template.render(project=project)

index_html = index_template.render(experiments=experiments)

exp_html = experiment_template.render(experiments=experiments)

# BUILD FINAL HTML

final_html = f"""
<html>
<head>
<meta charset="UTF-8">
</head>

<body>

{cover_html}

<div style="page-break-after: always;"></div>

{index_html}

<div style="page-break-after: always;"></div>

{exp_html}

</body>
</html>
"""

# PDF SETTINGS

options = {
    "enable-local-file-access": "",
    "page-size": "A4",
    "margin-top": "28mm",
    "margin-right": "15mm",
    "margin-bottom": "20mm",
    "margin-left": "15mm",
    "footer-right": "Page [page] of [topage]",
    "footer-font-size": "10"
}

config = pdfkit.configuration(
    wkhtmltopdf=r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"
)

# GENERATE PDF

pdfkit.from_string(
    final_html,
    "practical_file.pdf",
    configuration=config,
    options=options,
    css="styles.css"
)

print("\nPDF Generated Successfully!")