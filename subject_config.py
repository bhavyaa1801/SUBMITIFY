SUBJECTS = {
    # Programming Labs existing behaviour, no change
    "Programming in C": {
        "type": "lab",
        "language_required": True,
        "fields": ["aim", "algorithm", "code", "output", "result"]
    },
    "Data Structures": {
        "type": "lab",
        "language_required": True,
        "fields": ["aim", "algorithm", "code", "output", "result"]
    },
    "Database Management Systems": {
        "type": "lab",
        "language_required": True,
        "fields": ["aim", "algorithm", "code", "output", "result"]
    },
    "Object Oriented Programming": {
        "type": "lab",
        "language_required": True,
        "fields": ["aim", "algorithm", "code", "output", "result"]
    },
    "Design and Analysis of Algorithms": {
        "type": "lab",
        "language_required": True,
        "fields": ["aim", "algorithm", "code", "output", "result"]
    },
    "Artificial Intelligence": {
        "type": "lab",
        "language_required": True,
        "fields": ["aim", "algorithm", "code", "output", "result"]
    },
    "Machine Learning": {
        "type": "lab",
        "language_required": True,
        "fields": ["aim", "algorithm", "code", "output", "result"]
    },
    "Internet of Things": {
        "type": "lab",
        "language_required": True,
        "fields": ["aim", "algorithm", "code", "output", "result"]
    },
    "Compiler Design": {
        "type": "lab",
        "language_required": True,
        "fields": ["aim", "algorithm", "code", "output", "result"]
    },

    #  Lab with Procedure (CN, OS — rename fields only)
    "Operating Systems": {
        "type": "lab_procedure",
        "language_required": False,
        "fields": ["aim", "procedure", "commands", "output", "result"]
    },
    "Data Communication and Computer Networks": {
        "type": "lab_procedure",
        "language_required": False,
        "fields": ["aim", "procedure", "commands", "output", "result"]
    },

    #  Theory + Diagram (COA, DLD, Electrical, Mechanics) 
    "Digital Logic Design": {
        "type": "theory_diagram",
        "language_required": False,
        "fields": ["aim", "theory", "truth_table", "diagram_placeholder", "result"]
    },
    "Computer Organization and Architecture": {
        "type": "theory_diagram",
        "language_required": False,
        "fields": ["aim", "theory", "diagram_placeholder", "observation", "result"]
    },
    "Basic Electrical Engineering": {
        "type": "theory_diagram",
        "language_required": False,
        "fields": ["aim", "theory", "diagram_placeholder", "observation", "result"]
    },
    "Engineering Mechanics": {
        "type": "theory_diagram",
        "language_required": False,
        "fields": ["aim", "theory", "diagram_placeholder", "observation", "result"]
    },
}

#  Fallbacks for unknown subjects 
FALLBACKS = {
    "lab": {
        "type": "lab",
        "language_required": True,
        "fields": ["aim", "algorithm", "code", "output", "result"]
    },
    "theory_diagram": {
        "type": "theory_diagram",
        "language_required": False,
        "fields": ["aim", "theory", "diagram_placeholder", "observation", "result"]
    }
}

def get_subject_config(subject: str) -> dict:
    return SUBJECTS.get(subject, None)

def get_fallback_config(fallback_type: str) -> dict:
    return FALLBACKS.get(fallback_type, FALLBACKS["lab"])

def get_all_subjects() -> list:
    return list(SUBJECTS.keys())