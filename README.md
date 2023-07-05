# Lucid Journal

Lucid Journal is a dream journaling application built with React Native and Express.js. It allows users to record their dreams and generate an AI-based analysis and image representation of each dream.

## Features

- Record dreams with a title, date, and detailed entry.
- View a list of all recorded dreams.
- View details of each dream, including an AI-generated analysis and image.
- Generate a new AI analysis and image for each dream.
- Overwrite the existing AI analysis and image with new ones.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js
- npm
- React Native
- Expo CLI
- An OpenAI API key

### Installation

1. Clone the repository:

```
git clone https://github.com/cp-james-harbeck/LucidJournal.git
```

2. Install the dependencies:

```
cd LucidJournal
npm install
```

3. Navigate to the `server` directory and install the server dependencies:

```
cd server
npm install
```

4. Create a `.env` file in the `server` directory and add your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key
```

### Running the Application

1. Start the server:

```
cd server
npm start
```

2. In a new terminal window, navigate to the root directory and start the React Native application:

```
cd ..
npm start
```

The Expo developer tools should open in your web browser. You can now run the app on your device using the Expo Go app, or in a simulator/emulator.

## Built With

- [React Native](https://reactnative.dev/) - The framework used for building the mobile application.
- [Expo](https://expo.dev/) - A platform for making universal native apps for Android, iOS, and the web with JavaScript and React.
- [Express.js](https://expressjs.com/) - The web application framework used for building the API.
- [OpenAI API](https://openai.com/) - Used to generate dream analysis and images.

## TODO

- Add OpenAI function calling for advanced AI cognition 
- Add embeddings and vectordb for storing data
- Add tags and labels for structured data
- Add a Mindmap for visualizing data
- Add advanced querying for searching data