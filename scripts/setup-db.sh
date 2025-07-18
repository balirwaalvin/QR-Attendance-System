#!/bin/bash

# Database setup script for Heroku deployment
# This script sets up the database tables and initial data

echo "Setting up database..."

# Get database connection details from Heroku config
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < database/schema.sql

echo "Database schema created successfully"

# Optionally run seed data
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < database/seed.sql

echo "Database setup completed!"
