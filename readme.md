## What is this repo for
This repo is for module 6 group work written by ZIYANG WANG(459018) and MIAO GAO(458825).
Here is the [link](http://majorkevin.me:3456/index.html)

## Administration of user created chat rooms
+ Users can create a room by clicking on "create room". They can do this before or after log in to the website.
+ User can join rooms after they log into the website by clicking on the room list on the left.
+ Once users join the room, the members list will show up on the right of the website. The creator of this room will be showed at the first of this list.
+ Users can create rooms with a password (private rooms)
+ If you logged in as the creator of this room, you can kick out other members by clicking on "kick" button on the members list.
+ If you logged in as the creator of this room, you can kick out and ban other members by clicking on "kick&block" button on the members list.

## Messaging
+ Once a user send message in this room, the username and message will be visible to all other members in the room.
+ Users can send private messages to other users in the same room, simply by double clicking on other users in the members list.

## Best Practice
+ proper comments
+ HTML validation
+ node_modules folder is ignored by version control

## Account Information
|Username|Password|
|--------|--------|
|kevin|12345|
|miao|12345|
|kirk|12345|

Passwords for all private rooms are ```11111```

## Creative Portion
We use package ```sequelize``` and ```mysql2``` for node.js to connect to mysql database. Here we implement login and register by interacting with mysql database. We store hashed users' password in database and hashed private rooms' password in database for security consideration. Also, entering a private room need to interact with mysql database.