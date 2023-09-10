#!/usr/bin/python3
"""Blueprint for the flask app views"""

from flask import Blueprint

app_views = Blueprint('app_views', __name__, url_prefix='/syncvision')
from views.index import *
