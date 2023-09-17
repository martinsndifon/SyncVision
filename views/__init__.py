#!/usr/bin/python3
"""Blueprint for the flask app views"""

from flask import Blueprint

app_views = Blueprint('app_views', __name__)
from views.index import *
from views.call import *
from views.error_handlers import *
