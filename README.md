# ESIEE+ Discord Bot
## About the project
ESIEE+ bot is a discord bot developed in typescript to help students find available classrooms at ESIEE Paris. To do this, the bot retrieves the timetable for each class from Adesoft's ADE Planning software, using the [ade-planning-api](https://github.com/ilo80/ade-planning-api/) wrapper.

## Installation
### Using Node.js
1. Clone this repository:
   ```bash
   git clone https://github.com/ilo80/esiee-plus-bot.git
   cd esiee-plus-bot
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the environnement file:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Fill the required fields in the `.env` file
4. Start the bot:
   ```bash
   npm start
   ```

### Using Docker
1. Clone this repository:
   ```bash
   git clone https://github.com/ilo80/esiee-plus-bot.git
   cd esiee-plus-bot
   ```
2. Configure the environnement file:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Fill the required fields in the `.env` file
3. Start the bot with Docker Compose:
   ```bash
   docker compose up -d
   ```

## Configuration
The bot uses a `.env` file for its configuration. Below are the variables you need to set:

| Variables          | Description                                             |
|--------------------|---------------------------------------------------------|
| `DISCORD_TOKEN`    | Your Discord bot token                                  |
| `DISCORD_GUILD_ID` | The ID of the discord server where the bot will operate |
| `ADE_LINK`         | The URL of the ADE Planning instance                    |
| `ADE_USERNAME`     | Username to authenticate with ADE Planning              |
| `ADE_PASSWORD`     | Password to authenticate with ADE Planning              |

## Usage
Once the bot is running:
1. Invite it to your Discord server using the OAuth2 URL from the Discord Developer Portal
2. Interact with the bot using:
   - `/recherche_salle`: Find available rooms for a given period
   - `/ping`: Return bot latency
   - `/statut_salle`: Get status of a classroom, including its availability, lock status, board type, equipment, and capacity

## Contributing
Contributions are welcome! Here's how you can help:
1. Fork this repository
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes using conventional commit messages:
   - `feat: add new command to check room availability by building`
   - `fix: handle edge cases when ADE is unreachable`
   - `docs: update usage examples in README`
     
   Refer to [Conventional Commits](https://www.conventionalcommits.org/) for details
4. Push to your branch:
   ```bash
   git push origine feature/your-feature-name
   ```
5. Open a pull request

## License
This project is licensed under the [GPL 3.0 License](https://github.com/ilo80/esiee-plus-bot/blob/main/LICENSE.md)
