import psycopg2
from dotenv import load_dotenv
load_dotenv()
import os

# DATABASE CONNECTION
def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "practical_generator"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", ""),
        port=os.getenv("DB_PORT", "5432"),
    )


# SUBJECT
def get_subject_id(subject_name):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT id FROM subjects WHERE name=%s",
        (subject_name,)
    )

    row = cur.fetchone()

    if row:
        subject_id = row[0]
    else:
        cur.execute(
            "INSERT INTO subjects(name) VALUES(%s) RETURNING id",
            (subject_name,)
        )
        subject_id = cur.fetchone()[0]
        conn.commit()

    cur.close()
    conn.close()

    return subject_id


# LANGUAGE
def get_language_id(language_name):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT id FROM languages WHERE name=%s",
        (language_name,)
    )

    row = cur.fetchone()

    if row:
        language_id = row[0]
    else:
        cur.execute(
            "INSERT INTO languages(name) VALUES(%s) RETURNING id",
            (language_name,)
        )
        language_id = cur.fetchone()[0]
        conn.commit()

    cur.close()
    conn.close()

    return language_id


# CHECK IF EXPERIMENT EXISTS
def get_experiment(question, subject_id, language_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT content, aim, algorithm, code, output, result
        FROM experiments
        WHERE question=%s
        AND subject_id=%s
        AND (language_id=%s OR language_id IS NULL)
        """,
        (question, subject_id, language_id)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return None

    # New experiments — stored as JSON in content column
    if row[0] is not None:
        return row[0]

    # Old experiments — stored in hardcoded columns, convert to dict
    return {
        "aim": row[1],
        "algorithm": row[2],
        "code": row[3],
        "output": row[4],
        "result": row[5]
    }


# SAVE NEW EXPERIMENT
def save_experiment(question, subject_id, language_id, exp):
    conn = get_connection()
    cur = conn.cursor()

    import json
    cur.execute(
        """
        INSERT INTO experiments
        (question, subject_id, language_id, content)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (question, subject_id, language_id)
        DO NOTHING
        """,
        (
            question,
            subject_id,
            language_id,
            json.dumps(exp)
        )
    )
    conn.commit()
    cur.close()
    conn.close()