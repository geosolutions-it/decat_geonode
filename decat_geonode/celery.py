from __future__ import absolute_import

import os
from celery import Celery

import celery
print celery.__file__

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'decat_geonode.settings')

app = Celery('decat_geonode')

# Using a string here means the worker will not have to
# pickle the object when using Windows.
app.config_from_object('django.conf:settings')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))
