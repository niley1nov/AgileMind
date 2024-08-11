Here’s the updated version with the additional details:

---

### Steps to Test the Application

1. **Clone the Repository:**
   - Get the code from the GitHub repository and clone it to your local machine.

2. **Ensure Node.js is Installed:**
   - Make sure you have Node.js installed, version 20 or higher.

3. **Set Up the Server:**
   - Navigate to the `server` folder.
   - Run the following command to install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file in the `server` folder by copying the contents of the `.env.example` file.
   - Update the following environment variables in the `.env` file:
     - `MONGODB_URI` (We have given this URI in the "Testing instructions" of submitted form)
     - `JWT_SECRET_TOKEN` (You can use this sample token if you don't want to generate a new one: `9772fc935a8cbea24b63ecb0767dd1a06dc2bc6a`)
     - `GEMINI_API_TOKEN`
   - Start the server by running:
     ```bash
     node index.js
     ```

4. **Set Up the Client:**
   - Navigate to the `client` folder.
   - Run the following command to install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file in the `client` folder by copying the contents of the `.env.example` file.
   - Update the `VITE_APP_API_URL` variable in the `.env` file with:
     ```bash
     VITE_APP_API_URL=http://localhost:3000/api
     ```
     - (Ensure to check the port number if it differs in your case.)

5. **Run the React Application:**
   - Start the React application by running:
     ```bash
     npm run dev
     ```

6. **Open the React Application:**
 - Open the react application in the browser, you will get the URL from above command
    
---

These steps will guide you through setting up and testing the application on your local machine.