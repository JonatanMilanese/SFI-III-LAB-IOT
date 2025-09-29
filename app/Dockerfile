FROM python:3.11-slim
WORKDIR /app

# librerías necesarias para mysqlclient
RUN apt-get update && apt-get install -y build-essential default-libmysqlclient-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# gunicorn: 2 workers, bind en 0.0.0.0:8000, objeto WSGI "app" dentro de app.py
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:8000", "app:app"]
