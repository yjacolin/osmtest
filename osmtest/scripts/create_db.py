# -*- coding: utf-8 -*-

"""Create the application's database.
"""

import logging
import sys
from optparse import OptionParser

from pyramid.paster import get_app

import transaction

def main():
    parser = OptionParser("Create and populate the database tables.")
    parser.add_option('-i', '--iniconfig', default='production.ini', 
            help='project .ini config file')
    parser.add_option('-n', '--app-name', default="app",
            help='The application name (optional, default is "app")')
    parser.add_option('-d', '--drop', action="store_true",  default=False, 
            help='drop the table if already exists')
    parser.add_option('-p', '--populate', action="store_true",  default=False, 
            help='populate the database')

    (options, args) = parser.parse_args()

    logging.config.fileConfig(options.iniconfig)
    log = logging.getLogger(__name__)

    # read the configuration
    app = get_app(options.iniconfig, options.app_name)

    # should be import after the configuration is read.
    from osmtest import models
    from c2cgeoportal import models as c2cmodels
    from c2cgeoportal import schema

    if options.drop:
        print "Dropping tables"
        for table in reversed(c2cmodels.Base.metadata.sorted_tables):
            if table.schema == schema:
                print "Dropping table %s" % table.name
                table.drop(bind=c2cmodels.DBSession.bind, checkfirst=True)

    print "Creating tables"
    for table in c2cmodels.Base.metadata.sorted_tables:
        if table.schema == schema:
            print "Creating table %s" % table.name
            table.create(bind=c2cmodels.DBSession.bind, checkfirst=True)
    sess = c2cmodels.DBSession()

    admin = c2cmodels.User(username=u'admin', 
                password=u'admin',
                )
    roleadmin = c2cmodels.Role(name=u'role_admin') 
    admin.role = roleadmin
    sess.add_all([admin, roleadmin])

    if options.populate:
        print "Populate the Database"

        # add the objects creation there

        sess.add_all([]) # add the oblect that we want to commit in the array

    transaction.commit()
    print "Commited successfully"

