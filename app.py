from flask import Flask, render_template
import sys
from flaskutil import ReverseProxied

app = Flask(__name__)
app.wsgi_app = ReverseProxied(app.wsgi_app)
app.config.from_object({'SEND_FILE_MAX_AGE_DEFAULT': 0})

@app.route("/")
def home():
    return render_template('index.html')

if __name__ == "__main__":
    debug = False
    if len(sys.argv) > 1 and sys.argv[1] == 'debug':
        debug = True
    app.run(host='0.0.0.0', debug=debug, port=1337)
