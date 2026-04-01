import os
import yaml
import re
import time
from groq import Groq

from db import (
    get_subject_id,
    get_language_id,
    get_experiment,
    save_experiment
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

BATCH_SIZE = 2 


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


def sanitize_experiment(exp, question, language):
    """Ensure all required keys exist with fallback values."""
    return {
        "aim":       exp.get("aim",       question),
        "algorithm": exp.get("algorithm", "Could not generate. Please regenerate."),
        "code":      exp.get("code",      f"// Could not generate {language} code"),
        "output":    exp.get("output",    "N/A"),
        "result":    exp.get("result",    "N/A"),
    }


def generate_batch(batch_questions, language, lang_hints):
    """Call Groq for a single batch of questions. Returns list of experiment dicts."""

    question_list = "\n".join(f"{i+1}. {q}" for i, q in enumerate(batch_questions))

    prompt = f"""You are a programming practical file generator.
Generate practical experiments for each question in {language}.

Language instructions: {lang_hints}

Questions:
{question_list}

Return ONLY a YAML list with exactly {len(batch_questions)} items.
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

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    f"You generate YAML only for {language} programming experiments. "
                    "No markdown. No code fences. No explanations. "
                    "Always use literal block scalars (|) for code and multiline fields. "
                    "Always return ALL fields: aim, algorithm, code, output, result for every experiment."
                )
            },
            {"role": "user", "content": prompt}
        ],
        temperature=0.1,
        max_tokens=6000,  # near model max — never truncates
    )

    text = response.choices[0].message.content.strip()
    text = clean_yaml_text(text)

    parsed = parse_yaml_safe(text, len(batch_questions))
    return parsed


def generate_experiments(questions, language, subject):

    subject_id  = get_subject_id(subject)
    language_id = get_language_id(language)

    # Preserve original order using a dict
    result_map = {}
    questions_to_generate = []

    # ── STEP 1: Check DB cache ────────────────────────────
    for q in questions:
        cached = get_experiment(q, subject_id, language_id)
        if cached:
            print(f"Found in database: {q}")
            cached["name"]      = q
            cached["aim"]       = cached.get("aim",       q)
            cached["algorithm"] = cached.get("algorithm", "")
            cached["code"]      = cached.get("code",      "")
            cached["output"]    = cached.get("output",    "N/A")
            cached["result"]    = cached.get("result",    "N/A")
            result_map[q] = cached
        else:
            print(f"Generating using AI: {q}")
            questions_to_generate.append(q)

    # ── STEP 2: Generate missing ones in batches ──────────
    if questions_to_generate:
        lang_hints = get_language_hints(language)

        for batch_start in range(0, len(questions_to_generate), BATCH_SIZE):
            batch = questions_to_generate[batch_start : batch_start + BATCH_SIZE]
            print(f"Generating batch {batch_start // BATCH_SIZE + 1}: {len(batch)} experiments")

            try:
                parsed = generate_batch(batch, language, lang_hints)

                # Pad if Groq returned fewer items than expected
                while len(parsed) < len(batch):
                    parsed.append({})

                for q, exp in zip(batch, parsed):
                    exp = sanitize_experiment(exp, q, language)
                    exp["name"] = q
                    save_experiment(q, subject_id, language_id, exp)
                    result_map[q] = exp

            except Exception as e:
                print(f"Batch generation failed: {e}")
                # Fallback placeholders for this batch
                for q in batch:
                    fallback = {
                        "name":      q,
                        "aim":       q,
                        "algorithm": "Could not generate. Please regenerate.",
                        "code":      f"// Could not generate {language} code",
                        "output":    "N/A",
                        "result":    "N/A",
                    }
                    result_map[q] = fallback
            time.sleep(2) 

    # ── STEP 3: Rebuild in original order ─────────────────
    experiments = []
    for i, q in enumerate(questions, 1):
        exp = result_map.get(q, {
            "name":      q,
            "aim":       q,
            "algorithm": "Could not generate. Please regenerate.",
            "code":      f"// Could not generate {language} code",
            "output":    "N/A",
            "result":    "N/A",
        })
        exp["number"] = i
        experiments.append(exp)

    return experiments