import os
import mysql.connector
from flask import Flask, render_template_string

app = Flask(__name__)

DB_CFG = {
    "host": os.getenv("MYSQL_HOST", "mysql"),
    "user": os.getenv("MYSQL_USER", "leduser"),
    "password": os.getenv("MYSQL_PASSWORD", "ledjxz14pass"),
    "database": os.getenv("MYSQL_DATABASE", "ledactions"),
}

ROW_TMPL = """
<!doctype html>
<html>
  <head><meta charset="utf-8"><title>led_events</title></head>
  <body>
    <h2>Tabla: led_events</h2>
    <table border="1" cellpadding="6">
      <thead>
        <tr>
          <th>id</th><th>device_id</th><th>action</th><th>source</th>
          <th>correlation_id</th><th>created_at</th>
        </tr>
      </thead>
      <tbody>
        {% for r in rows %}
        <tr>
          <td>{{r[0]}}</td><td>{{r[1]}}</td><td>{{r[2]}}</td>
          <td>{{r[3]}}</td><td>{{r[4]}}</td><td>{{r[5]}}</td>
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </body>
</html>
"""

@app.route("/")
def root():
    return "<h1>OK</h1><p>Usá <a href='/led-events'>/led-events</a> para ver registros.</p>"

@app.route("/led-events")
def led_events():
    conn = mysql.connector.connect(**DB_CFG)
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, device_id, action, source, correlation_id, created_at FROM led_events ORDER BY id DESC LIMIT 200;")
        rows = cur.fetchall()
    finally:
        cur.close()
        conn.close()
    return render_template_string(ROW_TMPL, rows=rows)

if __name__ == "__main__":
    # Para desarrollo local directo:
    app.run(host="0.0.0.0", port=5000)
