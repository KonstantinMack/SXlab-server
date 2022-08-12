# SX Lab server

Back-end server for SX Lab, a dashboard using data from sx.bet.

## Installation:

- create `.env` file following the structure from the `.env.sample` file
- run `npm install`
- create a database called `sxlab` and adjust the settings in `knexfile.js`
- download the database snapshot from [here](https://drive.google.com/file/d/1IHRR8PYtyDz-6KbWqPloFI3AiMbVfEW_/view?usp=sharing)
- import the database tables using the database snapshot
- run `npm start`

You can find the front-end client of the project [here](https://github.com/KonstantinMack/SXlab-client).

## Tech Stack:

- Node
- Express
- MySql
- Knex
- Objection
