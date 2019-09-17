# DAML Chat App

![Screenshot](doc/screenshot.png)

## Credits

UI shamelessly stolen from [React Direct Messaging Example by Pusher](https://pusher.com/tutorials/react-direct-messaging).

## Setup

Requirements:
  - `node` (`brew install node`)
  - [`daml sdk`](https://docs.daml.com/getting-started/installation.html)

## Running

First run `npm install` to install required dependencies.

`npm start` will:
  - Build the DAML project
  - Start the sandbox using the DAML project
  - Start the json-api pointed at sandbox
  - Start the React app using the live reloading dev server and open a browser

## Chat Usage

**Commands:**
  - `/create my new room`: Creates a new chat room
  - `/invite Bob`: Invite a party to join the chat room
  - `/giphy Of course this works`: because why not?

**Features:**
 - DAML syntax highlighting of code blocks with ` ```daml`

## Building

  - `npm run clean` will remove built artifacts from `build` and `.daml`.
  - `npm run build` will build a DAR for the daml project and the static resources for the React application, then add the web content to a `ui` directory in the built DAR.