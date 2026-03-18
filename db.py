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
        SELECT aim, algorithm, code, output, result
        FROM experiments
        WHERE question=%s
        AND subject_id=%s
        AND language_id=%s
        """,
        (question, subject_id, language_id)
    )

    row = cur.fetchone()

    cur.close()
    conn.close()

    if row:
        return {
            "aim": row[0],
            "algorithm": row[1],
            "code": row[2],
            "output": row[3],
            "result": row[4]
        }

    return None


# SAVE NEW EXPERIMENT
def save_experiment(question, subject_id, language_id, exp):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO experiments
        (question, subject_id, language_id, aim, algorithm, code, output, result)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """,
        (
            question,
            subject_id,
            language_id,
            exp["aim"],
            exp["algorithm"],
            exp["code"],
            exp["output"],
            exp["result"]
        )
    )

    conn.commit()

    cur.close()
    conn.close()