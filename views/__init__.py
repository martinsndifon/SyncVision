#!/usr/bin/python3
"""Blueprint for the flask app views"""

from views.index import *
from flask import Blueprint

app_views = Blueprint('app_views', __name__, url_prefix='/syncvision')
