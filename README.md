# TinyApp Project
 TinyApp is a full-stack  web application built with Node and Express that allows users to shorten long URLs (a la bit.ly).

## Final Product
Login Page:
![image](https://user-images.githubusercontent.com/42853487/46564776-964db900-c8d7-11e8-98c5-421e70b7baca.png)

User's shortcut list
![image](https://user-images.githubusercontent.com/42853487/46564828-ca28de80-c8d7-11e8-843f-b4732dd8a30d.png)

Shortcut edit page
![image](https://user-images.githubusercontent.com/42853487/46564848-e167cc00-c8d7-11e8-93ab-66d13bf52b2d.png)



## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

==============================================================================

Default Usage:

List of user's links:
http://localhost:8080/urls

New shortcut:
/urls/new

View/Edit Shortcut (only available to creator of shortcut):
/urls/(id)
e.g.: http://localhost:8080/urls/9sm5xK

Link Redirector
/u/(id)
e.g.: http://localhost:8080/u/9sm5xK

Login Page:
/login

Registration Page:
/register
