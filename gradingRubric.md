# Grading

In this creative project, we will try to implement a online ordering website, using Python/Django.
This grading rubric was approved by **Andrew McNeel** on Nov 15.

## Misc (30 points) 

Submit this rubric (5 points)

Python and Django framework are installed and setup.  (3 points)

Go through Django Official Documentation and tutorial (10 points)

Install Pycharm to have a professional ide for development (2 points)

Design tables properly with necessary foreign keys and constraints (5 points)

Web Pages are well organized and visually appealing (5 points)

## Authorization (15 points)

users can login to index page (3 points)

new users can register accounts (3 points)

Users can logout (3 points)

Password are hashed and checked securely (3 points)

A session is created when a user logs in (3 points)

## User Management (35 points)

Users are able to modify their personal informations including addresses, phone numbers and other informations. (10 points)

Users are able to check their orders as well as the information related to specific orders (5 points)

users are able to add different dishes from different restaurants to their cart (5 points)

users can view all dishes that a restaurant provides (5 points)

Users can modify their cart in the cart management page, including the number of a dish or delete something they don't want. (5 points)

Users can place orders which would be sent to the restaurant management page for restaurant keepers to see. (5 points)

## Best Practice (20 points)

Code is well formatted and easy to read, with proper commenting (3 points)

Safe from SQL Injection attacks (2 points)

Site follows the FIEO philosophy (3 points)

All pages pass the W3C validator (2 points)

CSRF tokens are passed when creating, editing, and deleting comments and stories (5 points)

All AJAX requests that either contain sensitive information or modify something on the server are performed via POST, not GET (3 points)

Page passes the W3C validator (2 points)

## Creative Portion (20 points)

Users have multiple address and they can choose one of them when placing orders. (5 points)

### Restaurant Management

Restaurant Keepers are able to check all orders with different status including pending, confirmed, completed orders, seperately or together. (5 points)

Restaurant Keepers have rights to accept or decline orders placed by users. (5 points)

Restaurant Keepers can add or delete products they provide. (5 points)