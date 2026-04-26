#!/bin/bash

echo -e "\n--- 1. Testing Add Member ---"
MEMBER_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name": "Automated Tester", "phone": "555-0199", "email": "auto@test.com", "address": "Bot Street", "bloodGroup": "AB+"}' http://localhost:3000/api/members)
echo $MEMBER_RESPONSE | jq '.'
MEMBER_ID=$(echo $MEMBER_RESPONSE | jq -r '.id')

echo -e "\n--- 2. Testing Add Payment ---"
curl -s -X POST -H "Content-Type: application/json" -d "{\"memberId\": \"$MEMBER_ID\", \"amount\": 250, \"method\": \"online\"}" http://localhost:3000/api/payments | jq '.'

echo -e "\n--- 3. Testing Add Expense ---"
curl -s -X POST -H "Content-Type: application/json" -d '{"name": "Server Costs", "amount": "100", "category": "IT", "method": "card"}' http://localhost:3000/api/expenses | jq '.'

echo -e "\n--- 4. Testing Add Event ---"
curl -s -X POST -H "Content-Type: application/json" -d '{"title": "Software Launch Party", "date": "2026-06-01", "location": "Main Office", "description": "Celebrating the MySQL migration"}' http://localhost:3000/api/events | jq '.'

echo -e "\n--- 5. Testing Add Announcement (Broadcast) ---"
curl -s -X POST -H "Content-Type: application/json" -d '{"title": "System Migrated Successfully", "message": "The system is now fully live on MySQL.", "type": "all"}' http://localhost:3000/api/announcements | jq '.'

