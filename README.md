# Lucid Journal

## Introduction
Welcome to the Lucid Journal project! This master README provides an overview of both the Lucid Journal app and the backend server. The project aims to create a comprehensive platform for exploring and understanding dreams with the help of AI.

![image](https://github.com/cp-james-harbeck/LucidJournal/assets/76927280/a7873405-b9bd-4a8d-9c55-5ea577b89feb)

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

## Lucid Journal backend server
The Lucid Journal backend server of the project is responsible for managing dream data, analyzing dream entries, and generating dream-inspired images using AI models like GPT-3.5/4 and DALLE 2.

## Packages
We utilize several agent-centric python packages from the [Autonomous Research Group](https://github.com/AutonomousResearchGroup).

- https://github.com/AutonomousResearchGroup/agentmemory
- https://github.com/AutonomousResearchGroup/easycompletion
- https://github.com/AutonomousResearchGroup/agentlogger

### Setup
To set up the Lucid Journal backend server, follow these steps:

1. Install Python: Visit the official Python website and download the latest version of Python for your operating system.

2. Install the required dependencies using pip:
   ```
   pip install -r requirements.txt
   ```

3. Create a "config.ini" file: In the same directory as the API code, create a "config.ini" file and add the following content:
   ```
   [openai]
   api_key=YOUR_OPENAI_API_KEY
   ```
   Replace "YOUR_OPENAI_API_KEY" with your actual OpenAI API key.

### Running the API with ngrok
To expose the API locally and access it from the Dream Guide app running on Expo, you can use ngrok. Follow these steps:

1. Install ngrok: Visit the ngrok website and download the appropriate version for your operating system.

2. In the terminal, navigate to the directory containing the Lucid Journal backend server.

3. Run the command to start ngrok and forward requests to the local API server on port 5000:
   ```
   ngrok http 5000
   ```

4. ngrok will generate a temporary public URL (e.g., `http://xxxxxxx.ngrok.io`) that forwards requests to your local API server.

### API Endpoints
The Lucid Journal backend server provides several endpoints to interact with dream data and AI models. Some key endpoints include:

- **POST /api/dreams**: Create a new dream entry.
- **PUT /api/dreams/{dream_id}**: Update the analysis and image of a specific dream entry.
- **GET /api/dreams**: Get all saved dream entries.
- **GET /api/dreams/{dream_id}**: Get details of a specific dream entry.
- **GET /api/dreams/{dream_id}/analysis**: Get the analysis of a specific dream entry.
- **GET /api/dreams/{dream_id}/image**: Get the AI-generated dream-inspired image for a specific dream entry.
- **POST /api/chat**: Have interactive conversations with the AI dream guide.
- **POST /api/dreams/search**: Search for dream entries based on keywords.
- **POST /api/dreams/search-chat**: Have AI-guided conversations with the AI dream guide and relevant dream entries found in the database.

### Running the API
To start the API server, execute the following command:

```
python server.py
```

By default, the API will run on `http://127.0.0.1:5000/`, and you can make requests to the API using tools like Postman or integrate it into your own applications.

## Conclusion
The Lucid Journal project aims to empower users to explore the realm of dreams and gain insights from various perspectives with the help of AI. The Dream Guide app provides a user-friendly interface, while the Lucid Journal backend server offers powerful functionalities for dream analysis and image generation.

Happy Dreaming!
