import os
import yaml
import re
from groq import Groq

from db import (
    get_subject_id,
    get_language_id,
    get_experiment,
    save_experiment
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def get_language_hints(language):
    lang = language.upper()
    if lang == "SQL":
        return "Use standard SQL. Use -- for comments. Avoid using > < symbols outside of SQL WHERE clauses."
    elif lang in ["C", "C++"]:
        return "Use standard C/C++ syntax. Use // for comments."
    elif lang == "JAVASCRIPT":
        return "Use modern JavaScript ES6+. Use // for comments. Avoid backtick template literals."
    elif lang == "TYPESCRIPT":
        return "Use TypeScript with type annotations. Use // for comments. Avoid backtick template literals."
    elif lang == "R":
        return "Use standard R syntax. Use # for comments. Use <- for assignment."
    elif lang == "MATLAB":
        return "Use standard MATLAB syntax. Use % for comments. Use disp() for output."
    elif lang == "JAVA":
        return "Use standard Java syntax. Use // for comments. Always include main class."
    elif lang == "PYTHON":
        return "Use standard Python 3 syntax. Use # for comments."
    else:
        return f"Use standard {language} syntax."


def clean_yaml_text(text):
    text = re.sub(r"```(?:yaml|sql|python|java|cpp|c\+\+|javascript|typescript|r|matlab)?", "", text, flags=re.I)
    text = text.replace("```", "")
    return text.strip()


def parse_yaml_safe(text, count):

    # Attempt 1: direct parse
    try:
        result = yaml.safe_load(text)
        if isinstance(result, list) and len(result) > 0:
            return result
    except Exception as e:
        print("YAML attempt 1 failed:", e)

    # Attempt 2: find first "- aim:" and parse from there
    try:
        match = re.search(r"^- aim:", text, re.MULTILINE)
        if match:
            trimmed = text[match.start():]
            result = yaml.safe_load(trimmed)
            if isinstance(result, list):
                return result
    except Exception as e:
        print("YAML attempt 2 failed:", e)

    # Attempt 3: split by "- aim:" and parse each block individually
    try:
        blocks = re.split(r"\n(?=- aim:)", text)
        results = []
        for block in blocks:
            block = block.strip()
            if block:
                parsed = yaml.safe_load(block)
                if isinstance(parsed, list):
                    results.extend(parsed)
                elif isinstance(parsed, dict):
                    results.append(parsed)
        if results:
            return results
    except Exception as e:
        print("YAML attempt 3 failed:", e)


    return []


def generate_experiments(questions, language, subject):

    subject_id = get_subject_id(subject)
    language_id = get_language_id(language)

    experiments = []
    questions_to_generate = []

    # STEP 1: CHECK DATABASE FIRST
    for q in questions:
        cached = get_experiment(q, subject_id, language_id)
        if cached:
            print(f"Found in database: {q}")
            cached["name"] = q
            experiments.append(cached)
        else:
            print(f"Generating using AI: {q}")
            questions_to_generate.append(q)

    # STEP 2: CALL AI ONLY FOR MISSING QUESTIONS
    if questions_to_generate:

        lang_hints = get_language_hints(language)
        question_list = "\n".join(f"{i+1}. {q}" for i, q in enumerate(questions_to_generate))

        prompt = f"""You are a programming practical file generator.
Generate practical experiments for each question in {language}.

Language instructions: {lang_hints}

Questions:
{question_list}

Return ONLY a YAML list with exactly {len(questions_to_generate)} items.
Each item must have these exact keys: aim, algorithm, code, output, result

STRICT RULES:
- Use literal block scalar (|) for algorithm, code, output, result
- Do NOT wrap response in markdown or code fences
- Do NOT use quotes around block scalar values
- Indent block content by 4 spaces
- Special characters like : > < must only appear inside block scalars

Format:
- aim: one line aim here
  algorithm: |
    Step 1: description
    Step 2: description
  code: |
    your {language} code here
  output: |
    expected output here
  result: |
    short result here
"""

        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            f"You generate YAML only for {language} programming experiments. "
                            "No markdown. No code fences. No explanations. "
                            "Always use literal block scalars (|) for code and multiline fields."
                        )
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
            )

            text = response.choices[0].message.content.strip()
            text = clean_yaml_text(text)


            new_experiments = parse_yaml_safe(text, len(questions_to_generate))

            if not new_experiments:
                raise ValueError("No experiments parsed from AI response")

            # Pad if Groq returned fewer than expected
            while len(new_experiments) < len(questions_to_generate):
                new_experiments.append({
                    "aim": questions_to_generate[len(new_experiments)],
                    "algorithm": "Could not generate. Please regenerate.",
                    "code": f"-- Could not generate {language} code",
                    "output": "N/A",
                    "result": "N/A",
                })

            for q, exp in zip(questions_to_generate, new_experiments):
                exp["name"] = q
                save_experiment(q, subject_id, language_id, exp)
                experiments.append(exp)

        except Exception as e:
            print("Generation failed:", e)
            # Return placeholders so PDF still generates
            for q in questions_to_generate:
                experiments.append({
                    "name": q,
                    "aim": q,
                    "algorithm": "Could not generate. Please regenerate.",
                    "code": f"-- Could not generate {language} code",
                    "output": "N/A",
                    "result": "N/A",
                })

    # ADD EXPERIMENT NUMBERS
    for i, exp in enumerate(experiments, 1):
        exp["number"] = i

    return experiments