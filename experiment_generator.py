import os
import yaml
import re
from groq import Groq
from db import get_subject_id, get_language_id, get_experiment, save_experiment
from subject_config import get_subject_config, get_fallback_config

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ── Field display names for the AI prompt ──
FIELD_LABELS = {
    "aim":                "aim (one line)",
    "algorithm":          "algorithm (step by step)",
    "code":               "code (full working program)",
    "output":             "output (expected program output)",
    "procedure":          "procedure (step by step instructions)",
    "commands":           "commands (exact commands/steps used)",
    "theory":             "theory (explanation of concept, 3-5 lines)",
    "truth_table":        "truth_table (text representation of truth table)",
    "observation":        "observation (readings or results observed)",
    "result":             "result (one line conclusion)",
}

def get_language_hints(language):
    lang = language.upper()
    if lang == "SQL":
        return "Use standard SQL. Use -- for comments."
    elif lang in ["C", "C++"]:
        return "Use standard C/C++ syntax. Use // for comments."
    elif lang == "JAVASCRIPT":
        return "Use modern JavaScript ES6+. Use // for comments."
    elif lang == "TYPESCRIPT":
        return "Use TypeScript with type annotations. Use // for comments."
    elif lang == "R":
        return "Use standard R syntax. Use # for comments."
    elif lang == "MATLAB":
        return "Use standard MATLAB syntax. Use % for comments."
    elif lang == "JAVA":
        return "Use standard Java syntax. Always include main class."
    elif lang == "PYTHON":
        return "Use standard Python 3 syntax. Use # for comments."
    else:
        return f"Use standard {language} syntax."

def clean_yaml_text(text):
    text = re.sub(r"```(?:yaml|sql|python|java|cpp|c\+\+|javascript|typescript|r|matlab)?", "", text, flags=re.I)
    text = text.replace("```", "")
    return text.strip()

def parse_yaml_safe(text, count):
    try:
        result = yaml.safe_load(text)
        if isinstance(result, list) and len(result) > 0:
            return result
    except Exception as e:
        print("YAML attempt 1 failed:", e)

    try:
        match = re.search(r"^- aim:", text, re.MULTILINE)
        if match:
            result = yaml.safe_load(text[match.start():])
            if isinstance(result, list):
                return result
    except Exception as e:
        print("YAML attempt 2 failed:", e)

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

def build_prompt(questions, language, subject, fields):
    """Build AI prompt dynamically based on subject fields.
    diagram_placeholder is never sent to AI — skip it."""

    # Fields the AI actually needs to generate
    ai_fields = [f for f in fields if f != "diagram_placeholder"]

    question_list = "\n".join(f"{i+1}. {q}" for i, q in enumerate(questions))
    field_keys = ", ".join(ai_fields)

    # Language hint only for lab subjects
    lang_line = ""
    if language:
        lang_line = f"Language instructions: {get_language_hints(language)}\n"

    # Build the YAML format example dynamically
    format_example = "\n".join(
        f"  {f}: |\n    content here"
        for f in ai_fields
    )

    subject_line = f"Subject: {subject}" if subject else ""

    return f"""You are a practical file generator for engineering students.
{subject_line}
Generate experiment content for each question below.
{lang_line}
Questions:
{question_list}

Return ONLY a YAML list with exactly {len(questions)} items.
Each item must have these exact keys: {field_keys}

STRICT RULES:
- Use literal block scalar (|) for all multiline fields
- Do NOT wrap response in markdown or code fences
- Do NOT use quotes around block scalar values
- Indent block content by 4 spaces
- Special characters like : > < must only appear inside block scalars

Format:
- {format_example}
"""

def build_placeholder(fields, question, language):
    """Build a fallback experiment dict when AI fails."""
    content = {}
    for f in fields:
        if f == "diagram_placeholder":
            content[f] = ""
        elif f == "code":
            content[f] = f"-- Could not generate {language} code"
        else:
            content[f] = "Could not generate. Please regenerate."
    return content

def generate_experiments(questions, language, subject):
    # Get subject config — fall back if unknown
    config = get_subject_config(subject)
    if config is None:
        # Shouldn't happen with dropdown, but safe fallback
        fallback_type = "lab" if language else "theory_diagram"
        config = get_fallback_config(fallback_type)

    fields = config["fields"]
    subject_id = get_subject_id(subject)

    # language_id is None for non-programming subjects
    language_id = get_language_id(language) if config["language_required"] else None

    experiments = []
    questions_to_generate = []

    # STEP 1 — check cache first
    for q in questions:
        cached = get_experiment(q, subject_id, language_id)
        if cached:
            print(f"Cache hit: {q}")
            experiments.append({
                "name": q,
                "content": cached
            })
        else:
            print(f"Generating: {q}")
            questions_to_generate.append(q)

    # STEP 2 — call AI only for missing questions
    if questions_to_generate:
        prompt = build_prompt(
            questions_to_generate,
            language if config["language_required"] else None,
            subject,
            fields
        )

        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You generate YAML only for engineering practical files. "
                            "No markdown. No code fences. No explanations. "
                            "Always use literal block scalars (|) for multiline fields."
                        )
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
            )

            text = clean_yaml_text(response.choices[0].message.content.strip())
            new_experiments = parse_yaml_safe(text, len(questions_to_generate))

            if not new_experiments:
                raise ValueError("No experiments parsed from AI response")

            # Pad if AI returned fewer than expected
            while len(new_experiments) < len(questions_to_generate):
                new_experiments.append(
                    build_placeholder(fields, questions_to_generate[len(new_experiments)], language)
                )

            for q, exp in zip(questions_to_generate, new_experiments):
                # Remove diagram_placeholder from what gets cached
                # it's structural, not AI content
                content = {
                    k: exp.get(k, "") 
                    for k in fields 
                    if k != "diagram_placeholder"
                }
                # Add it back in memory for rendering
                if "diagram_placeholder" in fields:
                    content["diagram_placeholder"] = ""

                save_experiment(q, subject_id, language_id, content)
                experiments.append({"name": q, "content": content})

        except Exception as e:
            print("Generation failed:", e)
            for q in questions_to_generate:
                experiments.append({
                    "name": q,
                    "content": build_placeholder(fields, q, language)
                })

    # Add experiment numbers
    for i, exp in enumerate(experiments, 1):
        exp["number"] = i

    return experiments