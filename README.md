# Lucid Journal

## Introduction
Welcome to the Lucid Journal project! This master README provides an overview of both the Lucid Journal app and the backend server. The project aims to create a comprehensive platform for exploring and understanding dreams with the help of AI.

![image](assets\journal.png)

## What is it?
Lucid Journal is a cutting-edge mobile application designed as a personal AI dream guide. It helps users understand their dreams better, providing insights, analysis, and image generation based on dream entries. The app uses React Native and integrates with a python backend server for various functionalities.

### Getting Started
To run the Dream Guide app on your local machine using Expo and ngrok, follow these steps:

1. Clone the Lucid Journal app repository.
2. Install dependencies using `npm install`.
3. Set the API URL in `config.js` to point to your ngrok URL (e.g., `http://xxxxxxx.ngrok.io/api`).
4. Run the app using `npm start`.

### Key Features
- **ChatScreen**: Enables users to have interactive conversations with the AI dream guide using predefined prompts or custom messages. The app fetches responses from the backend API and displays the conversation history.

- **NewDreamScreen**: Allows users to create new dream entries with title, date, and entry content. The app saves the dream data in the backend.

- **DreamsScreen**: Displays a list of saved dream entries, and users can search for specific dreams based on keywords.

- **DetailsScreen**: Shows detailed information about a specific dream entry, including the dream's analysis and the AI-generated dream image. Users can also regenerate the analysis and image.

- **RegenerateScreen**: Provides options to regenerate dream analysis and images for a specific dream entry, giving users more insights into their dreams.