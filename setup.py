import os
from distutils.core import setup

def read(*rnames):
    return open(os.path.join(os.path.dirname(__file__), *rnames)).read()

setup(
    name="decat_geonode",
    version="0.1",
    author="",
    author_email="",
    description="decat_geonode, based on GeoNode",
    long_description=(read('README.rst')),
    # Full list of classifiers can be found at:
    # http://pypi.python.org/pypi?%3Aaction=list_classifiers
    classifiers=[
        'Development Status :: 1 - Planning',
    ],
    license="BSD",
    keywords="decat_geonode geonode django",
    url='https://github.com/decat_geonode/decat_geonode',
    packages=['decat_geonode',],
    include_package_data=True,
    zip_safe=False,
    install_requires=[
       'geonode>=2.5',
       'django-simple-history',
       'djangorestframework',
       'djangorestframework-gis',
       'django-filter',
       'django-apptemplates',
       'django-cuser==2017.3.16',
       'django-model-utils==3.0.0'
    ],
)
