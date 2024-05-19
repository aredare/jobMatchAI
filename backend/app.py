import os
import re
import uuid
import threading
import pdfplumber
import openai
from flask_cors import CORS
from flask import Flask, request, jsonify

app = Flask(__name__)
app.debug = True
CORS(app)

# Get your OpenAI GPT-4 API Key from an environment variable
api_key = os.getenv('OPENAI_API_KEY')

if api_key is None:
    raise ValueError("API key not found in environment variables")

openai.api_key = api_key

# Use a dictionary to store the status and result of each task
tasks = {}


def process_files_background(task_id, resume_file, jobdesc_file):
    try:
        # Extract text from PDFs
        resume_text = parse_pdf(resume_file)
        jd_text = parse_pdf(jobdesc_file)

        # Get match results
        results = get_match(resume_text, jd_text)
        tasks[task_id] = {'status': 'completed', 'results': results}

    except Exception as e:
        tasks[task_id] = {'status': 'error', 'error': str(e)}


@app.route('/process-files', methods=['POST'])
def process_files():
    resume_file = request.files.get('resume')
    jobdesc_file = request.files.get('jobDesc')

    if not resume_file or not jobdesc_file:
        return jsonify({"message": "Both files are required!"}), 400

    if not (resume_file.content_type == jobdesc_file.content_type == 'application/pdf'):
        return jsonify({"message": "Both files should be PDFs!"}), 400

    # Generate a unique task ID
    task_id = str(uuid.uuid4())

    # Start the background task and immediately return the task ID
    threading.Thread(target=process_files_background, args=(task_id, resume_file, jobdesc_file)).start()

    tasks[task_id] = {'status': 'success'}
    print(tasks)
    return jsonify({'taskId': task_id})


@app.route('/check-task/<taskId>', methods=['GET'])
def check_task(taskId):
    task = tasks.get(taskId)
    if task:
        return jsonify(task)
    else:
        return jsonify({'status': 'not found'}), 404


def parse_pdf(pdf_file):
    with pdfplumber.open(pdf_file) as pdf:
        text = '\n'.join(page.extract_text() for page in pdf.pages)
    return text


def get_match(resume_text, jd_text):
    try:
        prompt = f"Analyze the match between this resume:\n{resume_text}\n\nAnd this job description:\n{jd_text}" \
                 f"Assume the role of an ATS and grade the match on a scale of 0 to 100%. Provide suggestions on how to increase the score"

        completion = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=300,
        )

        match_score = extract_match_score(completion.choices[0]["message"]["content"])
        return match_score

    except Exception as e:
        return {'error': str(e)}


def extract_match_score(message_content):
    match = re.search(r"(\d+)%", message_content)
    if match:
        score = int(match.group(1))
        return {'matchScore': score}
    else:
        return {'matchScore': None}


if __name__ == '__main__':
    app.run(port=5000)
