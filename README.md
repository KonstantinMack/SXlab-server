# SX Lab server

Back-end server for SX Lab, a dashboard using data from sx.bet.

The betting industry is being revolutionised by blockchain technology right now. New web3 betting exchanges like sx.bet make the betting process more secure, fair, and a lot more transparent. SX Lab utilises this transparency to help the average bettor become more successful. On SX Lab you can not just analyse your own bets to find your edge over the market but you can also investigate other wallets and follow them if you like their performance. Whenever your followed tipsters place a bet you’ll be notified so you can join in on the action and share their success.

## Installation:

- create `.env` file following the structure from the `.env.sample` file
- run `npm install`
- create a database called `sxlab` and adjust the settings in `knexfile.js`
- download the database snapshot from [here](https://drive.google.com/file/d/1IHRR8PYtyDz-6KbWqPloFI3AiMbVfEW_/view?usp=sharing)
- import the database tables using the database snapshot (this means there is no need for running through the migration files)
- run `npm start`

You can find the front-end client of the project [here](https://github.com/KonstantinMack/SXlab-client).

## Tech Stack:

- Node
- Express
- MySql
- Knex
- Objection
